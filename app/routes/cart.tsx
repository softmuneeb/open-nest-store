import type { Route } from './+types/cart';
import { useState, useEffect } from 'react';

interface CartItem {
  _id: string;
  product_slug: string;
  product?: {
    name: string;
    slug: string;
  };
  quantity: number;
  unit_price_aed: number;
  line_total_aed: number;
}

interface Cart {
  items: CartItem[];
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    item_count: number;
  };
  coupon?: { code: string };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Shopping Cart | Open Nest' },
    { name: 'description', content: 'Review your shopping cart and proceed to checkout.' },
  ];
}

export function loader({}: Route.LoaderArgs) {
  return {};
}

export default function CartPage({}: Route.ComponentProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch('/api/cart');
        if (res.ok) {
          const data = await res.json();
          setCart(data);
        }
      } catch (err) {
        console.error('Failed to fetch cart:', err);
        setCart({ items: [], totals: { subtotal: 0, discount: 0, shipping: 0, total: 0, item_count: 0 } });
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ quantity: newQty }),
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch('/api/cart', { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const applyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      const res = await fetch('/api/cart/coupon', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
        setCouponCode('');
        setCouponError('');
      } else {
        setCouponError('Invalid coupon code');
      }
    } catch (err) {
      console.error('Failed to apply coupon:', err);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading cart...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {!cart || cart.items.length === 0 ? (
          <div data-testid="cart-empty" className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-6">Your cart is empty</p>
            <a data-testid="cart-continue-shopping" href="/shop" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                {cart.items.map((item) => (
                  <div key={item._id} data-testid="cart-item" className="border-b p-6 flex gap-6 last:border-b-0">
                    <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0">
                      {item.product?.name && (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                          <img src="" alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 data-testid="cart-item-name" className="font-semibold text-gray-900">
                        {item.product?.name || item.product_slug}
                      </h3>
                      <p className="text-sm text-gray-600">SKU: {item.product_slug}</p>
                      <p data-testid="cart-item-price" className="text-red-600 font-bold mt-2">
                        AED {item.unit_price_aed.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex flex-col items-end gap-4">
                      <div className="flex items-center border rounded">
                        <button
                          data-testid="cart-qty-decrement"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          −
                        </button>
                        <input
                          data-testid="cart-item-qty"
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                          className="w-12 text-center border-l border-r"
                        />
                        <button
                          data-testid="cart-qty-increment"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Total */}
                      <div>
                        <p className="text-sm text-gray-600">Line Total</p>
                        <p data-testid="cart-item-line-total" className="font-bold text-gray-900">
                          AED {item.line_total_aed.toFixed(2)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        data-testid="cart-item-remove"
                        onClick={() => removeItem(item._id)}
                        className="text-red-600 hover:text-red-700 text-sm font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <form onSubmit={applyCoupon} className="mt-6 bg-white rounded-lg p-6 shadow">
                <h3 className="font-semibold mb-4">Apply Coupon Code</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    data-testid="coupon-input"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                    className="flex-1 border rounded px-4 py-2"
                  />
                  <button type="submit" data-testid="coupon-apply-btn" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold">
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p data-testid="coupon-error" className="text-red-600 text-sm mt-2">{couponError}</p>
                )}
              </form>

              {/* Clear Cart */}
              <button
                data-testid="clear-cart-btn"
                onClick={clearCart}
                className="mt-6 text-red-600 hover:text-red-700 font-semibold text-sm"
              >
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h3 className="font-bold text-lg mb-4">Order Summary</h3>

                <div className="space-y-3 border-b pb-4 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({cart.totals.item_count} items)</span>
                    <span data-testid="cart-subtotal">AED {cart.totals.subtotal.toFixed(2)}</span>
                  </div>
                  {cart.totals.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span data-testid="coupon-discount">-AED {cart.totals.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span data-testid="cart-shipping">AED {cart.totals.shipping.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-lg mb-6">
                  <span>Total</span>
                  <span data-testid="cart-total">AED {cart.totals.total.toFixed(2)}</span>
                </div>

                <a
                  href="/checkout"
                  data-testid="checkout-btn"
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold block text-center"
                >
                  Proceed to Checkout
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
