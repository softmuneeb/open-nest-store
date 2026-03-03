/**
 * PUT    /api/cart/items/:id  — update item quantity  (body: { qty })
 * DELETE /api/cart/items/:id  — remove item from cart
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

export async function action({ request, params, context }: { request: Request; params: { id: string }; context: Record<string, unknown> }) {
  const env = (context.cloudflare?.env ?? context.env) as { MONGODB_URI: string; MONGODB_DB?: string };
  const db = await getDb(env);
  const sessionId = getSessionId(request);
  const method = request.method.toUpperCase();
  const itemId = params.id;

  const cart = await db.collection('carts').findOne({ session_id: sessionId });
  if (!cart) {
    return new Response(JSON.stringify({ error: 'Cart not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  const items = (cart.items as Array<Record<string, unknown>>) ?? [];

  // ── DELETE /api/cart/items/:id  — remove item ──────────────────────────────
  if (method === 'DELETE') {
    const filtered = items.filter((i) => i._id !== itemId);
    if (filtered.length === items.length) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }
    const totals = recalcTotals(filtered as Array<{ unit_price_aed: number; quantity: number }>, cart.coupon as null);
    const updated = { ...cart, items: filtered, totals };
    await db.collection('carts').replaceOne({ session_id: sessionId }, updated);
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  // ── PUT /api/cart/items/:id  — update quantity ─────────────────────────────
  const body: { quantity?: number } = await request.json().catch(() => ({}));
  const { quantity } = body;

  if (quantity === undefined || typeof quantity !== 'number' || quantity < 1) {
    return new Response(JSON.stringify({ error: 'quantity must be a positive integer' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const item = items.find((i) => i._id === itemId);
  if (!item) {
    return new Response(JSON.stringify({ error: 'Item not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  item.quantity = quantity;
  item.line_total_aed = (item.unit_price_aed as number) * quantity;

  const totals = recalcTotals(items as Array<{ unit_price_aed: number; quantity: number }>, cart.coupon as null);
  const updated = { ...cart, items, totals };
  await db.collection('carts').replaceOne({ session_id: sessionId }, updated);

  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
