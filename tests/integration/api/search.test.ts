/**
 * INTEGRATION TESTS — Search API
 * RED: These will fail until app/routes/api/search.ts is created.
 */
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { connectTestDb, disconnectTestDb, seedProducts, seedCategories, clearAll } from '../../helpers/db';

type Loader = (args: { request: Request; context: Record<string, unknown> }) => Promise<Response>;

let loader: Loader;

const mockEnv = {
  MONGODB_URI: process.env.MONGODB_URI!,
  MONGODB_DB: process.env.MONGODB_DB!,
};

function makeContext() {
  return { env: mockEnv, cloudflare: { env: mockEnv } };
}

function makeRequest(query: string): Request {
  return new Request(`http://localhost:5173/api/search?q=${encodeURIComponent(query)}`);
}

function makeFilteredRequest(params: Record<string, string>): Request {
  const qs = new URLSearchParams(params).toString();
  return new Request(`http://localhost:5173/api/search?${qs}`);
}

beforeAll(async () => {
  await connectTestDb();
  await seedCategories();
  await seedProducts(); // seedProducts creates text index
  const mod = await import('~/routes/api/search').catch(() => ({ loader: null }));
  loader = (mod as never).loader;
});

afterAll(async () => {
  await clearAll();
  await disconnectTestDb();
});

describe('GET /api/search', () => {
  test('loader exists and is a function', () => {
    expect(typeof loader).toBe('function');
  });

  test('returns 200 for a valid query', async () => {
    const res = await loader({ request: makeRequest('Intel'), context: makeContext() as never });
    expect(res.status).toBe(200);
  });

  test('matches products by partial name (case-insensitive)', async () => {
    const res = await loader({ request: makeRequest('intel'), context: makeContext() as never });
    const body = await res.json();
    expect(body.results.length).toBeGreaterThan(0);
    const names: string[] = body.results.map((r: Record<string, unknown>) => (r.name as string).toLowerCase());
    expect(names.some((n) => n.includes('intel'))).toBe(true);
  });

  test('matches products by SKU', async () => {
    const res = await loader({ request: makeRequest('BX8071514900K'), context: makeContext() as never });
    const body = await res.json();
    expect(body.results.length).toBeGreaterThan(0);
    expect((body.results[0].sku as string).toUpperCase()).toContain('14900K');
  });

  test('returns empty results array for no match', async () => {
    const res = await loader({ request: makeRequest('xyzproductdoesnotexist999'), context: makeContext() as never });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results).toHaveLength(0);
  });

  test('result items include required fields: _id, name, slug, price, images', async () => {
    const res = await loader({ request: makeRequest('Intel'), context: makeContext() as never });
    const body = await res.json();
    const item = body.results[0];
    expect(item._id).toBeDefined();
    expect(item.name).toBeDefined();
    expect(item.slug).toBeDefined();
    expect(item.price).toBeDefined();
    expect(item.images).toBeDefined();
  });

  test('returns total count in meta', async () => {
    const res = await loader({ request: makeRequest('Intel'), context: makeContext() as never });
    const body = await res.json();
    expect(body.meta.total).toBeTypeOf('number');
    expect(body.meta.total).toBeGreaterThan(0);
  });

  test('respects ?category filter alongside search query', async () => {
    const res = await loader({
      request: makeFilteredRequest({ q: 'processor', category: 'processors' }),
      context: makeContext() as never,
    });
    const body = await res.json();
    body.results.forEach((r: Record<string, unknown>) => {
      expect((r.category as Record<string, unknown>).slug).toBe('processors');
    });
  });

  test('respects ?brand filter', async () => {
    const res = await loader({
      request: makeFilteredRequest({ q: 'processor', brand: 'amd' }),
      context: makeContext() as never,
    });
    const body = await res.json();
    body.results.forEach((r: Record<string, unknown>) => {
      expect((r.brand as Record<string, unknown>).slug).toBe('amd');
    });
  });

  test('respects ?min_price and ?max_price filters', async () => {
    const res = await loader({
      request: makeFilteredRequest({ q: 'processor', min_price: '1000', max_price: '5000' }),
      context: makeContext() as never,
    });
    const body = await res.json();
    body.results.forEach((r: Record<string, unknown>) => {
      const aed = (r.price as Record<string, unknown>).aed as number;
      expect(aed).toBeGreaterThanOrEqual(1000);
      expect(aed).toBeLessThanOrEqual(5000);
    });
  });

  test('respects ?in_stock=true filter — does not return out-of-stock items', async () => {
    const res = await loader({
      request: makeFilteredRequest({ q: 'processor', in_stock: 'true' }),
      context: makeContext() as never,
    });
    const body = await res.json();
    body.results.forEach((r: Record<string, unknown>) => {
      expect((r.stock as Record<string, unknown>).status).not.toBe('out_of_stock');
    });
  });

  test('returns 400 when ?q is missing or empty', async () => {
    const res = await loader({
      request: new Request('http://localhost:5173/api/search'),
      context: makeContext() as never,
    });
    expect(res.status).toBe(400);
  });

  test('returns 400 for query shorter than 2 characters', async () => {
    const res = await loader({
      request: makeRequest('a'),
      context: makeContext() as never,
    });
    expect(res.status).toBe(400);
  });

  test('results are sorted by relevance score by default', async () => {
    const res = await loader({ request: makeRequest('Intel Core'), context: makeContext() as never });
    const body = await res.json();
    if (body.results.length > 1) {
      const scores: number[] = body.results.map((r: Record<string, unknown>) => r.score as number ?? 0);
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
      }
    }
  });

  test('autocomplete endpoint returns suggestions for partial string', async () => {
    const res = await loader({
      request: makeFilteredRequest({ q: 'Int', autocomplete: 'true' }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.suggestions)).toBe(true);
  });

  test('search completes within 300ms', async () => {
    const start = Date.now();
    await loader({ request: makeRequest('processor'), context: makeContext() as never });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(300);
  });
});
