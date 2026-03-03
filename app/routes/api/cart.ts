/**
 * GET  /api/cart          — fetch session cart
 * POST /api/cart          — add item to cart  (body: { product_slug, quantity })
 * DELETE /api/cart        — clear cart
 */
import type { Db } from 'mongodb';
import { getDb } from '~/lib/db/mongodb';

const SESSION_COOKIE = 'session_id';

function getSessionId(request: Request): string {
  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(/session_id=([^;]+)/);
  return match?.[1] ?? crypto.randomUUID();
}

async function fetchCart(db: Db, sessionId: string) {
  const cart = await db.collection('carts').findOne({ session_id: sessionId });
  return cart ?? { session_id: sessionId, items: [], totals: { subtotal: 0, discount: 0, shipping: 0, total: 0, item_count: 0 }, coupon: null };
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

export async function loader({ request, context }: { request: Request; context: Record<string, unknown> }) {
  const env = (context.cloudflare?.env ?? context.env) as { MONGODB_URI: string; MONGODB_DB?: string };
  const db = await getDb(env);
  const sessionId = getSessionId(request);
  const cart = await fetchCart(db, sessionId);

  return new Response(JSON.stringify(cart), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

export async function action({ request, context }: { request: Request; context: Record<string, unknown> }) {
  const env = (context.cloudflare?.env ?? context.env) as { MONGODB_URI: string; MONGODB_DB?: string };
  const db = await getDb(env);
  const sessionId = getSessionId(request);
  const method = request.method.toUpperCase();

  // ── DELETE /api/cart  — clear cart ────────────────────────────────────────
  if (method === 'DELETE') {
    const emptyCart = { session_id: sessionId, items: [], totals: { subtotal: 0, discount: 0, shipping: 0, total: 0, item_count: 0 }, coupon: null };
    await db.collection('carts').replaceOne({ session_id: sessionId }, emptyCart, { upsert: true });
    return new Response(JSON.stringify(emptyCart), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  // ── POST /api/cart  — add item ─────────────────────────────────────────────
  const body: { product_slug?: string; quantity?: number } = await request.json().catch(() => ({}));
  const { product_slug, quantity = 1 } = body;
  const safeQty = quantity;

  if (!product_slug) {
    return new Response(JSON.stringify({ error: 'product_slug required' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const product = await db.collection('products').findOne({ slug: product_slug, active: true });
  if (!product) {
    return new Response(JSON.stringify({ error: 'Product not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  const stock = product.stock as { status: string };
  if (stock.status === 'out_of_stock') {
    return new Response(JSON.stringify({ error: 'Product is out of stock' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const cart = await fetchCart(db, sessionId) as Record<string, unknown>;
  const items = (cart.items as Array<Record<string, unknown>>) ?? [];

  const existing = items.find((i) => i.product_slug === product_slug);
  if (existing) {
    existing.quantity = (existing.quantity as number) + safeQty;
    existing.line_total_aed = (existing.unit_price_aed as number) * (existing.quantity as number);
  } else {
    items.push({
      _id: crypto.randomUUID(),
      product_slug,
      product: {
        _id: product._id,
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        price: product.price,
        stock: product.stock,
        images: product.images,
      },
      quantity: safeQty,
      unit_price_aed: (product.price as Record<string, number>).aed,
      line_total_aed: (product.price as Record<string, number>).aed * safeQty,
    });
  }

  const totals = recalcTotals(items as Array<{ unit_price_aed: number; quantity: number }>, cart.coupon as null);
  const updated = { ...cart, items, totals };
  await db.collection('carts').replaceOne({ session_id: sessionId }, updated, { upsert: true });

  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
