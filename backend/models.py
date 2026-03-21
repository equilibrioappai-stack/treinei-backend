from pydantic import BaseModel
from typing import Optional

class CadastroSchema(BaseModel):
    email: str
    senha: str
    nome: str
    idade: Optional[int] = None
    peso: Optional[float] = None
    altura: Optional[int] = None
    objetivo: Optional[str] = None  # hipertrofia | emagrecimento | forca
    nivel: Optional[str] = None     # iniciante | intermediario | avancado
    restricoes: Optional[str] = None

class LoginSchema(BaseModel):
    email: str
    senha: str

class TreinoRequestSchema(BaseModel):
    energia: str            # alta | media | baixa
    tempo_disponivel: int   # minutos
    foco: Optional[str] = None

class AparelhoSchema(BaseModel):
    nome: str
    grupo_muscular: Optional[str] = None
    tipo: Optional[str] = None

class AvaliacaoSchema(BaseModel):
    treino_id: str
    avaliacao: int  # 1 a 5

class PerfilUpdateSchema(BaseModel):
    nome: Optional[str] = None
    peso: Optional[float] = None
    altura: Optional[int] = None
    idade: Optional[int] = None
    objetivo: Optional[str] = None
    nivel: Optional[str] = None
    restricoes: Optional[str] = None
    expo_push_token: Optional[str] = None
