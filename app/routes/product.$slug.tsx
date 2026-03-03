import type { Route } from './+types/product.$slug';
import { getDb } from '~/lib/db/mongodb';
import { buildProductMeta, truncateDescription } from '~/lib/seo/meta';
import { buildProductJsonLd, buildBreadcrumbJsonLd } from '~/lib/seo/jsonld';
import type { ProductDocument } from '~/types';
import { useState } from 'react';

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Product | Open Nest` }];
}

export async function loader({ params, context }: Route.LoaderArgs) {
  const env = (context.cloudflare?.env ?? context.env) as { MONGODB_URI: string; MONGODB_DB?: string };
  const { slug } = params;

  let db;
  try {
    db = await getDb(env);
  } catch (err) {
    throw new Response('Database unavailable', { status: 503 });
  }

  const product = await db.collection<ProductDocument>('products').findOne({ slug, active: true });
  if (!product) {
    throw new Response('Product not found', { status: 404 });
  }

  // Get category for breadcrumb
  const category = await db.collection('categories').findOne({ _id: product.category_id });

  // Get related products (same category)
  const related = await db
    .collection<ProductDocument>('products')
    .find({ 'category._id': product.category_id, _id: { $ne: product._id }, active: true })
    .limit(4)
    .toArray();

  return {
    product: {
      id: product._id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      brand: product.brand,
      price: product.price?.aed ?? 0,
      description: product.description,
      images: product.images || [],
      stock: product.stock,
      specifications: product.specifications,
      meta: buildProductMeta(product),
    },
    category: category ? { id: category._id, name: category.name, slug: category.slug } : null,
    related: related.map((p) => ({
      id: p._id,
      name: p.name,
      slug: p.slug,
      price: p.price?.aed ?? 0,
      image: p.images?.[0]?.url,
    })),
    jsonld: buildProductJsonLd(product),
    breadcrumb: [
      { name: 'Home', url: '/' },
      category ? { name: category.name, url: `/category/${category.slug}` } : null,
      { name: product.name, url: `/product/${product.slug}` },
    ].filter(Boolean),
  };
}

export default function ProductDetail({ loaderData }: Route.ComponentProps) {
  const { product, related, breadcrumb } = loaderData;
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= 1) setQuantity(newQty);
  };

  const mainImage = product.images[selectedImageIdx];

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(loaderData.jsonld) }} />

      {/* Breadcrumb */}
      <nav data-testid="breadcrumb" className="max-w-6xl mx-auto px-4 py-4 text-sm">
        <ul className="flex items-center space-x-2">
          {(breadcrumb as Array<{ name: string; url: string }>).map((item, idx) => (
            <li key={item.url} className="flex items-center space-x-2">
              {idx > 0 && <span className="text-gray-400">/</span>}
              <a href={item.url} className={idx === breadcrumb.length - 1 ? 'text-gray-900' : 'text-blue-600 hover:underline'}>
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Product Detail */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gallery */}
          <div data-testid="product-gallery">
            <div data-testid="gallery-main-image" className="bg-gray-100 aspect-square rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              {mainImage?.url && <img src={mainImage.url} alt={product.name} className="w-full h-full object-cover" />}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    data-testid="gallery-thumbnail"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`bg-gray-100 w-20 h-20 rounded overflow-hidden ${selectedImageIdx === idx ? 'ring-2 ring-blue-600' : ''}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 data-testid="product-title" className="text-3xl font-bold mb-2">
              {product.name}
            </h1>
            <p className="text-gray-600 mb-4">{product.brand}</p>
            <p className="text-sm text-gray-600 mb-4">SKU: {product.sku}</p>

            {/* Price */}
            <div className="mb-6">
              <p data-testid="product-price" className="text-3xl font-bold text-red-600">
                AED {product.price.toFixed(2)}
              </p>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock?.status === 'in_stock' ? (
                <span className="text-green-600 font-semibold">✓ In Stock</span>
              ) : product.stock?.status === 'low_stock' ? (
                <span className="text-yellow-600 font-semibold">⚠ Low Stock</span>
              ) : (
                <span data-testid="out-of-stock-badge" className="text-red-600 font-semibold">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6 flex items-center gap-4">
              <label className="font-semibold">Quantity:</label>
              <div className="flex border rounded">
                <button
                  data-testid="quantity-decrement"
                  onClick={() => handleQuantityChange(-1)}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  −
                </button>
                <input
                  data-testid="quantity-input"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border-l border-r"
                />
                <button
                  data-testid="quantity-increment"
                  onClick={() => handleQuantityChange(1)}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              data-testid="add-to-cart-btn"
              disabled={product.stock?.status === 'out_of_stock'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold mb-4"
            >
              Add to Cart
            </button>

            {/* Wishlist Button */}
            <button data-testid="wishlist-btn" className="w-full border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50">
              ♡ Add to Wishlist
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="border-b mb-8">
            <nav className="flex gap-8">
              <button className="pb-4 border-b-2 border-blue-600 font-semibold">Description</button>
              <button className="pb-4 text-gray-600 hover:text-gray-900">Specifications</button>
              <button className="pb-4 text-gray-600 hover:text-gray-900">Shipping & Returns</button>
            </nav>
          </div>

          {/* Description Tab */}
          <div className="prose prose-sm max-w-none mb-16">
            {product.description ? (
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              <p className="text-gray-600">No description available.</p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <a key={p.id} href={`/product/${p.slug}`} className="bg-white rounded-lg shadow hover:shadow-lg p-4">
                  <div className="bg-gray-100 aspect-square rounded mb-3 overflow-hidden">
                    {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <h3 className="font-semibold line-clamp-2">{p.name}</h3>
                  <p className="text-red-600 font-bold mt-2">AED {p.price.toFixed(2)}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
