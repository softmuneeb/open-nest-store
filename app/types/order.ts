// app/types/order.ts

import type { Address } from './user';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type Currency = 'AED' | 'SAR' | 'USD';

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_sku: string;
  qty: number;
  unit_price_aed: number;
  total_aed: number;
}

export interface Order {
  _id: string;
  order_number: string;
  user_id: string | null;
  guest_email: string | null;
  status: OrderStatus;
  currency: Currency;
  subtotal_aed: number;
  shipping_cost_aed: number;
  discount_aed: number;
  total_aed: number;
  coupon_code: string | null;
  payment_method: string | null;
  payment_status: PaymentStatus;
  stripe_payment_intent: string | null;
  shipping_address: Omit<Address, '_id' | 'is_default'>;
  items: OrderItem[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckoutPayload {
  email: string;
  shipping_address: Omit<Address, '_id' | 'is_default'>;
  shipping_method: 'standard' | 'express';
  payment_method: 'stripe' | 'bank_transfer';
  stripe_payment_intent_id?: string;
  coupon_code?: string;
  notes?: string;
}
