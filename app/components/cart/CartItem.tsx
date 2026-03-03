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
      className="flex gap-4 items-start py-4 border-b border-gray-200 last:border-b-0"
    >
      {thumbnail && (
        <img
          src={thumbnail.url}
          alt={thumbnail.alt}
          className="w-20 h-20 object-cover rounded flex-shrink-0"
        />
      )}

      <div className="flex-1">
        <div data-testid="cart-item-name" className="font-semibold text-gray-900">
          {product.name}
        </div>
        <div className="text-sm text-gray-600 mt-1">SKU: {product.sku}</div>

        <div className="mt-3">
          <span data-testid="cart-item-price" className="font-bold text-gray-900">
            {formatPrice(convertPrice(unit_price_aed, currency, rates), currency, rates)}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1 border border-gray-300 rounded p-1">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={qty <= 1}
            className="px-2 py-1 text-gray-700 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            −
          </button>

          <input
            data-testid="cart-item-qty"
            type="number"
            value={qty}
            readOnly
            className="w-12 text-center text-gray-900 border-0"
          />

          <button
            type="button"
            aria-label="Increase quantity"
            className="px-2 py-1 text-gray-700 hover:text-gray-900"
            onClick={() => onQtyChange(id, qty + 1)}
          >
            +
          </button>
        </div>

        <span data-testid="cart-item-line-total" className="font-bold text-gray-900">
          {lineTotal}
        </span>
      </div>

      <button
        type="button"
        aria-label="Remove item"
        className="ml-4 text-red-600 hover:text-red-800 font-medium text-sm bg-none border-none cursor-pointer"
        onClick={() => onRemove(id)}
      >
        ✕ Remove
      </button>
    </div>
  );
}
