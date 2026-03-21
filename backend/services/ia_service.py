import hashlib
import json
import redis as redis_lib
from config import settings

redis_client = redis_lib.from_url(settings.redis_url, decode_responses=True)
CACHE_TTL = 86400

BIBLIOTECA_EXERCICIOS = {
    "quadriceps": [
        "Leg Press 45", "Leg Press Horizontal", "Leg Press Unilateral",
        "Cadeira Extensora", "Cadeira Extensora Unilateral", "Cadeira Extensora Isometrica",
        "Agachamento Hack Machine", "Agachamento no Smith", "Agachamento Goblet",
        "Passada com Halteres", "Afundo no Smith", "Afundo Bulgaro",
        "Step Up no Banco", "Wall Sit Isometrico", "Sissy Squat Assistido"
    ],
    "posterior_coxa": [
        "Mesa Flexora", "Mesa Flexora Unilateral", "Mesa Flexora Sentada",
        "Stiff com Halteres", "Stiff no Smith", "Stiff Unilateral",
        "Levantamento Terra Romano", "Good Morning", "Nordic Curl",
        "Flexora no Cabo", "Pull Through no Cabo", "Kettlebell Swing",
        "Glute Ham Raise", "Flexora em Pe", "Flexora em Pe Unilateral"
    ],
    "gluteos": [
        "Hip Thrust com Barra", "Hip Thrust no Smith", "Hip Thrust Unilateral",
        "Ponte de Gluteo", "Ponte de Gluteo Unilateral", "Coice no Cabo",
        "Coice na Maquina", "Abducao de Quadril na Maquina", "Abducao com Banda",
        "Kickback na Maquina", "Elevacao Pelvica no Banco", "Agachamento Sumo",
        "Passada Longa", "Step Up Alto", "Glute Bridge com Banda"
    ],
    "peito": [
        "Supino Reto com Halteres", "Supino Inclinado com Halteres", "Supino Declinado",
        "Chest Press Maquina", "Supino Maquina Articulada", "Peck Deck",
        "Crucifixo com Halteres", "Crucifixo Inclinado", "Crucifixo no Cabo",
        "Crossover no Cabo", "Crossover Alto", "Crossover Baixo",
        "Flexao de Braco", "Press Maquina Hammer", "Pullover com Halter"
    ],
    "costas": [
        "Puxada Frente Aberta", "Puxada Frente Fechada", "Puxada Frente Supinada",
        "Remada Baixa no Cabo", "Remada Unilateral com Halter", "Remada Maquina Articulada",
        "Remada Curvada com Halter", "Remada Sentada Maquina", "Remada Cavalinho",
        "Pulldown no Cabo", "Pullover no Cabo", "Pullover Maquina",
        "Face Pull", "Remada Invertida", "Remada T-Bar"
    ],
    "ombros": [
        "Desenvolvimento com Halteres", "Desenvolvimento Maquina", "Arnold Press",
        "Elevacao Lateral com Halteres", "Elevacao Lateral no Cabo", "Elevacao Lateral Maquina",
        "Elevacao Frontal com Halteres", "Elevacao Frontal no Cabo", "Elevacao Frontal Alternada",
        "Crucifixo Inverso", "Crucifixo Inverso no Peck Deck", "Face Pull com Corda",
        "Remada Alta no Cabo", "Elevacao Lateral 1.5", "Press Maquina Hammer"
    ],
    "biceps": [
        "Rosca Direta com Halteres", "Rosca Alternada", "Rosca Alternada Inclinado",
        "Rosca Scott", "Rosca Scott Maquina", "Rosca Concentrada",
        "Rosca Martelo", "Rosca Martelo Alternada", "Rosca Martelo no Cabo",
        "Rosca Inversa com Barra", "Rosca 21", "Rosca Spider",
        "Rosca Unilateral no Cabo", "Rosca Zottman", "Rosca no Banco Inclinado"
    ],
    "triceps": [
        "Triceps Corda", "Triceps Barra Reta", "Triceps Barra V",
        "Triceps Unilateral no Cabo", "Triceps Testa com Halteres", "Triceps Frances com Halter",
        "Triceps Frances no Cabo", "Triceps Coice com Halter", "Triceps Banco",
        "Mergulho em Paralelas", "Triceps Maquina", "Extensao de Triceps Overhead",
        "Triceps Corda Unilateral", "Triceps Kickback Maquina", "Triceps Smith"
    ],
    "core": [
        "Prancha", "Prancha Lateral", "Prancha com Toque no Ombro",
        "Abdominal na Maquina", "Crunch no Cabo", "Crunch com Peso",
        "Elevacao de Pernas", "Elevacao de Pernas no Banco", "Russian Twist com Peso",
        "Woodchopper no Cabo", "Dead Bug", "Hollow Hold",
        "Mountain Climber", "Ab Wheel", "Abdominal Infra Suspenso"
    ]
}

SYSTEM_PROMPT = f'''
Voce e IronCoach, personal trainer brasileiro especialista em musculacao, hipertrofia e emagrecimento.
Fale sempre com calor humano e motivacao real — como um bom personal trainer, nao um robo.

REGRAS FUNDAMENTAIS:
1. Responda SOMENTE JSON valido — sem markdown, sem texto fora do JSON
2. NUNCA repita exercicios presentes em historico_exercicios
3. Varie padroes biomecânicos dentro do mesmo grupo muscular
4. Adapte volume ao tempo disponivel
5. Respeite TODAS as restricoes fisicas — sugira alternativas seguras
6. Use APENAS exercicios da biblioteca abaixo — nao invente outros
7. Se energia baixa: reduza volume, mantenha tecnica

BIBLIOTECA DE EXERCICIOS DISPONIVEL:
{json.dumps(BIBLIOTECA_EXERCICIOS, ensure_ascii=False, indent=2)}

REGRAS DE VARIACAO BIOMECANICA:
- Quadriceps: combine joelho dominante (Leg Press) + extensao (Extensora) + unilateral (Passada)
- Posterior: combine hinge (Stiff) + flexao joelho (Mesa Flexora) + gluteo dominante (Hip Thrust)
- Peito: combine empurrar horizontal + isolamento + angulo diferente (inclinado/declinado)
- Costas: combine puxar vertical (Puxada) + puxar horizontal (Remada) + isolamento
- Ombro: combine press + elevacao lateral + posterior (Face Pull)

SERIES E REPETICOES — NUNCA USE VALORES FIXOS IGUAIS:
- Use series progressivas: 15/12/10/8 ou 12/10/10/8 ou 15/12/10
- Iniciante: 2-3 series, 12-15 reps, cargas leves
- Intermediario: 3-4 series, 8-12 reps progressivas
- Avancado: 4-5 series, 6-12 reps com tecnicas avancadas
- DROP SET apenas no exercicio principal, ultima serie

CADENCIA QUANDO RELEVANTE:
- "desça em 3 segundos controlando"
- "suba explosivo, desça controlado"
- "segure 2 segundos no topo"

QUANTIDADE POR TEMPO:
- 30 min: 4-5 exercicios, 2-3 series, descanso 45s
- 45 min: 5-6 exercicios, 3 series, descanso 60s
- 60 min: 6-8 exercicios, 3-4 series, descanso 60-75s
- 90 min: 8-10 exercicios, 4-5 series, descanso 75-90s

RESTRICOES FISICAS — FILTROS OBRIGATORIOS:
- dor_ombro: evitar empurrar_vertical, elevacao_lateral com carga alta
- dor_lombar: evitar stiff, remada curvada, agachamento livre
- dor_joelho: evitar extensora, passada funda
- labirintite: evitar movimentos explosivos, exercicios instáveis

FORMATO JSON OBRIGATORIO:
{{
  "grupo_muscular": "nome do grupo",
  "exercicios": [
    {{
      "nome": "Nome exato da biblioteca",
      "series": 4,
      "repeticoes": "15/12/10/10",
      "descanso_segundos": 60,
      "aparelho": "Nome do aparelho",
      "padrao_movimento": "joelho_dominante",
      "dica_tecnica": "Dica especifica de posicionamento e cadencia",
      "drop_set": false,
      "motivo": "Por que este exercicio neste treino em 1 linha"
    }}
  ],
  "aquecimento": {{
    "instrucoes": "Aquecimento especifico para o grupo do dia",
    "duracao_minutos": 5
  }},
  "finalizacao": {{
    "instrucoes": "Alongamento focado nos musculos trabalhados",
    "duracao_minutos": 5
  }},
  "mensagem_motivacional": "Mensagem calorosa e personalizada do IronCoach para esta pessoa"
}}
'''

generation_config = {
    'temperature': 0.9,
    'max_output_tokens': 8192,
}

def categorizar_porte(peso: float, altura: int) -> str:
    if not peso or not altura:
        return 'medio'
    imc = peso / ((altura / 100) ** 2)
    if imc < 18.5:  return 'leve'
    elif imc < 25:  return 'medio'
    elif imc < 30:  return 'medio-grande'
    else:           return 'grande'

RESTRICOES_MAP = {
    'ombro':    ['ombro', 'rotador', 'manguito'],
    'lombar':   ['lombar', 'costas', 'hernia', 'disco'],
    'joelho':   ['joelho', 'menisco', 'ligamento'],
    'cotovelo': ['cotovelo', 'tendinite'],
    'labirintite': ['labirintite', 'labirin', 'tontura', 'vertigem'],
}

def categorizar_restricoes(texto: str) -> list:
    texto = (texto or '').lower()
    cats = [c for c, kws in RESTRICOES_MAP.items() if any(k in texto for k in kws)]
    return cats or ['nenhuma']

def montar_prompt(usuario, aparelhos, historico, request) -> str:
    porte = categorizar_porte(usuario.get('peso'), usuario.get('altura'))
    restricoes = categorizar_restricoes(usuario.get('restricoes') or '')
    historico_exercicios = list(set(
        ex.get('nome') for t in historico
        for ex in t.get('treino_json', {}).get('exercicios', [])
        if ex.get('nome')
    ))
    aparelhos_lista = [a['nome'] for a in aparelhos] if aparelhos else []

    return f'''
PERFIL DO USUARIO:
- nivel: {usuario.get('nivel', 'iniciante')}
- objetivo: {usuario.get('objetivo', 'hipertrofia')}
- porte: {porte}
- restricoes_fisicas: {restricoes}
- idade: {usuario.get('idade', 'nao informada')}

HOJE:
- energia: {request.energia}
- tempo_disponivel: {request.tempo_disponivel} min
- foco_grupo_muscular: {request.foco or 'livre — IA decide o melhor grupo'}

APARELHOS_DISPONIVEIS: {aparelhos_lista if aparelhos_lista else 'academia completa padrao'}

HISTORICO_EXERCICIOS_ULTIMOS_30_DIAS (NAO REPETIR):
{historico_exercicios}

Monte um treino variado, profissional e personalizado seguindo todas as regras do SYSTEM_PROMPT.
Use exercicios diferentes dos que estao no historico.
Varie os padroes biomecânicos conforme as regras.
'''

def _cache_key(usuario, aparelhos, request) -> str:
    params = {
        'nivel':     usuario.get('nivel'),
        'objetivo':  usuario.get('objetivo'),
        'energia':   request.energia,
        'tempo':     request.tempo_disponivel,
        'foco':      request.foco,
        'aparelhos': sorted([a['nome'] for a in aparelhos]) if aparelhos else [],
    }
    h = hashlib.md5(json.dumps(params, sort_keys=True).encode()).hexdigest()
    return f'treino:{h}'

async def _chamar_gemini(prompt: str) -> dict:
    import google.generativeai as genai
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(
        'gemini-2.5-flash',
        generation_config=generation_config,
        system_instruction=SYSTEM_PROMPT,
    )
    r = model.generate_content(prompt)
    text = r.text.strip()
    if text.startswith('```'):
        text = text.split('```')[1]
        if text.startswith('json'):
            text = text[4:]
    text = text.strip()
    return json.loads(text)

async def _chamar_deepseek(prompt: str) -> dict:
    import httpx
    if not settings.deepseek_api_key:
        raise ValueError('DEEPSEEK_API_KEY nao configurada')
    async with httpx.AsyncClient(timeout=60) as client:
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