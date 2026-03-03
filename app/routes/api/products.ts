import { getDb } from '~/lib/db/mongodb';

const DEFAULT_LIMIT = 12;

export async function loader({ request, context }: { request: Request; context: Record<string, unknown> }) {
  const env = (context.cloudflare?.env ?? context.env) as { MONGODB_URI: string; MONGODB_DB?: string };
  const db = await getDb(env);
  const url = new URL(request.url);

  const q = url.searchParams.get('q') ?? '';
  const category = url.searchParams.get('category') ?? '';
  const brand = url.searchParams.get('brand') ?? '';
  const minPrice = url.searchParams.get('min_price') ? parseFloat(url.searchParams.get('min_price')!) : null;
  const maxPrice = url.searchParams.get('max_price') ? parseFloat(url.searchParams.get('max_price')!) : null;
  const inStock = url.searchParams.get('in_stock') === 'true';
  const sort = url.searchParams.get('sort') ?? 'newest';
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const limit = parseInt(url.searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10);

  // Build filter
  const filter: Record<string, unknown> = { active: true };
  if (q) filter.$text = { $search: q };
  if (category) filter['category.slug'] = category;
  if (brand) filter['brand.slug'] = brand;
  if (minPrice !== null || maxPrice !== null) {
    const priceFilter: Record<string, number> = {};
    if (minPrice !== null) priceFilter.$gte = minPrice;
    if (maxPrice !== null) priceFilter.$lte = maxPrice;
    filter['price.aed'] = priceFilter;
  }
  if (inStock) filter['stock.status'] = 'in_stock';

  // Build sort
  let sortDoc: Record<string, unknown> = { created_at: -1 };
  if (sort === 'price_asc') sortDoc = { 'price.aed': 1 };
  else if (sort === 'price_desc') sortDoc = { 'price.aed': -1 };
  else if (sort === 'relevance' && q) sortDoc = { score: { $meta: 'textScore' } };

  const skip = (page - 1) * limit;

  const collection = db.collection('products');
  const [docs, total] = await Promise.all([
    collection.find(filter).sort(sortDoc).skip(skip).limit(limit).toArray(),
    collection.countDocuments(filter),
  ]);

  // Aggregation for brands facet
  const brandsAgg = await collection.aggregate([
    { $match: { active: true } },
    { $group: { _id: '$brand.slug', name: { $first: '$brand.name' }, count: { $sum: 1 } } },
    { $project: { slug: '$_id', name: 1, count: 1, _id: 0 } },
    { $sort: { name: 1 } },
  ]).toArray();

  // Price range facet
  const priceAgg = await collection.aggregate([
    { $match: { active: true } },
    { $group: { _id: null, min: { $min: '$price.aed' }, max: { $max: '$price.aed' } } },
  ]).toArray();

  const priceRange = priceAgg[0] ?? { min: 0, max: 0 };

  return new Response(
    JSON.stringify({
      data: docs,
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
      filters: {
        brands: brandsAgg,
        price_range: { min: priceRange.min, max: priceRange.max },
      },
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }
  );
}
