from database import supabase

def analisar_progressao(usuario_id: str, exercicio: str) -> dict:
    r = supabase.table('treinos') \
        .select('treino_json, avaliacao, data') \
        .eq('usuario_id', usuario_id) \
        .order('data', desc=True).limit(20).execute()
    avaliacoes = []
    for treino in (r.data or []):
        for ex in treino.get('treino_json', {}).get('exercicios', []):
            if ex.get('nome', '').lower() == exercicio.lower():
                av = treino.get('avaliacao')
                if av is not None:
                    avaliacoes.append(av)
                break
    if len(avaliacoes) < 2:
        return {'sugerir': False, 'ocorrencias': len(avaliacoes)}
    u, pu = avaliacoes[0], avaliacoes[1]
    if u >= 4 and pu >= 4:
        kg = '+2.5kg' if u == 4 else '+5kg'
        return {
            'sugerir':    True,
            'carga':      kg,
            'mensagem':   f'Tente {kg} hoje!',
            'confianca':  'alta' if u == 5 and pu == 5 else 'media',
        }
    return {'sugerir': False}

def resumo_progressao(usuario_id: str) -> list:
    r = supabase.table('treinos').select('treino_json') \
        .eq('usuario_id', usuario_id) \
        .order('data', desc=True).limit(7).execute()
    exercicios = set()
    for tr in (r.data or []):
        for ex in tr.get('treino_json', {}).get('exercicios', []):
            exercicios.add(ex.get('nome', ''))
    return [
        {'exercicio': ex, **analisar_progressao(usuario_id, ex)}
        for ex in exercicios if ex
    ]
