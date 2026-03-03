import type { Route } from './+types/home';
import { getDb } from '~/lib/db/mongodb';
import { buildOrganizationJsonLd } from '~/lib/seo/jsonld';
import type { CategoryDocument, ProductDocument } from '~/types';

// ── Static data ────────────────────────────────────────────────────────────────

const FEATURED_BRANDS = [
  { name: 'Intel', slug: 'intel' },
  { name: 'AMD', slug: 'amd' },
  { name: 'HP', slug: 'hp' },
  { name: 'Dell', slug: 'dell' },
  { name: 'Cisco', slug: 'cisco' },
  { name: 'ASUS', slug: 'asus' },
  { name: 'Kingston', slug: 'kingston' },
  { name: 'G.Skill', slug: 'gskill' },
  { name: 'Seagate', slug: 'seagate' },
  { name: 'Samsung', slug: 'samsung' },
  { name: 'Lenovo', slug: 'lenovo' },
  { name: 'WD', slug: 'western-digital' },
];

const STATS = [
  { value: '20,000+', label: 'Clients' },
  { value: '50+', label: 'Serving Countries' },
  { value: '20M+', label: 'Products Available' },
  { value: '24/7', label: 'Technical Support' },
  { value: '100%', label: 'Secure Experience' },
];

// Category card fallbacks when no image is available
const CATEGORY_GRADIENTS = [
  'linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%)',
  'linear-gradient(135deg,#7c3aed 0%,#c4b5fd 100%)',
  'linear-gradient(135deg,#065f46 0%,#34d399 100%)',
  'linear-gradient(135deg,#9f1239 0%,#fb7185 100%)',
  'linear-gradient(135deg,#0c4a6e 0%,#7dd3fc 100%)',
  'linear-gradient(135deg,#713f12 0%,#f59e0b 100%)',
  'linear-gradient(135deg,#1f2937 0%,#6b7280 100%)',
  'linear-gradient(135deg,#0f766e 0%,#5eead4 100%)',
];
const CATEGORY_ICONS = ['🖥️', '⚡', '🔌', '💾', '🌐', '🖨️', '🎮', '📡'];

// Section-banner images sourced from itechdevices.ae (will be replaced with own assets)
const ITECHIMG = 'https://www.itechdevices.ae/assets/images/section-banners';

// ── Helper components ──────────────────────────────────────────────────────────

function SectionHeader({ title, href, linkLabel = 'View All →' }: { title: string; href: string; linkLabel?: string }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        <div className="mt-2 h-1 w-12 bg-red-600 rounded-full" />
      </div>
      <a href={href} className="text-blue-600 hover:underline text-sm font-medium">
        {linkLabel}
      </a>
    </div>
  );
}

// ── Meta ───────────────────────────────────────────────────────────────────────

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Open Nest — Computer Hardware & IT Equipment in UAE' },
    { name: 'description', content: 'Buy computer components, networking equipment, servers and IT peripherals. Free delivery across UAE. Genuine products, warranty included.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Open Nest — Technology. Delivered.' },
    { property: 'og:image', content: '/logo.png' },
  ];
}

// ── Loader ─────────────────────────────────────────────────────────────────────

export async function loader({ context }: Route.LoaderArgs) {
  const env = (context.cloudflare?.env ?? context.env) as { MONGODB_URI: string; MONGODB_DB?: string };

  const empty = {
    categories: [] as ReturnType<typeof mapCat>[],
    products:   [] as ReturnType<typeof mapProd>[],
    jsonld: buildOrganizationJsonLd(),
    error: null as string | null,
  };

  try {
    const db = await getDb(env);

    const [categories, products] = await Promise.all([
      db.collection<CategoryDocument>('categories')
        .find({ parent_id: null, active: true })
        .limit(8)
        .toArray(),
      db.collection<ProductDocument>('products')
        .find({ active: true, 'stock.status': { $ne: 'out_of_stock' } })
        .limit(12)
        .toArray(),
    ]);

    return {
      ...empty,
      categories: categories.map(mapCat),
      products:   products.map(mapProd),
    };
  } catch (err) {
    return { ...empty, error: err instanceof Error ? err.message : 'Database unavailable' };
  }
}

function mapCat(c: CategoryDocument) {
  return {
    id:    String(c._id),
    name:  c.name,
    slug:  c.slug,
    image: c.image || null,
    url:   `/category/${c.slug}`,
  };
}

function mapProd(p: ProductDocument) {
  return {
    id:           String(p._id),
    name:         p.name,
    slug:         p.slug,
    image:        p.images?.[0]?.url || null,
    price:        p.price?.aed ?? 0,
    comparePrice: p.price?.compare_aed ?? null,
    stock:        p.stock,
    brand:        typeof p.brand === 'object' && p.brand !== null ? (p.brand as { name: string }).name : String(p.brand ?? ''),
  };
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Home({ loaderData }: Route.ComponentProps) {
  const { categories, products, jsonld, error } = loaderData;

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />

      {/* ── DB error banner ── */}
      {error && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-sm text-center py-2 px-4">
          ⚠️ Database connection issue — some content may be unavailable. ({error})
        </div>
      )}

      {/* ── Hero Banner ── */}
      <section
        data-testid="hero-banner"
        className="relative min-h-[560px] flex items-center bg-cover bg-center"
        style={{ backgroundImage: `url('${ITECHIMG}/8_bg.webp')` }}
      >
        {/* Gradient overlay — dark left, lighter right so bg image shows */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-950/75 to-blue-950/30" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 w-full">
          <span className="inline-block bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded mb-5">
            Technology. Delivered.
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-5 max-w-2xl">
            Computer Hardware &amp;<br />IT Equipment
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-lg">
            Servers, networking gear, processors, memory and peripherals — sourced
            from the world's top brands, delivered across the UAE.
          </p>
          <div className="flex flex-wrap gap-4 mb-8">
            <a
              href="/shop"
              data-testid="hero-cta"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-10 py-3.5 rounded-lg font-semibold text-base shadow-lg shadow-red-900/30 transition-all"
            >
              Shop Now →
            </a>
            <a
              href="/shop"
              data-testid="hero-browse-cta"
              className="inline-flex items-center gap-2 border-2 border-white/70 text-white hover:bg-white hover:text-blue-900 px-10 py-3.5 rounded-lg font-semibold text-base transition-all"
            >
              Browse Categories
            </a>
          </div>
          {/* Trust indicators */}
          <div className="flex flex-wrap gap-5 text-blue-200 text-xs font-medium">
            <span>✓ Genuine products — manufacturer warranty</span>
            <span>✓ Trusted by 20,000+ businesses</span>
            <span>✓ Free UAE delivery over AED 500</span>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section data-testid="stats-strip" className="bg-blue-950 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 text-center">
          {STATS.map((stat) => (
            <div key={stat.label} data-testid="stat-item">
              <p className="text-3xl font-extrabold text-red-400">{stat.value}</p>
              <p className="text-blue-200 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section data-testid="featured-categories" className="max-w-6xl mx-auto px-4 py-16">
        <SectionHeader title="Shop by Category" href="/shop" />
        {categories.length === 0 ? (
          <p className="text-gray-500" data-testid="categories-empty">No categories available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {categories.map((cat, i) => (
              <a
                key={cat.id}
                href={cat.url}
                data-testid="category-card"
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-100"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center gap-2"
                      style={{ background: CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length] }}
                    >
                      <span className="text-4xl">{CATEGORY_ICONS[i % CATEGORY_ICONS.length]}</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex items-center justify-between">
                  <h3 data-testid="category-name" className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                    {cat.name}
                  </h3>
                  <span className="text-gray-400 group-hover:text-blue-600 transition-colors text-sm">→</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* ── Promo Banner 1 — Lead with Performance ── */}
      <section
        data-testid="promo-banner-1"
        className="relative min-h-[280px] flex items-center bg-cover bg-center my-8"
        style={{ backgroundImage: `url('${ITECHIMG}/12_bg.webp')` }}
      >
        <div className="absolute inset-0 bg-blue-950/65" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 w-full">
          <p className="text-red-400 uppercase tracking-widest text-xs font-bold mb-2">
            Lead with Performance
          </p>
          <h2 className="text-4xl font-bold text-white mb-3 max-w-xl">
            High-Performance Servers &amp; Networking Gear
          </h2>
          <p className="text-blue-100 mb-6 max-w-lg">
            Experience smooth efficiency with best-in-class servers, switches, network cards and cables.
          </p>
          <a href="/shop" className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Shop Now
          </a>
        </div>
      </section>

      {/* ── Featured Brands ── */}
      <section data-testid="featured-brands" className="bg-white py-12 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Featured Brands</h2>
          <p className="text-gray-500 text-sm text-center mb-8">Genuine products from the world's leading manufacturers</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {FEATURED_BRANDS.map((brand) => (
              <a
                key={brand.slug}
                href={`/shop?brand=${brand.slug}`}
                data-testid="brand-item"
                className="px-5 py-2 border border-gray-200 rounded-full text-gray-700 font-medium hover:border-blue-600 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50"
              >
                {brand.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section data-testid="featured-products" className="max-w-6xl mx-auto px-4 py-16">
        <SectionHeader title="Featured Products" href="/shop" linkLabel="View All Products" />
        {products.length === 0 ? (
          <p className="text-gray-500" data-testid="products-empty">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => {
              const discount = product.comparePrice && product.comparePrice > product.price
                ? Math.round((1 - product.price / product.comparePrice) * 100)
                : null;
              return (
                <a
                  key={product.id}
                  href={`/products/${product.slug}`}
                  data-testid="product-card"
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-100 flex flex-col"
                >
                  {/* Image */}
                  <div className="bg-gray-50 aspect-square overflow-hidden relative">
                    {discount && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                        -{discount}%
                      </span>
                    )}
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300 bg-gradient-to-br from-blue-50 to-indigo-50">💻</div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-3 flex flex-col flex-1">
                    {product.brand && (
                      <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wide mb-0.5">{product.brand}</p>
                    )}
                    <h3 data-testid="product-name" className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm leading-snug flex-1">
                      {product.name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <p data-testid="product-price" className="text-red-600 font-bold text-sm">
                        AED {product.price.toFixed(2)}
                      </p>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <p className="text-gray-500 text-xs line-through">AED {product.comparePrice.toFixed(2)}</p>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      {product.stock?.status === 'in_stock' ? (
                        <span className="text-green-600 text-[10px] font-medium">✓ In Stock</span>
                      ) : (
                        <span className="text-gray-600 text-[10px]">Out of stock</span>
                      )}
                      <span className="text-[10px] text-blue-600 font-medium group-hover:underline">View details →</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Promo Banner 2 — Seamless Connectivity ── */}
      <section
        data-testid="promo-banner-2"
        className="relative min-h-[280px] flex items-center bg-cover bg-center my-8"
        style={{ backgroundImage: `url('${ITECHIMG}/7_bg.webp')` }}
      >
        <div className="absolute inset-0 bg-indigo-950/70" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 w-full text-right">
          <p className="text-red-400 uppercase tracking-widest text-xs font-bold mb-2">
            Seamless Connectivity
          </p>
          <h2 className="text-4xl font-bold text-white mb-3 ml-auto max-w-xl">
            For Every Workplace
          </h2>
          <p className="text-blue-100 mb-6 ml-auto max-w-lg">
            From office handsets to VoIP solutions — Cisco, Poly, Yealink and more.
          </p>
          <a href="/shop" className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Shop Now
          </a>
        </div>
      </section>

      {/* ── Trust Badges / Features ── */}
      <section data-testid="trust-badges" className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: '📦', label: 'Free UAE Delivery', sub: 'On orders over AED 500' },
            { icon: '✅', label: 'Genuine Products', sub: '100% authentic, warranty-backed' },
            { icon: '🛡️', label: 'Warranty Included', sub: 'Full manufacturer warranty' },
            { icon: '💬', label: '24/7 Support', sub: 'Expert technical assistance' },
          ].map((badge) => (
            <div key={badge.label} className="text-center">
              <div className="text-4xl mb-3">{badge.icon}</div>
              <p className="font-semibold text-gray-900">{badge.label}</p>
              <p className="text-xs text-gray-500 mt-1">{badge.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
