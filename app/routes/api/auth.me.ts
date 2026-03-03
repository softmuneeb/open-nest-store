import { getDb } from '~/lib/db/mongodb';
import { extractBearerToken, verifyJwt } from '~/lib/auth/jwt';

export async function loader({ request, context }: { request: Request; context: Record<string, unknown> }) {
  const env = (context.cloudflare?.env ?? context.env) as {
    MONGODB_URI: string;
    MONGODB_DB?: string;
    JWT_SECRET: string;
  };

  const token = extractBearerToken(request.headers.get('Authorization'));
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await verifyJwt(token, env.JWT_SECRET ?? 'fallback-secret');
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const db = await getDb(env);
  const user = await db.collection('users').findOne({ email: payload.email as string });
  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const { password_hash: _, ...userPublic } = user as Record<string, unknown>;

  return new Response(JSON.stringify(userPublic), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
