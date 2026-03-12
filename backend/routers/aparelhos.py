from fastapi import APIRouter, Depends, HTTPException
from auth_utils import get_usuario_atual
from database import supabase
from models import AparelhoSchema

router = APIRouter(prefix='/aparelhos', tags=['Aparelhos'])

PERFIS = {
    'academia_completa': [
        {'nome': 'Supino Reto',      'grupo_muscular': 'peito',  'tipo': 'livre'},
        {'nome': 'Leg Press',        'grupo_muscular': 'perna',  'tipo': 'maquina'},
        {'nome': 'Pulley',           'grupo_muscular': 'costas', 'tipo': 'cabo'},
        {'nome': 'Smith',            'grupo_muscular': 'misto',  'tipo': 'maquina'},
        {'nome': 'Rack',             'grupo_muscular': 'misto',  'tipo': 'livre'},
        {'nome': 'Halteres',         'grupo_muscular': 'misto',  'tipo': 'livre'},
        {'nome': 'Barra',            'grupo_muscular': 'misto',  'tipo': 'livre'},
        {'nome': 'Cadeira Extensora','grupo_muscular': 'perna',  'tipo': 'maquina'},
        {'nome': 'Mesa Flexora',     'grupo_muscular': 'perna',  'tipo': 'maquina'},
        {'nome': 'Peck Deck',        'grupo_muscular': 'peito',  'tipo': 'maquina'},
        {'nome': 'Puxador Alto',     'grupo_muscular': 'costas', 'tipo': 'cabo'},
        {'nome': 'Remada Baixa',     'grupo_muscular': 'costas', 'tipo': 'cabo'},
    ],
    'academia_basica': [
        {'nome': 'Halteres','grupo_muscular': 'misto','tipo': 'livre'},
        {'nome': 'Barra',   'grupo_muscular': 'misto','tipo': 'livre'},
        {'nome': 'Leg Press','grupo_muscular': 'perna','tipo': 'maquina'},
        {'nome': 'Pulley',  'grupo_muscular': 'costas','tipo': 'cabo'},
    ],
    'em_casa': [
        {'nome': 'Halteres',    'grupo_muscular': 'misto','tipo': 'livre'},
    {'nome': 'Peso corporal','grupo_muscular':'misto','tipo': 'peso_corporal'},
        {'nome': 'Elástico',    'grupo_muscular': 'misto','tipo': 'livre'},
    ],
}

@router.post('/perfil/{nome_perfil}')
async def aplicar_perfil(nome_perfil: str, usuario = Depends(get_usuario_atual)):
    if nome_perfil not in PERFIS:
        raise HTTPException(400, f'Perfis: {list(PERFIS.keys())}')
    supabase.table('aparelhos').delete().eq('usuario_id', usuario['id']).execute()
    for ap in PERFIS[nome_perfil]:
        supabase.table('aparelhos').insert(
            {**ap, 'usuario_id': usuario['id']}
        ).execute()
    return {'mensagem': f'Perfil {nome_perfil} aplicado', 'total': len(PERFIS[nome_perfil])}

@router.get('/')
async def listar(usuario = Depends(get_usuario_atual)):
    r = supabase.table('aparelhos').select('*').eq('usuario_id', usuario['id']).execute()
    return r.data

@router.post('/')
async def adicionar(dados: AparelhoSchema, usuario = Depends(get_usuario_atual)):
    r = supabase.table('aparelhos').insert(
        {**dados.dict(), 'usuario_id': usuario['id']}
    ).execute()
    return r.data[0]

@router.delete('/{aparelho_id}')
async def remover(aparelho_id: str, usuario = Depends(get_usuario_atual)):
    supabase.table('aparelhos').delete()
    supabase.table('aparelhos').delete() \
        .eq('id', aparelho_id) \
        .eq('usuario_id', usuario['id']) \
        .execute()
    return {'mensagem': 'Aparelho removido'}
