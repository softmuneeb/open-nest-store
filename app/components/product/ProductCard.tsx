import { convertPrice, formatPrice, type RatesMap } from '~/lib/currency/converter';

interface ProductImage {
  url: string;
  alt: string;
  is_primary: boolean;
  sort_order: number;
}

interface ProductBrand {
  id: string;
  name: string;
  slug: string;
}

interface ProductStock {
  qty: number;
  status: 'in_stock' | 'out_of_stock' | 'backorder';
}

interface ProductPrice {
  aed: number;
  compare_aed?: number;
}

interface Product {
  _id: string;
  sku: string;
  name: string;
  slug: string;
  brand?: ProductBrand;
  price: ProductPrice;
  stock: ProductStock;
  images: ProductImage[];
}

interface ProductCardProps {
  product: Product;
  currency: string;
  rates: RatesMap;
  onAddToCart: (productId: string, qty: number) => void;
  onWishlist: (productId: string) => void;
}

export function ProductCard({ product, currency, rates, onAddToCart, onWishlist }: ProductCardProps) {
  const isOutOfStock = product.stock.status === 'out_of_stock';
  const primaryImage = product.images.find((i) => i.is_primary) ?? product.images[0];

  const displayPrice = formatPrice(convertPrice(product.price.aed, currency, rates), currency, rates);
  const displayCompare = product.price.compare_aed
    ? formatPrice(convertPrice(product.price.compare_aed, currency, rates), currency, rates)
    : null;

  return (
    <article className="flex flex-col h-full">
      <a href={`/products/${product.slug}`} aria-label={product.name} className="flex-shrink-0">
        {primaryImage && (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt}
            loading="lazy"
            className="w-full aspect-square object-cover"
          />
        )}
      </a>

      <div className="flex-grow flex flex-col p-4">
        <a href={`/products/${product.slug}`} aria-label={product.name} className="block">
          <span className="font-semibold text-gray-900 line-clamp-2 hover:text-blue-600">{product.name}</span>
        </a>

        {product.brand && (
          <div className="text-sm text-gray-600 mt-1">
            {product.brand.name}
          </div>
        )}

        <div className="mt-3 flex items-baseline gap-2">
          <span
            data-testid="product-price"
            className="font-bold text-lg text-gray-900"
          >
            {displayPrice}
          </span>
          {displayCompare && (
            <del className="text-sm text-gray-500">{displayCompare}</del>
          )}
        </div>

        <div className="mt-2">
          {isOutOfStock ? (
            <span
              data-testid="out-of-stock-badge"
              className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded"
            >
              Out of Stock
            </span>
          ) : (
            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">In Stock</span>
          )}
        </div>

        <div className="flex gap-2 mt-auto pt-4">
          <button
            type="button"
            aria-label="Add to Cart"
            disabled={isOutOfStock}
            onClick={() => !isOutOfStock && onAddToCart(product._id, 1)}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Add to Cart
          </button>

          <button
            type="button"
            aria-label="Add to Wishlist"
            onClick={() => onWishlist(product._id)}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            ♡ Wishlist
          </button>
        </div>
      </div>
    </article>
  );
}
