from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from config import settings

from routers import auth, usuarios, treinos, aparelhos
from routers import academias, pagamentos, dashboard

app = FastAPI(title='Treinei API', version='4.0')

# Rate limiter — evita ataques de força bruta
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — controla quem pode acessar o backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(','),
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Registrar todos os grupos de endpoints
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(treinos.router)
app.include_router(aparelhos.router)
app.include_router(academias.router)
app.include_router(pagamentos.router)
app.include_router(dashboard.router)

@app.get('/')
def raiz():
    return {'status': 'Treinei API v4.0 online ✅'}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
