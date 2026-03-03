/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SearchParams {
  q?: string;
  category?: string;
  brand?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
  autocomplete?: boolean;
}

const SPECIAL_CHARS = /[\$\{\}\[\]\(\)\*\+\?\.\\\^\|]/g;

/**
 * Sanitize a user-supplied search term before handing to MongoDB $text.
 */
export function sanitizeSearchTerm(term: string): string {
  if (!term) return '';
  return term
    .trim()
    .replace(SPECIAL_CHARS, '')
    .slice(0, 100);
}

/**
 * Build a MongoDB filter document from search params.
 */
export function buildProductSearchFilter(params: SearchParams): Record<string, any> {
  const filter: Record<string, any> = { active: true };

  if (params.q && params.q.trim()) {
    filter.$text = { $search: sanitizeSearchTerm(params.q) };
  }

  if (params.category) {
    filter['category.slug'] = params.category;
  }

  if (params.brand) {
    filter['brand.slug'] = params.brand;
  }

  if (params.min_price !== undefined || params.max_price !== undefined) {
    filter.price_aed = {};
    if (params.min_price !== undefined) {
      filter.price_aed.$gte = params.min_price;
    }
    if (params.max_price !== undefined) {
      filter.price_aed.$lte = params.max_price;
    }
  }

  if (params.in_stock === true) {
    filter.stock_status = 'in_stock';
  }

  return filter;
}

/**
 * Build a MongoDB sort document from a sort string.
 */
export function buildSortStage(sort?: string): Record<string, any> {
  switch (sort) {
    case 'price_asc':
      return { price_aed: 1 };
    case 'price_desc':
      return { price_aed: -1 };
    case 'relevance':
      return { score: { $meta: 'textScore' } };
    case 'newest':
    default:
      return { created_at: -1 };
  }
}

/**
 * Build MongoDB aggregation pipeline stages for pagination.
 * Returns an array with a $skip and $limit stage.
 */
export function buildPaginationStages(
  page: number,
  limit: number
): Array<Record<string, any>> {
  const skip = (page - 1) * limit;
  return [{ $skip: skip }, { $limit: limit }];
}
