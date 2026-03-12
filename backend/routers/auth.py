from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from models import CadastroSchema, LoginSchema
from auth_utils import (
    hash_senha, verificar_senha,
    criar_access_token, criar_refresh_token, revogar_token
)
from database import supabase

router = APIRouter(prefix='/auth', tags=['Auth'])
limiter = Limiter(key_func=get_remote_address)

@router.post('/cadastro')
async def cadastro(dados: CadastroSchema):
    existente = supabase.table('usuarios').select('id')
    existente = existente.eq('email', dados.email).execute()
    if existente.data:
        raise HTTPException(400, 'E-mail já cadastrado')
    novo = supabase.table('usuarios').insert({
        'email': dados.email,
        'senha_hash': hash_senha(dados.senha),
        'nome': dados.nome,
        'idade': dados.idade,
        'peso': dados.peso,
        'altura': dados.altura,
        'objetivo': dados.objetivo,
        'nivel': dados.nivel,
        'restricoes': dados.restricoes,
    }).execute()
    usuario = novo.data[0]
    return {
        'access_token': criar_access_token(usuario['id']),
        'refresh_token': criar_refresh_token(usuario['id']),
        'usuario': usuario,
    }

@router.post('/login')
@limiter.limit('5/minute')
async def login(request: Request, dados: LoginSchema):
    r = supabase.table('usuarios').select('*').eq('email', dados.email).execute()
    if not r.data:
        raise HTTPException(401, 'E-mail ou senha incorretos')
    usuario = r.data[0]
    if not verificar_senha(dados.senha, usuario['senha_hash']):
        raise HTTPException(401, 'E-mail ou senha incorretos')
    return {
        'access_token': criar_access_token(usuario['id']),
        'refresh_token': criar_refresh_token(usuario['id']),
        'usuario': usuario,
    }

@router.post('/logout')
async def logout(token: str):
    revogar_token(token)
    return {'mensagem': 'Logout realizado com sucesso'}
