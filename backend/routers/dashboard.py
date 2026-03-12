from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from auth_utils import get_usuario_atual
from database import supabase

router = APIRouter(prefix='/dashboard', tags=['Dashboard'])

@router.get('/semanal')
async def semanal(usuario = Depends(get_usuario_atual)):
    hoje = datetime.now()
    ini      = (hoje - timedelta(days=7)).strftime('%Y-%m-%d')
    ini_ant  = (hoje - timedelta(days=14)).strftime('%Y-%m-%d')
    atual = supabase.table('treinos') \
        .select('grupo_muscular, data, avaliacao') \
        .eq('usuario_id', usuario['id']) \
        .gte('data', ini).execute()
    ant = supabase.table('treinos') \
        .select('grupo_muscular') \
        .eq('usuario_id', usuario['id']) \
        .gte('data', ini_ant).lt('data', ini).execute()
    treinos = atual.data or []
    grupos  = {}
    for tr in treinos:
        g = tr.get('grupo_muscular', 'outros')
        grupos[g] = grupos.get(g, 0) + 1
    avs = [tr['avaliacao'] for tr in treinos if tr.get('avaliacao')]
    return {
        'total_semana_atual':    len(treinos),
        'total_semana_passada':  len(ant.data or []),
        'variacao':              len(treinos) - len(ant.data or []),
        'grupos_musculares':     grupos,
        'media_avaliacao':       round(sum(avs)/len(avs),1) if avs else None,
    }
