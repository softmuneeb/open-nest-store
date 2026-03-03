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

  const category = await db.collection('categories').findOne({ slug, active: true });

  if (!category) {
    return new Response(JSON.stringify({ error: 'Category not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Attach children
  const children = await db
    .collection('categories')
    .find({ parent_id: category.id, active: true })
    .sort({ id: 1 })
    .toArray();

  const result = { ...category, children };

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
