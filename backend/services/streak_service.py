import datetime
from database import supabase

def calcular_streak(usuario_id: str) -> dict:
    r = supabase.table('treinos').select('data') \
        .eq('usuario_id', usuario_id) \
        .order('data', desc=True).limit(90).execute()
    if not r.data:
        return {'streak_atual': 0, 'recorde': 0, 'treinou_hoje': False}
    datas        = sorted(set(x['data'] for x in r.data), reverse=True)
    hoje         = datetime.date.today()
    ontem        = hoje - datetime.timedelta(days=1)
    treinou_hoje = datas[0] == str(hoje)
    if datetime.date.fromisoformat(datas[0]) < ontem:
        return {'streak_atual': 0, 'recorde': _recorde(datas), 'treinou_hoje': False}
    streak, esperada = 0, (hoje if treinou_hoje else ontem)
    for d in datas:
        if datetime.date.fromisoformat(d) == esperada:
            streak  += 1
            esperada -= datetime.timedelta(days=1)
        else:
            break
    return {
        'streak_atual':  streak,
        'recorde':       max(streak, _recorde(datas)),
        'treinou_hoje':  treinou_hoje,
    }

def _recorde(datas: list) -> int:
    if not datas: return 0
    mx = at = 1
    for i in range(1, len(datas)):
        d1 = datetime.date.fromisoformat(datas[i-1])
        d2 = datetime.date.fromisoformat(datas[i])
        at = (at + 1) if (d1 - d2).days == 1 else 1
        mx = max(mx, at)
    return mx
