import type { Route } from './+types/shop';
import { getDb } from '~/lib/db/mongodb';
import type { ProductDocument, CategoryDocument } from '~/types';

const PAGE_SIZE = 24;

export function meta({ data }: Route.MetaArgs) {
  const d = data as { brand?: string; category?: string } | null;
  const filter = d?.brand ? `Brand: ${d.brand}` : d?.category ? `Category: ${d.category}` : 'All Products';
  return [
    { title: `Shop — ${filter} | Open Nest` },
    { name: 'description', content: `Browse ${filter} at Open Nest. Computer hardware & IT equipment in UAE.` },
  ];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = (context.cloudflare?.env ?? context.env) as { MONGODB_URI: string; MONGODB_DB?: string };
  const url = new URL(request.url);

  const brand    = url.searchParams.get('brand')    ?? '';
  const category = url.searchParams.get('category') ?? '';
  const sort     = url.searchParams.get('sort')     ?? 'newest';
  const page     = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
  const q        = url.searchParams.get('q')        ?? '';
  const skip     = (page - 1) * PAGE_SIZE;

  try {
    const db = await getDb(env);

    // ── build product filter ────────────────────────────────────────────────
    const filter: Record<string, unknown> = { active: true };
    if (brand)    filter['brand.slug']    = brand;
    if (category) filter['category.slug'] = category;
    if (q)        filter.$text            = { $search: q };

    // ── sort ────────────────────────────────────────────────────────────────
    const sortDoc: Record<string, unknown> =
      sort === 'price_asc'  ? { 'price.aed': 1 } :
      sort === 'price_desc' ? { 'price.aed': -1 } :
      sort === 'name_asc'   ? { name: 1 } :
      /* newest */            { created_at: -1 };

    const [docs, total, topCategories] = await Promise.all([
      db.collection<ProductDocument>('products')
        .find(filter).sort(sortDoc).skip(skip).limit(PAGE_SIZE).toArray(),
      db.collection<ProductDocument>('products').countDocuments(filter),
      db.collection<CategoryDocument>('categories')
        .find({ parent_id: null, active: true }).limit(8).toArray(),
    ]);

    return {
      products: docs.map((p) => ({
        id: String(p._id),
        name: p.name,
        slug: p.slug,
        image: p.images?.[0]?.url ?? null,
        price: p.price?.aed ?? 0,
        comparePrice: p.price?.compare_aed ?? null,
        stock: p.stock,
        brand: typeof p.brand === 'object' && p.brand ? (p.brand as { name: string }).name : String(p.brand ?? ''),
        brandSlug: typeof p.brand === 'object' && p.brand ? (p.brand as { slug: string }).slug : '',
      })),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
      categories: topCategories.map((c) => ({ name: c.name, slug: c.slug })),
      brand,
      category,
      sort,
      q,
      error: null as string | null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database error';
    return {
      products: [],
      total: 0,
      page: 1,
      totalPages: 0,
      categories: [],
      brand,
      category,
      sort,
      q,
      error: message,
    };
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest Arrivals' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'name_asc',   label: 'Name A–Z' },
];

export default function ShopPage({ loaderData }: Route.ComponentProps) {
  const { products, total, page, totalPages, categories, brand, category, sort, q, error } = loaderData;

  const buildUrl = (overrides: Record<string, string | number>) => {
    const params = new URLSearchParams();
    if (brand)    params.set('brand',    brand);
    if (category) params.set('category', category);
    if (sort)     params.set('sort',     sort);
    if (q)        params.set('q',        q);
    Object.entries(overrides).forEach(([k, v]) => v ? params.set(k, String(v)) : params.delete(k));
    const s = params.toString();
    return `/shop${s ? '?' + s : ''}`;
  };

  const activeFilter = brand || category || q;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Breadcrumb ── */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
          <a href="/" className="hover:text-blue-600">Home</a>
          <span>/</span>
          {brand ? (
            <><a href="/shop" className="hover:text-blue-600">Shop</a><span>/</span><span className="text-gray-900 capitalize">{brand}</span></>
          ) : category ? (
            <><a href="/shop" className="hover:text-blue-600">Shop</a><span>/</span><span className="text-gray-900 capitalize">{category}</span></>
          ) : (
            <span className="text-gray-900">Shop All Products</span>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ── Page header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {brand    ? <span className="capitalize">{brand.replace(/-/g, ' ')}</span> :
               category ? <span className="capitalize">{category.replace(/-/g, ' ')}</span> :
               q        ? <>Search: "{q}"</> :
               'Shop All Products'}
            </h1>
            {!error && (
              <p className="text-sm text-gray-500 mt-0.5">
                {total} product{total !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {activeFilter && (
              <a href="/shop" className="text-xs text-red-600 border border-red-200 rounded-full px-3 py-1 hover:bg-red-50 transition-colors">
                ✕ Clear filters
              </a>
            )}
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => { if (typeof window !== 'undefined') window.location.href = buildUrl({ sort: e.target.value, page: 1 }); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* ── Category quick-filter ── */}
        {categories.length > 0 && !brand && !q && (
          <div className="flex gap-2 flex-wrap mb-6">
            <a
              href="/shop"
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${!category ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'}`}
            >
              All
            </a>
            {categories.map((cat) => (
              <a
                key={cat.slug}
                href={buildUrl({ category: cat.slug === category ? '' : cat.slug, page: 1 })}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${category === cat.slug ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'}`}
              >
                {cat.name}
              </a>
            ))}
          </div>
        )}

        {/* ── Error state ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center my-8">
            <p className="text-red-700 font-semibold mb-1">Could not load products</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!error && products.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-16 text-center my-8">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-xl font-semibold text-gray-900 mb-2">No products found</p>
            <p className="text-gray-500 mb-6">Try adjusting your filters or browse all products.</p>
            <a href="/shop" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              View All Products
            </a>
          </div>
        )}

        {/* ── Product grid ── */}
        {products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <a
                key={product.id}
                href={`/products/${product.slug}`}
                data-testid="product-card"
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100"
              >
                {/* Image */}
                <div className="aspect-square bg-gray-50 overflow-hidden relative">
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded z-10">
                      SALE
                    </span>
                  )}
                  {product.stock?.status === 'out_of_stock' && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                      <span className="bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded">Out of Stock</span>
                    </div>
                  )}
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">🖥️</div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  {product.brand && (
                    <p className="text-xs text-gray-600 mb-0.5 font-medium uppercase tracking-wide">{product.brand}</p>
                  )}
                  <h3
                    data-testid="product-name"
                    className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors"
                  >
                    {product.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p data-testid="product-price" className="text-red-600 font-bold text-sm">
                      AED {product.price.toFixed(2)}
                    </p>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <p className="text-gray-500 text-xs line-through">
                        AED {product.comparePrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                  {product.stock?.status === 'in_stock' && (
                    <p className="text-green-600 text-xs mt-1">✓ In Stock</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            {page > 1 && (
              <a href={buildUrl({ page: page - 1 })} className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm hover:border-blue-400 transition-colors">
                ← Prev
              </a>
            )}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = page <= 4 ? i + 1 : page - 3 + i;
              if (p < 1 || p > totalPages) return null;
              return (
                <a
                  key={p}
                  href={buildUrl({ page: p })}
                  className={`px-4 py-2 rounded-lg text-sm border transition-colors ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 hover:border-blue-400'}`}
                >
                  {p}
                </a>
              );
            })}
            {page < totalPages && (
              <a href={buildUrl({ page: page + 1 })} className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm hover:border-blue-400 transition-colors">
                Next →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
