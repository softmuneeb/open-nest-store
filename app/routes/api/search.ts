import { getDb } from '~/lib/db/mongodb';
import { sanitizeSearchTerm } from '~/lib/search/queryBuilder';

const MIN_QUERY_LENGTH = 2;
const DEFAULT_LIMIT = 20;

export async function loader({ request, context }: { request: Request; context: Record<string, unknown> }) {
  const env = (context.cloudflare?.env ?? context.env) as { MONGODB_URI: string; MONGODB_DB?: string };
  const url = new URL(request.url);

  const raw = url.searchParams.get('q') ?? '';
  const autocomplete = url.searchParams.get('autocomplete') === 'true';

  if (!raw || raw.trim().length < MIN_QUERY_LENGTH) {
    return new Response(
      JSON.stringify({ error: 'Query must be at least 2 characters', results: [] }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );
  }

  const q = sanitizeSearchTerm(raw);
  const category = url.searchParams.get('category') ?? '';
  const brand = url.searchParams.get('brand') ?? '';
  const minPrice = url.searchParams.get('min_price') ? parseFloat(url.searchParams.get('min_price')!) : null;
  const maxPrice = url.searchParams.get('max_price') ? parseFloat(url.searchParams.get('max_price')!) : null;
  const inStock = url.searchParams.get('in_stock') === 'true';

  const filter: Record<string, unknown> = {
    active: true,
    $text: { $search: q },
  };

  if (category) filter['category.slug'] = category;
  if (brand) filter['brand.slug'] = brand;
  if (minPrice !== null || maxPrice !== null) {
    const priceFilter: Record<string, number> = {};
    if (minPrice !== null) priceFilter.$gte = minPrice;
    if (maxPrice !== null) priceFilter.$lte = maxPrice;
    filter['price.aed'] = priceFilter;
  }
  if (inStock) filter['stock.status'] = 'in_stock';

  const db = await getDb(env);
  const collection = db.collection('products');

  if (autocomplete) {
    // Lightweight autocomplete: only name + slug + price + thumbnail
    const projection = { name: 1, slug: 1, price: 1, images: { $slice: 1 }, score: { $meta: 'textScore' } };
    const suggestions = await collection
      .find(filter, { projection })
      .sort({ score: { $meta: 'textScore' } })
      .limit(5)
      .toArray();

    return new Response(JSON.stringify({ suggestions }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  const limit = parseInt(url.searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10);
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const skip = (page - 1) * limit;

  const [results, total] = await Promise.all([
    collection
      .find(filter, { projection: { score: { $meta: 'textScore' } } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return new Response(
    JSON.stringify({
      results,
      meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
    }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
}
