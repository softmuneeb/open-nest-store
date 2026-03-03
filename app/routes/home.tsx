import type { Route } from './+types/home';
import { getDb } from '~/lib/db/mongodb';
import { buildOrganizationJsonLd } from '~/lib/seo/jsonld';
import type { CategoryDocument, ProductDocument } from '~/types';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Open Nest — Computer Hardware & IT Equipment' },
    { name: 'description', content: 'Buy computer components, networking equipment, and IT peripherals. Fast delivery across UAE.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Open Nest' },
    { property: 'og:image', content: '/logo.png' },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const env = (context.cloudflare?.env ?? context.env) as { MONGODB_URI: string; MONGODB_DB?: string };
  const db = await getDb(env);

  // Load 8 featured categories (top-level only)
  const categories = await db
    .collection<CategoryDocument>('categories')
    .find({ parent_id: null, active: true })
    .limit(8)
    .toArray();

  // Load 12 featured products
  const products = await db
    .collection<ProductDocument>('products')
    .find({ active: true, 'stock.status': { $ne: 'out_of_stock' } })
    .limit(12)
    .toArray();

  return {
    categories: categories.map((c) => ({
      id: c._id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      url: `/${c.slug}`,
    })),
    products: products.map((p) => ({
      id: p._id,
      name: p.name,
      slug: p.slug,
      image: p.images?.[0]?.url,
      price: p.price?.aed ?? 0,
      stock: p.stock,
    })),
    jsonld: buildOrganizationJsonLd(),
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(loaderData.jsonld) }}
      />

      {/* Hero Banner */}
      <section data-testid="hero-banner" className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Technology. Delivered.</h1>
          <p className="text-xl mb-8">Computer components and IT equipment for professionals.</p>
          <a href="/shop" data-testid="hero-cta" className="inline-block bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-semibold">
            Shop Now
          </a>
        </div>
      </section>

      {/* Featured Categories */}
      <section data-testid="featured-categories" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loaderData.categories.map((category) => (
            <a
              key={category.id}
              href={category.url}
              data-testid="category-card"
              className="group hover:shadow-lg transition-shadow"
            >
              <div className="bg-white rounded-lg overflow-hidden aspect-square mb-3">
                {category.image && (
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                )}
              </div>
              <h3 data-testid="category-name" className="font-semibold text-gray-900">
                {category.name}
              </h3>
            </a>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section data-testid="featured-products" className="max-w-6xl mx-auto px-4 py-16 bg-white my-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loaderData.products.map((product) => (
            <a
              key={product.id}
              href={`/products/${product.slug}`}
              data-testid="product-card"
              className="group hover:shadow-lg transition-shadow"
            >
              <div className="bg-gray-100 rounded-lg aspect-square mb-3 overflow-hidden">
                {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
              </div>
              <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
              <p className="text-red-600 font-bold mt-2">AED {product.price.toFixed(2)}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: '📦', label: 'Free Delivery' },
            { icon: '✓', label: 'Genuine Products' },
            { icon: '🛡️', label: 'Warranty Included' },
            { icon: '🇦🇪', label: 'UAE Stock' },
          ].map((badge) => (
            <div key={badge.label} className="text-center">
              <div className="text-3xl mb-2">{badge.icon}</div>
              <p className="text-gray-700 font-semibold">{badge.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
