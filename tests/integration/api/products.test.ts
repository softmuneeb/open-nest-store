/**
 * INTEGRATION TESTS — GET /api/products
 * RED: These will fail until app/routes/api/products.ts is created.
 */
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { connectTestDb, disconnectTestDb, seedProducts, seedCategories, clearAll } from '../../helpers/db';

let loader: (args: { request: Request; context: Record<string, unknown> }) => Promise<Response>;
let slugLoader: (args: { params: Record<string, string>; request: Request; context: Record<string, unknown> }) => Promise<Response>;

const mockEnv = {
  MONGODB_URI: process.env.MONGODB_URI!,
  MONGODB_DB: process.env.MONGODB_DB!,
};

function makeContext() {
  return { env: mockEnv, cloudflare: { env: mockEnv } };
}

function makeRequest(url: string): Request {
  return new Request(`http://localhost:5173${url}`);
}

beforeAll(async () => {
  await connectTestDb();
  await seedCategories();
  await seedProducts();
  const listMod = await import('~/routes/api/products').catch(() => ({ loader: null }));
  loader = (listMod as never).loader;
  const slugMod = await import('~/routes/api/products.$slug').catch(() => ({ loader: null }));
  slugLoader = (slugMod as never).loader;
});

afterAll(async () => {
  await clearAll();
  await disconnectTestDb();
});

describe('GET /api/products', () => {
  test('loader exists and is a function', () => {
    expect(typeof loader).toBe('function');
  });

  test('returns HTTP 200', async () => {
    const res = await loader({ request: makeRequest('/api/products'), context: makeContext() as never });
    expect(res.status).toBe(200);
  });

  test('returns paginated structure with data, meta, filters', async () => {
    const res = await loader({ request: makeRequest('/api/products'), context: makeContext() as never });
    const body = await res.json();
    expect(body.data).toBeDefined();
    expect(body.meta).toBeDefined();
    expect(body.filters).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('meta includes total, page, limit, total_pages', async () => {
    const res = await loader({ request: makeRequest('/api/products'), context: makeContext() as never });
    const body = await res.json();
    expect(body.meta.total).toBeTypeOf('number');
    expect(body.meta.page).toBeTypeOf('number');
    expect(body.meta.limit).toBeTypeOf('number');
    expect(body.meta.total_pages).toBeTypeOf('number');
  });

  test('returns only active products', async () => {
    const res = await loader({ request: makeRequest('/api/products'), context: makeContext() as never });
    const body = await res.json();
    const inactive = body.data.filter((p: Record<string, unknown>) => p.active === false);
    expect(inactive).toHaveLength(0);
  });

  test('?category=processors filters products by category slug', async () => {
    const res = await loader({
      request: makeRequest('/api/products?category=processors'),
      context: makeContext() as never,
    });
    const body = await res.json();
    body.data.forEach((p: Record<string, unknown>) => {
      expect((p.category as Record<string, unknown>).slug).toBe('processors');
    });
  });

  test('?brand=intel filters only Intel products', async () => {
    const res = await loader({
      request: makeRequest('/api/products?brand=intel'),
      context: makeContext() as never,
    });
    const body = await res.json();
    body.data.forEach((p: Record<string, unknown>) => {
      expect((p.brand as Record<string, unknown>).slug).toBe('intel');
    });
  });

  test('?min_price=3000 excludes products below AED 3000', async () => {
    const res = await loader({
      request: makeRequest('/api/products?min_price=3000'),
      context: makeContext() as never,
    });
    const body = await res.json();
    body.data.forEach((p: Record<string, unknown>) => {
      expect((p.price as Record<string, unknown>).aed).toBeGreaterThanOrEqual(3000);
    });
  });

  test('?max_price=1000 excludes products above AED 1000', async () => {
    const res = await loader({
      request: makeRequest('/api/products?max_price=1000'),
      context: makeContext() as never,
    });
    const body = await res.json();
    body.data.forEach((p: Record<string, unknown>) => {
      expect((p.price as Record<string, unknown>).aed).toBeLessThanOrEqual(1000);
    });
  });

  test('?in_stock=true excludes out_of_stock products', async () => {
    const res = await loader({
      request: makeRequest('/api/products?in_stock=true'),
      context: makeContext() as never,
    });
    const body = await res.json();
    body.data.forEach((p: Record<string, unknown>) => {
      expect((p.stock as Record<string, unknown>).status).not.toBe('out_of_stock');
    });
  });

  test('?sort=price_asc returns products ascending by price', async () => {
    const res = await loader({
      request: makeRequest('/api/products?sort=price_asc'),
      context: makeContext() as never ,
    });
    const body = await res.json();
    const prices = body.data.map((p: Record<string, unknown>) => (p.price as Record<string, unknown>).aed as number);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  test('?sort=price_desc returns products descending by price', async () => {
    const res = await loader({
      request: makeRequest('/api/products?sort=price_desc'),
      context: makeContext() as never,
    });
    const body = await res.json();
    const prices = body.data.map((p: Record<string, unknown>) => (p.price as Record<string, unknown>).aed as number);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
    }
  });

  test('?page=2&limit=1 returns page 2 with 1 item', async () => {
    const res = await loader({
      request: makeRequest('/api/products?page=2&limit=1'),
      context: makeContext() as never,
    });
    const body = await res.json();
    expect(body.meta.page).toBe(2);
    expect(body.data.length).toBeLessThanOrEqual(1);
  });

  test('filters.brands contains brands aggregation', async () => {
    const res = await loader({ request: makeRequest('/api/products'), context: makeContext() as never });
    const body = await res.json();
    expect(Array.isArray(body.filters.brands)).toBe(true);
    const intel = body.filters.brands.find((b: Record<string, unknown>) => b.slug === 'intel');
    expect(intel).toBeDefined();
  });

  test('filters.price_range has min and max', async () => {
    const res = await loader({ request: makeRequest('/api/products'), context: makeContext() as never });
    const body = await res.json();
    expect(body.filters.price_range.min).toBeDefined();
    expect(body.filters.price_range.max).toBeDefined();
    expect(body.filters.price_range.max).toBeGreaterThan(body.filters.price_range.min);
  });
});

describe('GET /api/products/:slug', () => {
  test('returns 200 for a known product slug', async () => {
    const res = await slugLoader({
      params: { slug: 'intel-core-i9-14900k-desktop-processor' },
      request: makeRequest('/api/products/intel-core-i9-14900k-desktop-processor'),
      context: makeContext() as never,
    });
    expect(res.status).toBe(200);
  });

  test('returns full product detail including images array', async () => {
    const res = await slugLoader({
      params: { slug: 'intel-core-i9-14900k-desktop-processor' },
      request: makeRequest('/api/products/intel-core-i9-14900k-desktop-processor'),
      context: makeContext() as never,
    });
    const body = await res.json();
    expect(body.name).toBe('Intel Core i9-14900K Desktop Processor');
    expect(Array.isArray(body.images)).toBe(true);
    expect(body.images.length).toBeGreaterThan(0);
  });

  test('returns attributes map for product', async () => {
    const res = await slugLoader({
      params: { slug: 'intel-core-i9-14900k-desktop-processor' },
      request: makeRequest('/api/products/intel-core-i9-14900k-desktop-processor'),
      context: makeContext() as never,
    });
    const body = await res.json();
    expect(body.attributes).toBeDefined();
    expect(typeof body.attributes).toBe('object');
    expect(body.attributes['Socket']).toBe('LGA1700');
  });

  test('returns price_tiers for B2B products', async () => {
    const res = await slugLoader({
      params: { slug: 'amd-ryzen-9-7950x-desktop-processor' },
      request: makeRequest('/api/products/amd-ryzen-9-7950x-desktop-processor'),
      context: makeContext() as never,
    });
    const body = await res.json();
    expect(Array.isArray(body.price_tiers)).toBe(true);
    expect(body.price_tiers.length).toBeGreaterThan(0);
  });

  test('returns 404 for unknown slug', async () => {
    const res = await slugLoader({
      params: { slug: 'product-that-does-not-exist' },
      request: makeRequest('/api/products/product-that-does-not-exist'),
      context: makeContext() as never,
    });
    expect(res.status).toBe(404);
  });

  test('returns category reference with slug and path', async () => {
    const res = await slugLoader({
      params: { slug: 'intel-core-i9-14900k-desktop-processor' },
      request: makeRequest('/api/products/intel-core-i9-14900k-desktop-processor'),
      context: makeContext() as never,
    });
    const body = await res.json();
    expect(body.category.slug).toBeDefined();
    expect(body.category.path).toBeDefined();
  });
});
