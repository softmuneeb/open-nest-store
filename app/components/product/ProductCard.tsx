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
    <article>
      <a href={`/products/${product.slug}`} aria-label={product.name}>
        {primaryImage && (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt}
            loading="lazy"
            style={{ aspectRatio: '1 / 1', width: '100%', objectFit: 'cover' }}
          />
        )}
        <span>{product.name}</span>
      </a>

      {product.brand && (
        <div className="product-brand" style={{ color: '#666', fontSize: '0.875rem' }}>
          {product.brand.name}
        </div>
      )}

      <div className="product-pricing">
        <span
          data-testid="product-price"
          style={{ fontWeight: 'bold' }}
        >
          {displayPrice}
        </span>
        {displayCompare && (
          <del style={{ marginLeft: '0.5rem', color: '#999' }}>{displayCompare}</del>
        )}
      </div>

      <div className="product-stock">
        {isOutOfStock ? (
          <span
            data-testid="out-of-stock-badge"
            style={{ color: 'red', fontSize: '0.75rem' }}
          >
            Out of Stock
          </span>
        ) : (
          <span style={{ color: 'green', fontSize: '0.75rem' }}>In Stock</span>
        )}
      </div>

      <div className="product-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button
          type="button"
          aria-label="Add to Cart"
          disabled={isOutOfStock}
          onClick={() => !isOutOfStock && onAddToCart(product._id, 1)}
          style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
        >
          Add to Cart
        </button>

        <button
          type="button"
          aria-label="Add to Wishlist"
          onClick={() => onWishlist(product._id)}
        >
          ♡ Wishlist
        </button>
      </div>
    </article>
  );
}
