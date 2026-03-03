/**
 * INTEGRATION TESTS — GET /api/categories
 * RED: These will fail until app/routes/api/categories.ts is created.
 *
 * Tests call the React Router loader/action functions directly with a mock env.
 */
import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectTestDb, disconnectTestDb, seedCategories, clearAll } from '../../helpers/db';

// The route module that will be created during development
// Importing before it exists ensures RED state
let loader: (args: { request: Request; context: { env: Record<string, unknown> } }) => Promise<Response>;

beforeAll(async () => {
  await connectTestDb();
  await seedCategories();
  // Dynamically import the route (will throw until route is created — RED)
  const mod = await import('~/routes/api/categories').catch(() => ({ loader: null }));
  loader = (mod as never).loader;
});

afterAll(async () => {
  await clearAll();
  await disconnectTestDb();
});

// Mock environment
const mockEnv = {
  MONGODB_URI: process.env.MONGODB_URI!,
  MONGODB_DB: process.env.MONGODB_DB!,
};

function makeRequest(url: string): Request {
  return new Request(`http://localhost:5173${url}`);
}

function makeContext() {
  return { env: mockEnv, cloudflare: { env: mockEnv } };
}

describe('GET /api/categories', () => {
  test('route loader exists and is a function', () => {
    expect(loader).toBeDefined();
    expect(typeof loader).toBe('function');
  });

  test('returns HTTP 200', async () => {
    const response = await loader({
      request: makeRequest('/api/categories'),
      context: makeContext() as never,
    });
    expect(response.status).toBe(200);
  });

  test('returns JSON content-type', async () => {
    const response = await loader({
      request: makeRequest('/api/categories'),
      context: makeContext() as never,
    });
    expect(response.headers.get('content-type')).toContain('application/json');
  });

  test('returns array of categories', async () => {
    const response = await loader({
      request: makeRequest('/api/categories'),
      context: makeContext() as never,
    });
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('only returns active categories', async () => {
    const response = await loader({
      request: makeRequest('/api/categories'),
      context: makeContext() as never,
    });
    const body: Record<string, unknown>[] = await response.json();
    const inactive = body.filter((c) => c.active === false);
    expect(inactive).toHaveLength(0);
  });

  test('each category has required fields: id, name, slug, url', async () => {
    const response = await loader({
      request: makeRequest('/api/categories'),
      context: makeContext() as never,
    });
    const body: Record<string, unknown>[] = await response.json();
    const first = body[0];
    expect(first.id).toBeDefined();
    expect(first.name).toBeDefined();
    expect(first.slug).toBeDefined();
  });

  test('top-level categories have children array', async () => {
    const response = await loader({
      request: makeRequest('/api/categories'),
      context: makeContext() as never,
    });
    const body: Record<string, unknown>[] = await response.json();
    const root = body.find((c) => (c as Record<string, unknown>).parent_id === null);
    expect(root).toBeDefined();
    expect(Array.isArray((root as Record<string, unknown>).children)).toBe(true);
  });

  test('children categories are nested under correct parent', async () => {
    const response = await loader({
      request: makeRequest('/api/categories'),
      context: makeContext() as never,
    });
    const body: Record<string, unknown>[] = await response.json();
    const root = body.find((c) => (c as Record<string, unknown>).parent_id === null);
    const children = (root as Record<string, unknown[]>).children as Record<string, unknown>[];
    // 'processors', 'motherboards', 'memory' are all under parent_id=1
    const slugs = children.map((c) => c.slug);
    expect(slugs).toContain('processors');
    expect(slugs).toContain('motherboards');
  });
});

describe('GET /api/categories/:slug', () => {
  let singleLoader: (args: { params: Record<string, string>; context: Record<string, unknown> }) => Promise<Response>;

  beforeAll(async () => {
    const mod = await import('~/routes/api/categories.$slug').catch(() => ({ loader: null }));
    singleLoader = (mod as never).loader;
  });

  test('returns 200 for a known category slug', async () => {
    const response = await singleLoader({
      params: { slug: 'computer-components' },
      context: makeContext() as never,
    });
    expect(response.status).toBe(200);
  });

  test('returns correct category name for slug', async () => {
    const response = await singleLoader({
      params: { slug: 'computer-components' },
      context: makeContext() as never,
    });
    const body: Record<string, unknown> = await response.json();
    expect(body.name).toBe('Computer Components');
  });

  test('returns 404 for an unknown slug', async () => {
    const response = await singleLoader({
      params: { slug: 'this-does-not-exist' },
      context: makeContext() as never,
    });
    expect(response.status).toBe(404);
  });

  test('includes children array in response', async () => {
    const response = await singleLoader({
      params: { slug: 'computer-components' },
      context: makeContext() as never,
    });
    const body: Record<string, unknown> = await response.json();
    expect(Array.isArray(body.children)).toBe(true);
  });

  test('includes SEO fields: meta_title, meta_description', async () => {
    const response = await singleLoader({
      params: { slug: 'computer-components' },
      context: makeContext() as never,
    });
    const body: Record<string, unknown> = await response.json();
    expect(body.meta_title).toBeDefined();
    expect(body.meta_description).toBeDefined();
  });
});
