import jwt
import bcrypt
import redis as redis_lib
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from config import settings
from database import supabase

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/auth/login')
redis_client = redis_lib.from_url(settings.redis_url, decode_responses=True)

def hash_senha(senha: str) -> str:
    return bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verificar_senha(senha: str, hash: str) -> bool:
    return bcrypt.checkpw(senha.encode('utf-8'), hash.encode('utf-8'))

def criar_access_token(usuario_id: str) -> str:
    exp = datetime.utcnow() + timedelta(minutes=60)
    return jwt.encode(
        {'sub': usuario_id, 'exp': exp, 'type': 'access'},
        settings.secret_key, algorithm='HS256'
    )

def criar_refresh_token(usuario_id: str) -> str:
    exp = datetime.utcnow() + timedelta(days=30)
    return jwt.encode(
        {'sub': usuario_id, 'exp': exp, 'type': 'refresh'},
        settings.secret_key, algorithm='HS256'
    )

def revogar_token(token: str):
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=['HS256'])
        ttl = max(int(payload.get('exp', 0) - datetime.utcnow().timestamp()), 1)
        redis_client.setex(f'blacklist:{token}', ttl, '1')
    except Exception:
        pass

async def get_usuario_atual(token: str = Depends(oauth2_scheme)) -> dict:
    if redis_client.exists(f'blacklist:{token}'):
        raise HTTPException(401, 'Token revogado — faça login novamente')
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=['HS256'])
        usuario_id = payload.get('sub')
        if not usuario_id:
            raise HTTPException(401, 'Token inválido')
        r = supabase.table('usuarios').select('*').eq('id', usuario_id).single().execute()
        return r.data
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, 'Token expirado — faça login novamente')
    except Exception:
        raise HTTPException(401, 'Token inválido')
