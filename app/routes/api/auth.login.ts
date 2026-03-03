import bcrypt from 'bcryptjs';
import { getDb } from '~/lib/db/mongodb';
import { signJwt } from '~/lib/auth/jwt';

const INVALID_CREDENTIALS_MSG = 'Invalid credentials';

export async function action({ request, context }: { request: Request; context: Record<string, unknown> }) {
  const env = (context.cloudflare?.env ?? context.env) as {
    MONGODB_URI: string;
    MONGODB_DB?: string;
    JWT_SECRET: string;
  };

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: INVALID_CREDENTIALS_MSG }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (!body.email || !body.password) {
    return new Response(JSON.stringify({ error: INVALID_CREDENTIALS_MSG }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  let db;
  try {
    db = await getDb(env);
  } catch {
    return new Response(JSON.stringify({ error: 'Database unavailable' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }
  const user = await db.collection('users').findOne({ email: body.email });

  // Always compare to prevent timing attacks (use dummy hash when user not found)
  const dummyHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
  const hashToCompare = (user?.password_hash as string) ?? dummyHash;
  const valid = await bcrypt.compare(body.password, hashToCompare);

  if (!user || !valid) {
    return new Response(JSON.stringify({ error: INVALID_CREDENTIALS_MSG }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const jwtSecret = env.JWT_SECRET ?? 'fallback-secret';
  const access_token = await signJwt(
    { sub: String(user._id), email: user.email },
    jwtSecret
  );

  // Build response user (strip sensitive fields)
  const { password_hash: _, ...userPublic } = user as Record<string, unknown>;

  // Set HttpOnly session cookie
  const headers = new Headers({ 'content-type': 'application/json' });
  headers.set('set-cookie', `session_token=${access_token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`);

  return new Response(JSON.stringify({ user: userPublic, access_token }), {
    status: 200,
    headers,
  });
}
