import bcrypt from 'bcryptjs';
import { getDb } from '~/lib/db/mongodb';
import { signJwt } from '~/lib/auth/jwt';

interface RegisterBody {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function action({ request, context }: { request: Request; context: Record<string, unknown> }) {
  const env = (context.cloudflare?.env ?? context.env) as {
    MONGODB_URI: string;
    MONGODB_DB?: string;
    JWT_SECRET: string;
  };

  let body: Partial<RegisterBody>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ errors: [{ field: 'body', message: 'Invalid JSON' }] }), {
      status: 422,
      headers: { 'content-type': 'application/json' },
    });
  }

  const errors: Array<{ field: string; message: string }> = [];

  if (!body.email) errors.push({ field: 'email', message: 'Email is required' });
  else if (!isValidEmail(body.email)) errors.push({ field: 'email', message: 'Invalid email format' });

  if (!body.password) errors.push({ field: 'password', message: 'Password is required' });
  else if (body.password.length < 8) errors.push({ field: 'password', message: 'Password must be at least 8 characters' });

  if (!body.first_name) errors.push({ field: 'first_name', message: 'First name is required' });
  if (!body.last_name) errors.push({ field: 'last_name', message: 'Last name is required' });

  if (errors.length > 0) {
    return new Response(JSON.stringify({ errors }), {
      status: 422,
      headers: { 'content-type': 'application/json' },
    });
  }

  const db = await getDb(env);
  const existing = await db.collection('users').findOne({ email: body.email });
  if (existing) {
    return new Response(
      JSON.stringify({ error: 'Email already registered' }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );
  }

  const password_hash = await bcrypt.hash(body.password!, 10);
  const now = new Date();
  const doc = {
    email: body.email,
    password_hash,
    first_name: body.first_name,
    last_name: body.last_name,
    is_b2b: false,
    company_name: null,
    trade_licence: null,
    credit_terms: null,
    email_verified: false,
    active: true,
    created_at: now,
  };

  const result = await db.collection('users').insertOne(doc);
  const jwtSecret = env.JWT_SECRET ?? 'fallback-secret';
  const access_token = await signJwt({ sub: result.insertedId.toString(), email: body.email }, jwtSecret);

  const { password_hash: _, ...user } = { ...doc, _id: result.insertedId };

  const res = new Response(JSON.stringify({ user, access_token }), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  });
  return res;
}
