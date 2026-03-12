from fastapi import APIRouter, Depends
from auth_utils import get_usuario_atual
from database import supabase
from models import PerfilUpdateSchema
from services.streak_service import calcular_streak

router = APIRouter(prefix='/usuarios', tags=['Usuarios'])

@router.get('/perfil')
async def perfil(usuario = Depends(get_usuario_atual)):
    return usuario

@router.patch('/perfil')
async def atualizar_perfil(
    dados: PerfilUpdateSchema,
    usuario = Depends(get_usuario_atual)
):
    updates = {k: v for k, v in dados.dict().items() if v is not None}
    if not updates:
        return usuario
    r = supabase.table('usuarios').update(updates)
    r = r.eq('id', usuario['id']).execute()
    return r.data[0]

@router.get('/streak')
async def streak(usuario = Depends(get_usuario_atual)):
    return calcular_streak(usuario['id'])
