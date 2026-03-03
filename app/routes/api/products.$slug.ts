import { getDb } from '~/lib/db/mongodb';

export async function loader({
  params,
  context,
}: {
  params: Record<string, string>;
  request: Request;
  context: Record<string, unknown>;
}) {
  const env = (context.cloudflare?.env ?? context.env) as { MONGODB_URI: string; MONGODB_DB?: string };
  let db;
  try {
    db = await getDb(env);
  } catch {
    return new Response(JSON.stringify({ error: 'Database unavailable' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }
  const { slug } = params;

  const product = await db.collection('products').findOne({ slug, active: true });

  if (!product) {
    return new Response(JSON.stringify({ error: 'Product not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(product), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
