/**
 * INTEGRATION TESTS — Auth API
 * RED: These will fail until app/routes/api/auth.ts routes are created.
 */
import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectTestDb, disconnectTestDb, seedUsers, clearAll } from '../../helpers/db';

type Action = (args: { request: Request; context: Record<string, unknown> }) => Promise<Response>;
type Loader = (args: { request: Request; context: Record<string, unknown> }) => Promise<Response>;

let registerAction: Action;
let loginAction: Action;
let meLoader: Loader;
let logoutAction: Action;

const mockEnv = {
  MONGODB_URI: process.env.MONGODB_URI!,
  MONGODB_DB: process.env.MONGODB_DB!,
  JWT_SECRET: 'test-jwt-secret-at-least-32-chars-long!!',
};

function makeContext() {
  return { env: mockEnv, cloudflare: { env: mockEnv } };
}

function makeJsonRequest(method: string, url: string, body?: unknown, headers?: Record<string, string>): Request {
  return new Request(`http://localhost:5173${url}`, {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
}

const VALID_NEW_USER = {
  email: 'newuser@example.com',
  password: 'SecurePass@123',
  first_name: 'New',
  last_name: 'User',
};

beforeAll(async () => {
  await connectTestDb();
  await seedUsers();
  const regMod = await import('~/routes/api/auth.register').catch(() => ({ action: null }));
  registerAction = (regMod as never).action;
  const loginMod = await import('~/routes/api/auth.login').catch(() => ({ action: null }));
  loginAction = (loginMod as never).action;
  const meMod = await import('~/routes/api/auth.me').catch(() => ({ loader: null }));
  meLoader = (meMod as never).loader;
  const logoutMod = await import('~/routes/api/auth.logout').catch(() => ({ action: null }));
  logoutAction = (logoutMod as never).action;
});

afterAll(async () => {
  await clearAll();
  await disconnectTestDb();
});

beforeEach(async () => {
  // Remove the test registration user between tests to avoid duplicate email
  const { db } = await import('../../helpers/db');
  if (db) await db.collection('users').deleteOne({ email: VALID_NEW_USER.email });
});

describe('POST /api/auth/register', () => {
  test('registerAction exists as a function', () => {
    expect(typeof registerAction).toBe('function');
  });

  test('creates a new user and returns 201', async () => {
    const res = await registerAction({
      request: makeJsonRequest('POST', '/api/auth/register', VALID_NEW_USER),
      context: makeContext() as never,
    });
    expect(res.status).toBe(201);
  });

  test('response includes user object and access token', async () => {
    const res = await registerAction({
      request: makeJsonRequest('POST', '/api/auth/register', VALID_NEW_USER),
      context: makeContext() as never,
    });
    const body = await res.json();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(VALID_NEW_USER.email);
    expect(body.access_token).toBeDefined();
    expect(typeof body.access_token).toBe('string');
  });

  test('password is NOT returned in the response', async () => {
    const res = await registerAction({
      request: makeJsonRequest('POST', '/api/auth/register', VALID_NEW_USER),
      context: makeContext() as never,
    });
    const body = await res.json();
    expect(body.user.password).toBeUndefined();
    expect(body.user.password_hash).toBeUndefined();
  });

  test('returns 400 for duplicate email', async () => {
    // alice@example.com is seeded in users.json
    const res = await registerAction({
      request: makeJsonRequest('POST', '/api/auth/register', {
        email: 'alice@example.com',
        password: 'AnyPass@123',
        first_name: 'Alice',
        last_name: 'Duplicate',
      }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/email.*already/i);
  });

  test('returns 422 for invalid email format', async () => {
    const res = await registerAction({
      request: makeJsonRequest('POST', '/api/auth/register', {
        email: 'not-a-valid-email',
        password: 'SecurePass@123',
        first_name: 'Test',
        last_name: 'User',
      }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.errors).toBeDefined();
  });

  test('returns 422 when password is too short (< 8 chars)', async () => {
    const res = await registerAction({
      request: makeJsonRequest('POST', '/api/auth/register', {
        email: 'valid@example.com',
        password: '123',
        first_name: 'Test',
        last_name: 'User',
      }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(422);
  });

  test('returns 422 when required fields are missing', async () => {
    const res = await registerAction({
      request: makeJsonRequest('POST', '/api/auth/register', { email: 'incomplete@example.com' }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(422);
  });

  test('new unverified user has email_verified: false', async () => {
    const res = await registerAction({
      request: makeJsonRequest('POST', '/api/auth/register', VALID_NEW_USER),
      context: makeContext() as never,
    });
    const body = await res.json();
    expect(body.user.email_verified).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  test('loginAction exists as a function', () => {
    expect(typeof loginAction).toBe('function');
  });

  test('returns 200 with access_token for valid credentials', async () => {
    const res = await loginAction({
      request: makeJsonRequest('POST', '/api/auth/login', {
        email: 'alice@example.com',
        password: 'Password@123',
      }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.access_token).toBeDefined();
    expect(typeof body.access_token).toBe('string');
  });

  test('response includes user summary without sensitive fields', async () => {
    const res = await loginAction({
      request: makeJsonRequest('POST', '/api/auth/login', {
        email: 'alice@example.com',
        password: 'Password@123',
      }),
      context: makeContext() as never,
    });
    const body = await res.json();
    expect(body.user.email).toBe('alice@example.com');
    expect(body.user.password).toBeUndefined();
    expect(body.user.password_hash).toBeUndefined();
  });

  test('sets http-only session cookie on login', async () => {
    const res = await loginAction({
      request: makeJsonRequest('POST', '/api/auth/login', {
        email: 'alice@example.com',
        password: 'Password@123',
      }),
      context: makeContext() as never,
    });
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toBeDefined();
    expect(setCookie).toMatch(/HttpOnly/i);
  });

  test('returns 401 for wrong password', async () => {
    const res = await loginAction({
      request: makeJsonRequest('POST', '/api/auth/login', {
        email: 'alice@example.com',
        password: 'WrongPassword!',
      }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/invalid.*credentials/i);
  });

  test('returns 401 for unknown email', async () => {
    const res = await loginAction({
      request: makeJsonRequest('POST', '/api/auth/login', {
        email: 'nobody@nowhere.com',
        password: 'AnyPass@123',
      }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(401);
  });

  test('does not reveal whether email exists (same error for both scenarios)', async () => {
    const wrongPass = await loginAction({
      request: makeJsonRequest('POST', '/api/auth/login', {
        email: 'alice@example.com',
        password: 'WrongPassword!',
      }),
      context: makeContext() as never,
    });
    const unknownEmail = await loginAction({
      request: makeJsonRequest('POST', '/api/auth/login', {
        email: 'doesnotexist@example.com',
        password: 'AnyPass@123',
      }),
      context: makeContext() as never,
    });
    const b1 = await wrongPass.json();
    const b2 = await unknownEmail.json();
    expect(b1.error).toBe(b2.error);
  });
});

describe('GET /api/auth/me', () => {
  test('meLoader exists as a function', () => {
    expect(typeof meLoader).toBe('function');
  });

  test('returns 200 with user info when valid Bearer token provided', async () => {
    // First login to get a token
    const loginRes = await loginAction({
      request: makeJsonRequest('POST', '/api/auth/login', {
        email: 'alice@example.com',
        password: 'Password@123',
      }),
      context: makeContext() as never,
    });
    const { access_token } = await loginRes.json();

    const res = await meLoader({
      request: makeJsonRequest('GET', '/api/auth/me', undefined, {
        Authorization: `Bearer ${access_token}`,
      }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.email).toBe('alice@example.com');
  });

  test('returns 401 when no Authorization header is present', async () => {
    const res = await meLoader({
      request: makeJsonRequest('GET', '/api/auth/me'),
      context: makeContext() as never,
    });
    expect(res.status).toBe(401);
  });

  test('returns 401 for malformed / expired JWT token', async () => {
    const res = await meLoader({
      request: makeJsonRequest('GET', '/api/auth/me', undefined, {
        Authorization: 'Bearer this.is.not.a.valid.token',
      }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  test('logoutAction exists as a function', () => {
    expect(typeof logoutAction).toBe('function');
  });

  test('returns 200 and clears the session cookie', async () => {
    // Login first
    const loginRes = await loginAction({
      request: makeJsonRequest('POST', '/api/auth/login', {
        email: 'alice@example.com',
        password: 'Password@123',
      }),
      context: makeContext() as never,
    });
    const sessionCookie = loginRes.headers.get('set-cookie') ?? '';

    const res = await logoutAction({
      request: makeJsonRequest('POST', '/api/auth/logout', undefined, {
        cookie: sessionCookie,
      }),
      context: makeContext() as never,
    });
    expect(res.status).toBe(200);
    const setCookie = res.headers.get('set-cookie');
    // Cookie should be cleared (expires in the past or max-age=0)
    expect(setCookie).toMatch(/expires=Thu, 01 Jan 1970|Max-Age=0/i);
  });
});
