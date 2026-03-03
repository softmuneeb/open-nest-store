import type { Route } from './+types/category.$slug';
import { getDb } from '~/lib/db/mongodb';
import { buildCategoryMeta, truncateDescription } from '~/lib/seo/meta';
import { buildBreadcrumbJsonLd } from '~/lib/seo/jsonld';
import type { CategoryDocument, ProductDocument } from '~/types';

export function meta({ params }: Route.MetaArgs) {
  const slug = params.slug;
  // Meta will be populated by loader data
  return [
    { title: `${slug} | Open Nest` },
    { name: 'description', content: `Shop ${slug} at Open Nest` },
  ];
}

export async function loader({ params, request, context }: Route.LoaderArgs) {
  const env = (context.cloudflare?.env ?? context.env) as { MONGODB_URI: string; MONGODB_DB?: string };
  const { slug } = params;

  let db;
  try {
    db = await getDb(env);
  } catch (err) {
    throw new Response('Database unavailable', { status: 503 });
  }

  const url = new URL(request.url);
  const category = await db.collection<CategoryDocument>('categories').findOne({ slug, active: true });
  if (!category) {
    throw new Response('Category not found', { status: 404 });
  }

  // Get query params for filtering
  const minPrice = parseFloat(url.searchParams.get('min_price') || '0');
  const maxPrice = parseFloat(url.searchParams.get('max_price') || '999999');
  const brand = url.searchParams.get('brand');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 12;
  const skip = (page - 1) * limit;

  // Build filter
  const filter: Record<string, unknown> = {
    'category.slug': slug,
    active: true,
    'price.aed': { $gte: minPrice, $lte: maxPrice },
  };

  if (brand) {
    filter['brand.slug'] = brand;
  }

  // Get products
  const products = await db
    .collection<ProductDocument>('products')
    .find(filter)
    .skip(skip)
    .limit(limit)
    .toArray();

  // Get total count for pagination
  const total = await db.collection<ProductDocument>('products').countDocuments(filter);

  // Get brands for filter
  const brands = await db
    .collection<ProductDocument>('products')
    .distinct('brand', { 'category.slug': slug, active: true });

  return {
    category: {
      id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      meta: {
        title: category.meta_title || category.name,
        description: category.meta_description || truncateDescription(category.description || ''),
        keywords: category.meta_keywords,
      },
    },
    products: products.map((p) => ({
      id: p._id,
      name: p.name,
      slug: p.slug,
      image: p.images?.[0]?.url,
      price: p.price?.aed ?? 0,
      brand: p.brand,
      stock: p.stock,
    })),
    brands: (brands as string[]).filter(Boolean).sort(),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    breadcrumb: [
      { name: 'Home', url: '/' },
      { name: category.name, url: `/category/${category.slug}` },
    ],
    jsonld: buildBreadcrumbJsonLd([
      { name: 'Home', item: '/' },
      { name: category.name, item: `/category/${category.slug}` },
    ]),
  };
}

export default function CategoryPage({ loaderData }: Route.ComponentProps) {
  const { category, products, brands, pagination, breadcrumb } = loaderData;

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(loaderData.jsonld) }}
      />

      {/* Breadcrumb */}
      <nav data-testid="breadcrumb" className="max-w-6xl mx-auto px-4 py-4 text-sm">
        <ul className="flex items-center space-x-2">
          {breadcrumb.map((item, idx) => (
            <li key={item.url} className="flex items-center space-x-2">
              {idx > 0 && <span className="text-gray-400">/</span>}
              {idx === 0 ? (
                <a data-testid="breadcrumb-home" href={item.url} className="text-blue-600 hover:underline">
                  {item.name}
                </a>
              ) : (
                <span className="text-gray-900">{item.name}</span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Header */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
        {category.description && (
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: category.description }} />
        )}
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside data-testid="filter-sidebar" className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold mb-4">Filters</h3>

            {/* Price Range Filter */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-sm">Price Range</h4>
              <form method="get" className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Min Price (AED)</label>
                  <input
                    data-testid="filter-price-min"
                    type="number"
                    name="min_price"
                    defaultValue="0"
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Max Price (AED)</label>
                  <input
                    data-testid="filter-price-max"
                    type="number"
                    name="max_price"
                    defaultValue="999999"
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700">
                  Apply
                </button>
              </form>
            </div>

            {/* Brand Filter */}
            {brands.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-sm">Brand</h4>
                <div data-testid="filter-brand" className="space-y-2">
                  {brands.slice(0, 10).map((brand) => (
                    <label key={brand} className="flex items-center text-sm">
                      <input type="checkbox" value={brand} className="mr-2" />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          <div data-testid="product-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <a
                  key={product.id}
                  href={`/products/${product.slug}`}
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
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">No products found</div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?page=${p}`}
                  className={`px-3 py-2 rounded ${
                    p === pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border hover:bg-gray-50'
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
