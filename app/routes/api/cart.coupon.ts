/**
 * POST /api/cart/coupon  — apply coupon code
 * Body: { code: string }
 */
import { getDb } from '~/lib/db/mongodb';

function getSessionId(request: Request): string {
  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(/session_id=([^;]+)/);
  return match?.[1] ?? '';
}

function recalcTotals(items: Array<{ unit_price_aed: number; quantity: number }>, coupon: null | { type: string; value: number }) {
  const subtotal = items.reduce((sum, i) => sum + i.unit_price_aed * i.quantity, 0);
  let discount = 0;
  if (coupon) {
    discount = coupon.type === 'percent' ? subtotal * (coupon.value / 100) : Math.min(coupon.value, subtotal);
  }
  const total = Math.max(0, subtotal - discount);
  const item_count = items.reduce((sum, i) => sum + i.quantity, 0);
  return { subtotal: Math.round(subtotal * 100) / 100, discount: Math.round(discount * 100) / 100, shipping: 0, total: Math.round(total * 100) / 100, item_count };
}

export async function action({ request, context }: { request: Request; context: Record<string, unknown> }) {
  const env = (context.cloudflare?.env ?? context.env) as { MONGODB_URI: string; MONGODB_DB?: string };
  const db = await getDb(env);
  const sessionId = getSessionId(request);

  const body: { code?: string } = await request.json().catch(() => ({}));
  const { code } = body;

  if (!code || typeof code !== 'string') {
    return new Response(JSON.stringify({ error: 'Coupon code required' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const coupon = await db.collection('coupons').findOne({ code: code.toUpperCase() });

  if (!coupon) {
    return new Response(JSON.stringify({ error: 'Invalid coupon code' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (!coupon.active) {
    return new Response(JSON.stringify({ error: 'Coupon is not active' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return new Response(JSON.stringify({ error: 'Coupon has expired' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const cart = await db.collection('carts').findOne({ session_id: sessionId });
  const items = (cart?.items ?? []) as Array<{ unit_price_aed: number; quantity: number }>;

  if (coupon.min_purchase_aed) {
    const subtotal = items.reduce((sum, i) => sum + i.unit_price_aed * i.qty, 0);
    if (subtotal < coupon.min_purchase_aed) {
      return new Response(JSON.stringify({ error: `Minimum purchase of AED ${coupon.min_purchase_aed} required` }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }
  }

  const appliedCoupon = { code: coupon.code, type: coupon.type, value: coupon.value };
  const totals = recalcTotals(items, appliedCoupon);

  const base = cart ?? { session_id: sessionId, items: [] };
  const updated = { ...base, coupon: appliedCoupon, totals };
  await db.collection('carts').replaceOne({ session_id: sessionId }, updated, { upsert: true });

  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
