import type { Route } from './+types/search';
import { getDb } from '~/lib/db/mongodb';
import type { ProductDocument } from '~/types';

export function meta({ request }: Route.MetaArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  return [
    { title: `Search Results for "${q}" | Open Nest` },
    { name: 'description', content: `Search results for ${q}` },
  ];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = (context.cloudflare?.env ?? context.env) as { MONGODB_URI: string; MONGODB_DB?: string };
  const db = await getDb(env);

  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 12;
  const skip = (page - 1) * limit;

  // Text search
  const filter: Record<string, unknown> = { active: true };
  let products: ProductDocument[] = [];
  let total = 0;

  if (query.trim().length >= 2) {
    // Search using text index
    try {
      products = await db
        .collection<ProductDocument>('products')
        .find({ ...filter, $text: { $search: query } })
        .skip(skip)
        .limit(limit)
        .toArray();

      total = await db.collection<ProductDocument>('products').countDocuments({ ...filter, $text: { $search: query } });
    } catch {
      // Fallback to regex search if text index not available
      const regex = new RegExp(query, 'i');
      products = await db
        .collection<ProductDocument>('products')
        .find({ ...filter, $or: [{ name: regex }, { description: regex }, { sku: regex }] })
        .skip(skip)
        .limit(limit)
        .toArray();

      total = await db
        .collection<ProductDocument>('products')
        .countDocuments({ ...filter, $or: [{ name: regex }, { description: regex }, { sku: regex }] });
    }
  }

  return {
    query,
    products: products.map((p) => ({
      id: p._id,
      name: p.name,
      slug: p.slug,
      image: p.images?.[0]?.url,
      price: p.price?.aed ?? 0,
      brand: p.brand,
      stock: p.stock,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default function SearchPage({ loaderData }: Route.ComponentProps) {
  const { query, products, pagination } = loaderData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        {query && (
          <p className="text-gray-600">
            Found <strong>{pagination.total}</strong> results for "<strong>{query}</strong>"
          </p>
        )}
        {!query && <p className="text-gray-600">Please enter a search term.</p>}
      </section>

      {/* Results Grid */}
      {products.length > 0 ? (
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <div data-testid="product-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <a
                key={product.id}
                href={`/product/${product.slug}`}
                data-testid="product-card"
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="bg-gray-100 aspect-square overflow-hidden">
                  {product.image && (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  )}
                </div>
                <div className="p-4">
                  <h3 data-testid="product-name" className="font-semibold text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">{product.brand}</p>
                  <p data-testid="product-price" className="text-red-600 font-bold mt-3">
                    AED {product.price.toFixed(2)}
                  </p>
                  {product.stock?.status === 'out_of_stock' && (
                    <span data-testid="out-of-stock-badge" className="inline-block mt-2 px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded">
                      Out of Stock
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?q=${encodeURIComponent(query)}&page=${p}`}
                  className={`px-3 py-2 rounded ${
                    p === pagination.page ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-gray-50'
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      ) : query.trim().length < 2 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Enter at least 2 characters to search.</p>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>No products found matching your search.</p>
        </div>
      )}
    </div>
  );
}
