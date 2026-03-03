/**
 * UNIT TESTS — MongoDB Search Query Builder
 * RED: These will fail until app/lib/search/queryBuilder.ts is created.
 */
import { describe, test, expect } from 'vitest';
import {
  buildProductSearchFilter,
  buildSortStage,
  buildPaginationStages,
  sanitizeSearchTerm,
  type SearchParams,
} from '~/lib/search/queryBuilder';

describe('sanitizeSearchTerm()', () => {
  test('returns term unchanged for normal input', () => {
    expect(sanitizeSearchTerm('intel processor')).toBe('intel processor');
  });

  test('removes leading/trailing whitespace', () => {
    expect(sanitizeSearchTerm('  AMD  ')).toBe('AMD');
  });

  test('removes special MongoDB regex characters', () => {
    const result = sanitizeSearchTerm('gpu $text { injection }');
    expect(result).not.toContain('$');
    expect(result).not.toContain('{');
    expect(result).not.toContain('}');
  });

  test('limits term to 100 characters', () => {
    const long = 'a'.repeat(200);
    expect(sanitizeSearchTerm(long).length).toBeLessThanOrEqual(100);
  });

  test('returns empty string for empty input', () => {
    expect(sanitizeSearchTerm('')).toBe('');
  });
});

describe('buildProductSearchFilter()', () => {
  test('returns { active: true } as base filter', () => {
    const filter = buildProductSearchFilter({});
    expect(filter.active).toBe(true);
  });

  test('adds $text search when q is provided', () => {
    const filter = buildProductSearchFilter({ q: 'nvidia' });
    expect(filter.$text).toBeDefined();
    expect(filter.$text.$search).toBe('nvidia');
  });

  test('does not add $text when q is empty', () => {
    const filter = buildProductSearchFilter({ q: '' });
    expect(filter.$text).toBeUndefined();
  });

  test('adds category_id filter when category slug is provided', () => {
    const filter = buildProductSearchFilter({ category: 'processors' });
    // The category filter should reference a category slug/id lookup
    expect(filter['category.slug']).toBe('processors');
  });

  test('adds brand slug filter when brand is provided', () => {
    const filter = buildProductSearchFilter({ brand: 'intel' });
    expect(filter['brand.slug']).toBe('intel');
  });

  test('adds price range filter with $gte and $lte', () => {
    const filter = buildProductSearchFilter({ min_price: 100, max_price: 500 });
    expect(filter.price_aed.$gte).toBe(100);
    expect(filter.price_aed.$lte).toBe(500);
  });

  test('adds only $gte when only min_price is set', () => {
    const filter = buildProductSearchFilter({ min_price: 200 });
    expect(filter.price_aed.$gte).toBe(200);
    expect(filter.price_aed.$lte).toBeUndefined();
  });

  test('adds stock_status filter when in_stock is true', () => {
    const filter = buildProductSearchFilter({ in_stock: true });
    expect(filter.stock_status).toBe('in_stock');
  });

  test('does not add stock_status filter when in_stock is false', () => {
    const filter = buildProductSearchFilter({ in_stock: false });
    expect(filter.stock_status).toBeUndefined();
  });

  test('does not add price filter when no price params', () => {
    const filter = buildProductSearchFilter({});
    expect(filter.price_aed).toBeUndefined();
  });
});

describe('buildSortStage()', () => {
  test('returns price_aed ascending for sort=price_asc', () => {
    const sort = buildSortStage('price_asc');
    expect(sort.price_aed).toBe(1);
  });

  test('returns price_aed descending for sort=price_desc', () => {
    const sort = buildSortStage('price_desc');
    expect(sort.price_aed).toBe(-1);
  });

  test('returns created_at descending for sort=newest', () => {
    const sort = buildSortStage('newest');
    expect(sort.created_at).toBe(-1);
  });

  test('returns text score for sort=relevance', () => {
    const sort = buildSortStage('relevance');
    expect(sort.score).toBeDefined();
  });

  test('defaults to newest when no sort specified', () => {
    const sort = buildSortStage(undefined);
    expect(sort.created_at).toBe(-1);
  });
});

describe('buildPaginationStages()', () => {
  test('calculates correct skip for page 1', () => {
    const stages = buildPaginationStages(1, 12);
    const skipStage = stages.find((s: Record<string, unknown>) => s.$skip !== undefined);
    expect(skipStage?.$skip).toBe(0);
  });

  test('calculates correct skip for page 2 with limit 12', () => {
    const stages = buildPaginationStages(2, 12);
    const skipStage = stages.find((s: Record<string, unknown>) => s.$skip !== undefined);
    expect(skipStage?.$skip).toBe(12);
  });

  test('calculates correct skip for page 3 with limit 24', () => {
    const stages = buildPaginationStages(3, 24);
    const skipStage = stages.find((s: Record<string, unknown>) => s.$skip !== undefined);
    expect(skipStage?.$skip).toBe(48);
  });

  test('sets $limit stage with the provided limit', () => {
    const stages = buildPaginationStages(1, 20);
    const limitStage = stages.find((s: Record<string, unknown>) => s.$limit !== undefined);
    expect(limitStage?.$limit).toBe(20);
  });

  test('returns array with $skip and $limit stages', () => {
    const stages = buildPaginationStages(1, 12);
    expect(stages.length).toBeGreaterThanOrEqual(2);
  });
});
