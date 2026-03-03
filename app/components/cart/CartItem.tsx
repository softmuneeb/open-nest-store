import { formatPrice, convertPrice, type RatesMap } from '~/lib/currency/converter';

interface CartProductRef {
  _id: string;
  sku: string;
  name: string;
  slug: string;
  price: { aed: number; compare_aed?: number };
  stock: { qty: number; status: string };
  images: Array<{ url: string; alt: string; is_primary: boolean; sort_order: number }>;
}

interface CartItemData {
  id: string;
  product_id: string;
  product: CartProductRef;
  qty: number;
  unit_price_aed: number;
  line_total_aed: number;
}

interface CartItemProps {
  item: CartItemData;
  currency: string;
  rates: RatesMap;
  onQtyChange: (itemId: string, newQty: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItem({ item, currency, rates, onQtyChange, onRemove }: CartItemProps) {
  const { product, qty, unit_price_aed, line_total_aed, id } = item;
  const thumbnail = product.images.find((i) => i.is_primary) ?? product.images[0];

  const lineTotal = formatPrice(convertPrice(line_total_aed, currency, rates), currency, rates);

  return (
    <div
      data-testid="cart-item"
      style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem 0', borderBottom: '1px solid #eee' }}
    >
      {thumbnail && (
        <img
          src={thumbnail.url}
          alt={thumbnail.alt}
          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
        />
      )}

      <div style={{ flex: 1 }}>
        <div data-testid="cart-item-name" style={{ fontWeight: '600' }}>
          {product.name}
        </div>
        <div style={{ color: '#666', fontSize: '0.875rem' }}>{product.sku}</div>

        <div style={{ marginTop: '0.5rem' }}>
          <span data-testid="cart-item-price">
            {formatPrice(convertPrice(unit_price_aed, currency, rates), currency, rates)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={qty <= 1}
            onClick={() => {
              if (qty > 1) onQtyChange(id, qty - 1);
            }}
          >
            −
          </button>

          <input
            data-testid="cart-item-qty"
            type="number"
            value={qty}
            readOnly
            style={{ width: '3rem', textAlign: 'center' }}
          />

          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => onQtyChange(id, qty + 1)}
          >
            +
          </button>
        </div>

        <span data-testid="cart-item-line-total" style={{ fontWeight: '700' }}>
          {lineTotal}
        </span>
      </div>

      <button
        type="button"
        aria-label="Remove item"
        onClick={() => onRemove(id)}
        style={{ color: 'red', cursor: 'pointer', background: 'none', border: 'none' }}
      >
        ✕ Remove
      </button>
    </div>
  );
}
