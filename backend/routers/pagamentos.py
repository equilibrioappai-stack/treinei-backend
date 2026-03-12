import stripe
from fastapi import APIRouter, Request, Depends, HTTPException
from auth_utils import get_usuario_atual
from config import settings
from database import supabase

router = APIRouter(prefix='/pagamentos', tags=['Pagamentos'])
stripe.api_key = settings.stripe_key

PRECOS = {
    'individual_mensal': 'price_MENSAL_ID',   # substituir após criar no Stripe
    'individual_anual':  'price_ANUAL_ID',    # R$199/ano
    'academia_mensal':   'price_ACADEMIA_ID', # R$199/mês
}

@router.post('/criar-sessao')
async def criar_sessao(plano: str, usuario = Depends(get_usuario_atual)):
    if plano not in PRECOS:
        raise HTTPException(400, f'Planos: {list(PRECOS.keys())}')
    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{'price': PRECOS[plano], 'quantity': 1}],
        mode='subscription',
        success_url=f'{settings.app_url}/pagamento/sucesso',
        cancel_url=f'{settings.app_url}/pagamento/cancelado',
        metadata={'usuario_id': usuario['id'], 'plano': plano},
    )
    return {'checkout_url': session.url}

@router.post('/webhook')
async def webhook(request: Request):
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload,
            request.headers.get('stripe-signature'),
            settings.stripe_webhook_secret,
        )
    except Exception:
        raise HTTPException(400, 'Assinatura inválida')
    if event['type'] == 'checkout.session.completed':
        s    = event['data']['object']
        tipo = 'academia' if 'academia' in s['metadata']['plano'] else 'individual'
        supabase.table('usuarios').update({
            'plano': tipo,
            'stripe_customer_id': s.get('customer'),
            'stripe_subscription_id': s.get('subscription'),
        }).eq('id', s['metadata']['usuario_id']).execute()
    elif event['type'] in ['customer.subscription.deleted', 'invoice.payment_failed']:
        sid = event['data']['object'].get('subscription') \
           or event['data']['object'].get('id')
        if sid:
            supabase.table('usuarios') \
                .update({'plano': 'free'}) \
                .eq('stripe_subscription_id', sid).execute()
    return {'status': 'ok'}

@router.get('/status')
async def status(usuario = Depends(get_usuario_atual)):
    r = supabase.table('usuarios').select('plano') \
        .eq('id', usuario['id']).single().execute()
    return {'plano': r.data.get('plano', 'free')}
