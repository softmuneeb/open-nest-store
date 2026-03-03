// app/types/cart.ts

import type { Product } from './product';

export interface CartItem {
  id: string;
  product_id: string;
  product: Pick<Product, '_id' | 'sku' | 'name' | 'slug' | 'price' | 'stock' | 'images'>;
  qty: number;
  unit_price_aed: number;
  line_total_aed: number;
}

export interface AppliedCoupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  discount_aed: number;
}

export interface Cart {
  session_id: string;
  items: CartItem[];
  coupon: AppliedCoupon | null;
  subtotal_aed: number;
  discount_aed: number;
  shipping_estimate_aed: number;
  total_aed: number;
  item_count: number;
}

export interface AddToCartPayload {
  product_id: string;
  qty: number;
}

export interface UpdateCartItemPayload {
  qty: number;
}

export interface ApplyCouponPayload {
  code: string;
}
