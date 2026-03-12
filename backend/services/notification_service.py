import requests

EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

def enviar_push(expo_token: str, titulo: str, corpo: str, dados: dict = None) -> bool:
    if not expo_token or not expo_token.startswith('ExponentPushToken'):
        return False  # token inválido, não envia
    resp = requests.post(
        EXPO_PUSH_URL,
        json={
            'to':    expo_token,
            'title': titulo,
            'body':  corpo,
            'sound': 'default',
            'data':  dados or {},
        },
        headers={
            'Accept':       'application/json',
            'Content-Type': 'application/json',
        },
    )
    return resp.status_code == 200

def lembrete_treino(expo_token: str, nome: str, streak: int = 0) -> bool:
    if streak >= 7:
        titulo = f'🔥 {streak} dias seguidos!'
        corpo  = f'{nome}, não quebre a sequência agora!'
    elif streak >= 3:
        titulo = f'⚡ {streak} dias no streak!'
        corpo  = f'{nome}, continue assim — você está evoluindo!'
    else:
        titulo = 'Hora do treino! 💪'
        corpo  = f'{nome}, seu treino personalizado está pronto.'
    return enviar_push(expo_token, titulo, corpo, {'tipo': 'lembrete'})

