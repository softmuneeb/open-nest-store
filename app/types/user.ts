// app/types/user.ts

export interface Address {
  _id: string;
  label: string;
  first_name: string;
  last_name: string;
  phone?: string;
  line1: string;
  line2?: string;
  emirate: UAEEmirate;
  country: string;
  is_default: boolean;
}

export type UAEEmirate =
  | 'Abu Dhabi'
  | 'Dubai'
  | 'Sharjah'
  | 'Ajman'
  | 'Umm Al Quwain'
  | 'Ras Al Khaimah'
  | 'Fujairah';

export interface User {
  _id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  is_b2b: boolean;
  company_name: string | null;
  trade_licence: string | null;
  credit_terms: 'net30' | 'net60' | null;
  email_verified: boolean;
  active: boolean;
  addresses: Address[];
  created_at: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'addresses'>;
}
