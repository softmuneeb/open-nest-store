// app/types/product.ts

export interface ProductImage {
  url: string;
  alt: string;
  is_primary: boolean;
  sort_order: number;
}

export interface PriceTier {
  min_qty: number;
  max_qty?: number;
  price_aed: number;
}

export interface ProductMeta {
  title: string;
  description: string;
  keywords: string;
}

export interface BrandRef {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryRef {
  id: string;
  name: string;
  slug: string;
  path: string;
}

export interface StockInfo {
  qty: number;
  status: 'in_stock' | 'out_of_stock' | 'backorder';
}

export interface PriceInfo {
  aed: number;
  compare_aed?: number;
}

/** Full product as returned by GET /api/products/:slug */
export interface Product {
  _id: string;
  sku: string;
  name: string;
  slug: string;
  brand: BrandRef | null;
  category: CategoryRef;
  price: PriceInfo;
  stock: StockInfo;
  images: ProductImage[];
  description: string | null;
  short_description: string | null;
  attributes: Record<string, string>;
  price_tiers: PriceTier[];
  meta: ProductMeta;
  google_product_category: string;
  weight: number;
  dimensions: { l: number; w: number; h: number };
  active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

/** Paginated product list response */
export interface PaginatedProducts {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  filters: {
    brands: { id: string; name: string; count: number }[];
    price_range: { min: number; max: number };
  };
}

/** Query params for product listing */
export interface ProductListQuery {
  category?: string;
  brand?: string;
  q?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'relevance';
  page?: number;
  limit?: number;
}
