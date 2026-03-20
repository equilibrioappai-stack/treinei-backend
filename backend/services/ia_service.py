import hashlib
import json
import redis as redis_lib
from config import settings

redis_client = redis_lib.from_url(settings.redis_url, decode_responses=True)
CACHE_TTL = 86400

SYSTEM_PROMPT = '''
Você é IronCoach, personal trainer brasileiro experiente, empático e criterioso.
Fale sempre com calor humano — como um personal trainer real, não um robô.

REGRAS OBRIGATÓRIAS — nunca viole:
1. Responda SOMENTE JSON válido — sem markdown, sem texto fora do JSON
2. Use APENAS aparelhos da lista fornecida. Se a lista estiver vazia, assuma academia completa padrão com: Supino, Leg Press, Pulley, Smith Machine, Cadeira Extensora, Mesa Flexora, Peck Deck, Remada, Desenvolvimento, Rosca Direta, Triceps Corda, Agachamento Livre e Halteres.
3. NUNCA repita NENHUM exercício dos últimos 30 dias do histórico
4. Adapte intensidade ao nível de energia informado
5. Respeite TODAS as restrições físicas sem exceção
6. O tempo total deve caber no tempo disponível
7. Estruture: aquecimento → exercícios → finalização
8. Cada exercício: nome, series, repeticoes, descanso_segundos, aparelho, dica_tecnica
9. Varie padrões: empurrar / puxar / agachar / rotação

REGRAS DE QUANTIDADE E SERIES POR TEMPO:
- 30 min: 4-5 exercícios, 2-3 séries, 12-15 reps, descanso 45s
- 45 min: 6-7 exercícios, 3 séries, 10-12 reps, descanso 60s
- 60 min: 7-8 exercícios, 3-4 séries, 8-12 reps, descanso 75s
- 90 min: 9-10 exercícios, 4-5 séries, 6-10 reps, descanso 90s

REGRAS DE SERIES POR NIVEL:
- iniciante: 2-3 séries por exercício
- intermediario: 3-4 séries por exercício
- avancado: 4-5 séries por exercício

REGRAS DE ENERGIA:
- Alta: reps mais altas, descanso menor, mais series
- Media: valores intermediarios
- Baixa: reps menores, descanso maior, menos series e exercicios

FORMATO JSON OBRIGATORIO:
{
  "grupo_muscular": "nome do grupo",
  "exercicios": [
    {
      "nome": "Nome do Exercicio",
      "series": 3,
      "repeticoes": "10-12",
      "descanso_segundos": 60,
      "aparelho": "Nome do Aparelho",
      "dica_tecnica": "Dica curta e direta"
    }
  ],
  "aquecimento": {"instrucoes": "texto", "duracao_minutos": 5},
  "finalizacao": {"instrucoes": "texto", "duracao_minutos": 5},
  "mensagem_motivacional": "Mensagem calorosa e personalizada do IronCoach"
}
'''

generation_config = {
    'temperature': 0.8,
    'max_output_tokens': 8192,
}

def categorizar_porte(peso: float, altura: int) -> str:
    if not peso or not altura:
        return 'médio'
    imc = peso / ((altura / 100) ** 2)
    if imc < 18.5:  return 'leve'
    elif imc < 25:  return 'médio'
    elif imc < 30:  return 'médio-grande'
    else:           return 'grande'

RESTRICOES_MAP = {
    'ombro':    ['ombro', 'rotador', 'manguito'],
    'lombar':   ['lombar', 'costas', 'hérnia', 'disco'],
    'joelho':   ['joelho', 'menisco', 'ligamento'],
    'cotovelo': ['cotovelo', 'tendinite'],
}

def categorizar_restricoes(texto: str) -> list:
    texto = (texto or '').lower()
    cats = [c for c, kws in RESTRICOES_MAP.items() if any(k in texto for k in kws)]
    return cats or ['nenhuma']

def montar_prompt(usuario, aparelhos, historico, request) -> str:
    porte = categorizar_porte(usuario.get('peso'), usuario.get('altura'))
    restricoes = categorizar_restricoes(usuario.get('restricoes') or '')
    exercicios = list(set(
        ex.get('nome') for t in historico
        for ex in t.get('treino_json', {}).get('exercicios', [])
        if ex.get('nome')
    ))
    return f'''
    PERFIL: nivel={usuario.get('nivel')} objetivo={usuario.get('objetivo')}
    porte={porte} restricoes={restricoes}
    HOJE: energia={request.energia} tempo={request.tempo_disponivel}min
    foco={request.foco or 'livre'}
    APARELHOS_DISPONIVEIS: {[a['nome'] for a in aparelhos]}
    NAO_REPETIR_ULTIMOS_30_DIAS: {exercicios}
    '''

def _cache_key(usuario, aparelhos, request) -> str:
    params = {
        'nivel':     usuario.get('nivel'),
        'objetivo':  usuario.get('objetivo'),
        'energia':   request.energia,
        'tempo':     request.tempo_disponivel,
        'foco':      request.foco,
        'aparelhos': sorted([a['nome'] for a in aparelhos]),
    }
    h = hashlib.md5(json.dumps(params, sort_keys=True).encode()).hexdigest()
    return f'gemini:{h}'

async def _chamar_gemini(prompt: str) -> dict:
    import google.generativeai as genai
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(
        'gemini-2.5-flash',
        generation_config=generation_config,
        system_instruction=SYSTEM_PROMPT,
    )
    r = model.generate_content(prompt)
    text = r.text.strip().strip('```json').strip('```').strip()
    return json.loads(text)

async def _chamar_deepseek(prompt: str) -> dict:
    import httpx
    if not settings.deepseek_api_key:
        raise ValueError('DEEPSEEK_API_KEY não configurada')
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            'https://api.deepseek.com/chat/completions',
            headers={'Authorization': f'Bearer {settings.deepseek_api_key}'},
            json={
                'model': 'deepseek-chat',
                'messages': [
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user',   'content': prompt},
                ],
                'response_format': {'type': 'json_object'},
            },
        )
        resp = r.json()
        if 'choices' not in resp:
            raise ValueError(f'DeepSeek resposta inesperada: {resp}')
        return json.loads(resp['choices'][0]['message']['content'])

async def gerar_treino_ia(usuario, aparelhos, historico, request) -> dict:
    prompt  = montar_prompt(usuario, aparelhos, historico, request)
    cache_k = _cache_key(usuario, aparelhos, request)
    try:
        cached = redis_client.get(cache_k)
        if cached:
            return json.loads(cached)
    except Exception:
        pass
    try:
        resultado = await _chamar_gemini(prompt)
        try:
            redis_client.setex(cache_k, CACHE_TTL, json.dumps(resultado))
        except Exception:
            pass
        return resultado
    except Exception as e_gemini:
        try:
            return await _chamar_deepseek(prompt)
        except Exception as e_deep:
            raise RuntimeError(f'Gemini: {e_gemini} | DeepSeek: {e_deep}')