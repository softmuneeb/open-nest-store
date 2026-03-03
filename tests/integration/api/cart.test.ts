/**
 * INTEGRATION TESTS — Cart API
 * RED: These will fail until app/routes/api/cart.ts routes are created.
 */
import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectTestDb, disconnectTestDb, seedProducts, seedCategories, seedCoupons, clearAll } from '../../helpers/db';

type Loader = (args: { request: Request; context: Record<string, unknown> }) => Promise<Response>;
type Action = (args: { request: Request; context: Record<string, unknown> }) => Promise<Response>;
type ItemAction = (args: { params: Record<string, string>; request: Request; context: Record<string, unknown> }) => Promise<Response>;

let cartLoader: Loader;
let cartAction: Action;
let itemAction: ItemAction;
let couponAction: Action;

const SESSION_ID = 'test-session-abc123';

const mockEnv = {
  MONGODB_URI: process.env.MONGODB_URI!,
  MONGODB_DB: process.env.MONGODB_DB!,
};

function makeContext() {
  return { env: mockEnv, cloudflare: { env: mockEnv } };
}

function makeRequest(method: string, url: string, body?: unknown): Request {
  const init: RequestInit = {
    method,
    headers: {
      'content-type': 'application/json',
      cookie: `session_id=${SESSION_ID}`,
    },
  };
  if (body) init.body = JSON.stringify(body);
  return new Request(`http://localhost:5173${url}`, init);
}

beforeAll(async () => {
  await connectTestDb();
  await seedCategories();
  await seedProducts();
  await seedCoupons();
  const cartMod = await import('~/routes/api/cart').catch(() => ({ loader: null, action: null }));
  cartLoader = (cartMod as never).loader;
  cartAction = (cartMod as never).action;
  const itemMod = await import('~/routes/api/cart.items.$id').catch(() => ({ action: null }));
  itemAction = (itemMod as never).action;
  const couponMod = await import('~/routes/api/cart.coupon').catch(() => ({ action: null }));
  couponAction = (couponMod as never).action;
});

afterAll(async () => {
  await clearAll();
  await disconnectTestDb();
});

beforeEach(async () => {
  // Clear cart between tests by posting a DELETE to the cart endpoint
  if (typeof cartAction === 'function') {
    await cartAction({ request: makeRequest('DELETE', '/api/cart'), context: makeContext() as never });
  }
});

describe('GET /api/cart', () => {
  test('loader exists as a function', () => {
    expect(typeof cartLoader).toBe('function');
  });

  test('returns 200 for an empty cart', async () => {
    const res = await cartLoader({ request: makeRequest('GET', '/api/cart'), context: makeContext() as never });
    expect(res.status).toBe(200);
  });

  test('empty cart has items array and totals object', async () => {
    const res = await cartLoader({ request: makeRequest('GET', '/api/cart'), context: makeContext() as never });
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.totals).toBeDefined();
    expect(body.totals.subtotal).toBe(0);
    expect(body.totals.total).toBe(0);
    expect(body.items).toHaveLength(0);
  });
});

describe('POST /api/cart (add item)', () => {
  test('action exists as a function', () => {
    expect(typeof cartAction).toBe('function');
  });

  test('adds a product and returns 200 with updated cart', async () => {
    const res = await cartAction({
      request: makeRequest('POST', '/api/cart', {
        product_slug: 'intel-core-i9-14900k-desktop-processor',
        quantity: 1,
      }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0].product_slug).toBe('intel-core-i9-14900k-desktop-processor');
    expect(body.items[0].quantity).toBe(1);
  });

  test('adding same product again increments quantity instead of duplicating', async () => {
    await cartAction({
      request: makeRequest('POST', '/api/cart', {
        product_slug: 'intel-core-i9-14900k-desktop-processor',
        quantity: 1,
      }),
      context: makeContext() as never,
    });
    const res = await cartAction({
      request: makeRequest('POST', '/api/cart', {
        product_slug: 'intel-core-i9-14900k-desktop-processor',
        quantity: 2,
      }),
      context: makeContext() as never,
    });
    const body = await res.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0].quantity).toBe(3);
  });

  test('returns 404 for unknown product slug', async () => {
    const res = await cartAction({
      request: makeRequest('POST', '/api/cart', {
        product_slug: 'nonexistent-product-xyz',
        quantity: 1,
      }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(404);
  });

  test('returns 400 when adding out-of-stock product', async () => {
    const res = await cartAction({
      request: makeRequest('POST', '/api/cart', {
        product_slug: 'amd-ryzen-9-7950x-desktop-processor',
        quantity: 1,
      }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/out.of.stock/i);
  });

  test('totals.subtotal reflects item price * quantity', async () => {
    const res = await cartAction({
      request: makeRequest('POST', '/api/cart', {
        product_slug: 'intel-core-i9-14900k-desktop-processor',
        quantity: 2,
      }),
      context: makeContext() as never,
    });
    const body = await res.json();
    expect(body.totals.subtotal).toBeGreaterThan(0);
    expect(body.totals.item_count).toBe(2);
  });
});

describe('PUT /api/cart/items/:id (update quantity)', () => {
  test('itemAction exists as a function', () => {
    expect(typeof itemAction).toBe('function');
  });

  test('updates quantity and recalculates totals', async () => {
    // First add an item
    const addRes = await cartAction({
      request: makeRequest('POST', '/api/cart', {
        product_slug: 'intel-core-i9-14900k-desktop-processor',
        quantity: 1,
      }),
      context: makeContext() as never,
    });
    const addBody = await addRes.json();
    const itemId = addBody.items[0]._id;

    const res = await itemAction({
      params: { id: itemId },
      request: makeRequest('PUT', `/api/cart/items/${itemId}`, { quantity: 5 }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items[0].quantity).toBe(5);
  });

  test('returns 400 for quantity < 1', async () => {
    const addRes = await cartAction({
      request: makeRequest('POST', '/api/cart', {
        product_slug: 'intel-core-i9-14900k-desktop-processor',
        quantity: 1,
      }),
      context: makeContext() as never,
    });
    const addBody = await addRes.json();
    const itemId = addBody.items[0]._id;

    const res = await itemAction({
      params: { id: itemId },
      request: makeRequest('PUT', `/api/cart/items/${itemId}`, { quantity: 0 }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/cart/items/:id (remove item)', () => {
  test('removes item from cart', async () => {
    const addRes = await cartAction({
      request: makeRequest('POST', '/api/cart', {
        product_slug: 'intel-core-i9-14900k-desktop-processor',
        quantity: 1,
      }),
      context: makeContext() as never,
    });
    const addBody = await addRes.json();
    const itemId = addBody.items[0]._id;

    const res = await itemAction({
      params: { id: itemId },
      request: makeRequest('DELETE', `/api/cart/items/${itemId}`),
      context: makeContext() as never,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toHaveLength(0);
  });
});

describe('DELETE /api/cart (clear cart)', () => {
  test('clears all items and resets totals', async () => {
    await cartAction({
      request: makeRequest('POST', '/api/cart', {
        product_slug: 'intel-core-i9-14900k-desktop-processor',
        quantity: 1,
      }),
      context: makeContext() as never,
    });
    const res = await cartAction({ request: makeRequest('DELETE', '/api/cart'), context: makeContext() as never });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toHaveLength(0);
    expect(body.totals.subtotal).toBe(0);
  });
});

describe('POST /api/cart/coupon (apply coupon)', () => {
  test('couponAction exists as a function', () => {
    expect(typeof couponAction).toBe('function');
  });

  test('valid coupon applies discount and updates total', async () => {
    await cartAction({
      request: makeRequest('POST', '/api/cart', {
        product_slug: 'intel-core-i9-14900k-desktop-processor',
        quantity: 1,
      }),
      context: makeContext() as never,
    });
    const makeRequestC = (method: string, url: string, body?: unknown) =>
      new Request(`http://localhost:5173${url}`, {
        method,
        headers: { 'content-type': 'application/json', cookie: `session_id=${SESSION_ID}` },
        body: body ? JSON.stringify(body) : undefined,
      });
    const res = await couponAction({
      request: makeRequestC('POST', '/api/cart/coupon', { code: 'SAVE10' }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.coupon).toBeDefined();
    expect(body.totals.discount).toBeGreaterThan(0);
  });

  test('returns 400 for expired coupon code', async () => {
    const res = await couponAction({
      request: makeRequest('POST', '/api/cart/coupon', { code: 'EXPIRED2023' }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(400);
  });

  test('returns 400 for unknown coupon code', async () => {
    const res = await couponAction({
      request: makeRequest('POST', '/api/cart/coupon', { code: 'DOESNOTEXIST' }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(400);
  });
});
