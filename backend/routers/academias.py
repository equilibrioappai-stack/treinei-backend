from fastapi import APIRouter, Depends
from auth_utils import get_usuario_atual
from database import supabase

router = APIRouter(prefix='/academias', tags=['Academias'])

@router.post('/')
async def criar(
    nome: str,
    cidade: str = None,
    estado: str = None,
    usuario = Depends(get_usuario_atual)
):
    r = supabase.table('academias').insert({
        'nome': nome,
        'cidade': cidade,
        'estado': estado,
        'admin_id': usuario['id'],
    }).execute()
    return r.data[0]

@router.get('/{academia_id}')
async def buscar(academia_id: str):
    r = supabase.table('academias').select('*')
    r = r.eq('id', academia_id).single().execute()
    return r.data
