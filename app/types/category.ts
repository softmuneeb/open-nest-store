// app/types/category.ts

export interface CategoryDimensions {
  l: number;
  w: number;
  h: number;
  unit: string;
}

export interface CategoryDocument {
  _id: string;
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  category_path: string;
  url: string;
  image: string | null;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  description: string | null;
  footer_description: string | null;
  google_product_category: string;
  active: boolean;
  weight_default: number;
  dimensions_default: CategoryDimensions;
  created_at: string;
  updated_at: string;
}

/** Tree node returned by GET /api/categories */
export interface CategoryNode extends Omit<CategoryDocument, '_id'> {
  children: CategoryNode[];
}

/** Lightweight reference used inside product responses */
export interface CategoryRef {
  id: string;
  name: string;
  slug: string;
  path: string;
}
