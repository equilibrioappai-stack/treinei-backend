from fastapi import APIRouter, Depends
from auth_utils import get_usuario_atual
from database import supabase
from models import TreinoRequestSchema, AvaliacaoSchema
from services.ia_service import gerar_treino_ia
from services.progressao_service import resumo_progressao
from datetime import date

router = APIRouter(prefix='/treinos', tags=['Treinos'])

@router.post('/gerar')
async def gerar(
    request: TreinoRequestSchema,
    usuario = Depends(get_usuario_atual)
):
    # Buscar aparelhos do usuário
    aparelhos = supabase.table('aparelhos').select('*')
    aparelhos = aparelhos.eq('usuario_id', usuario['id']).execute().data
    # Buscar histórico dos últimos 30 dias
    historico = supabase.table('treinos').select('treino_json, data')
    historico = historico.eq('usuario_id', usuario['id'])
    historico = historico.order('data', desc=True).limit(30).execute().data
    # Gerar treino com IA
    treino = await gerar_treino_ia(usuario, aparelhos, historico, request)
    # Salvar no banco
    salvo = supabase.table('treinos').insert({
        'usuario_id': usuario['id'],
        'data': str(date.today()),
        'grupo_muscular': treino.get('grupo_muscular', 'misto'),
        'treino_json': treino,
        'energia_dia': request.energia,
        'tempo_disponivel': request.tempo_disponivel,
    }).execute()
    return salvo.data[0]

@router.get('/historico')
async def historico(usuario = Depends(get_usuario_atual)):
    r = supabase.table('treinos').select('*')
    r = r.eq('usuario_id', usuario['id'])
    r = r.order('data', desc=True).limit(60).execute()
    return r.data

@router.post('/avaliar')
async def avaliar(
    dados: AvaliacaoSchema,
    usuario = Depends(get_usuario_atual)
):
    supabase.table('treinos').update({'avaliacao': dados.avaliacao})
    supabase.table('treinos').update({'avaliacao': dados.avaliacao})
    supabase.table('treinos').update({'avaliacao': dados.avaliacao})
    supabase.table('treinos') \
        .update({'avaliacao': dados.avaliacao}) \
        .eq('id', dados.treino_id) \
        .eq('usuario_id', usuario['id']) \
        .execute()
    return {'mensagem': 'Avaliação salva ✅'}

@router.get('/progressao')
async def progressao(usuario = Depends(get_usuario_atual)):
    return {'sugestoes': resumo_progressao(usuario['id'])}