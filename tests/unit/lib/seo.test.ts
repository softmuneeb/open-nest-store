/**
 * UNIT TESTS — SEO Meta Builder & JSON-LD Generators
 * RED: These will fail until app/lib/seo/meta.ts and app/lib/seo/jsonld.ts are created.
 */
import { describe, test, expect } from 'vitest';
import { buildCategoryMeta, buildProductMeta, truncateDescription } from '~/lib/seo/meta';
import { buildProductJsonLd, buildBreadcrumbJsonLd, buildOrganizationJsonLd } from '~/lib/seo/jsonld';
import categoriesFixture from '../../fixtures/categories.json';
import productsFixture from '../../fixtures/products.json';

const categoryRoot = categoriesFixture[0];
const categoryChild = categoriesFixture[1];
const product = productsFixture[0];

// ─── Meta builders ───────────────────────────────────────────────────────────

describe('buildCategoryMeta()', () => {
  test('returns meta_title from category document', () => {
    const meta = buildCategoryMeta(categoryRoot);
    expect(meta.title).toBe(categoryRoot.meta_title);
  });

  test('returns meta_description from category document', () => {
    const meta = buildCategoryMeta(categoryRoot);
    expect(meta.description).toBe(categoryRoot.meta_description);
  });

  test('generates canonical URL from category slug', () => {
    const meta = buildCategoryMeta(categoryRoot, 'https://opennest.store');
    expect(meta.canonical).toBe('https://opennest.store/computer-components');
  });

  test('truncates description to 160 characters or fewer', () => {
    const longDesc = 'A'.repeat(200);
    const meta = buildCategoryMeta({ ...categoryRoot, meta_description: longDesc });
    expect(meta.description.length).toBeLessThanOrEqual(160);
  });
});

describe('buildProductMeta()', () => {
  test('returns meta title from product.meta.title', () => {
    const meta = buildProductMeta(product as never);
    expect(meta.title).toBe(product.meta.title);
  });

  test('returns meta description from product.meta.description', () => {
    const meta = buildProductMeta(product as never);
    expect(meta.description).toBe(product.meta.description);
  });

  test('generates canonical URL for product page', () => {
    const meta = buildProductMeta(product as never, 'https://opennest.store');
    expect(meta.canonical).toBe(
      `https://opennest.store/products/${product.slug}`
    );
  });
});

describe('truncateDescription()', () => {
  test('returns string as-is if under 160 chars', () => {
    const short = 'Short description';
    expect(truncateDescription(short)).toBe(short);
  });

  test('truncates at 160 chars and appends ellipsis', () => {
    const long = 'A'.repeat(200);
    const result = truncateDescription(long);
    expect(result.length).toBeLessThanOrEqual(163); // 160 + '...'
    expect(result.endsWith('...')).toBe(true);
  });

  test('handles empty string', () => {
    expect(truncateDescription('')).toBe('');
  });
});

// ─── JSON-LD builders ────────────────────────────────────────────────────────

describe('buildProductJsonLd()', () => {
  test('returns object with @type "Product"', () => {
    const jsonld = buildProductJsonLd(product as never);
    expect(jsonld['@type']).toBe('Product');
  });

  test('includes product name', () => {
    const jsonld = buildProductJsonLd(product as never);
    expect(jsonld.name).toBe(product.name);
  });

  test('includes product SKU', () => {
    const jsonld = buildProductJsonLd(product as never);
    expect(jsonld.sku).toBe(product.sku);
  });

  test('includes offers with price in AED', () => {
    const jsonld = buildProductJsonLd(product as never);
    expect(jsonld.offers).toBeDefined();
    expect(jsonld.offers.priceCurrency).toBe('AED');
    expect(jsonld.offers.price).toBe(product.price.aed);
  });

  test('includes brand name', () => {
    const jsonld = buildProductJsonLd(product as never);
    expect(jsonld.brand.name).toBe(product.brand!.name);
  });

  test('includes @context schema.org', () => {
    const jsonld = buildProductJsonLd(product as never);
    expect(jsonld['@context']).toBe('https://schema.org');
  });

  test('maps in_stock to ItemAvailability InStock', () => {
    const jsonld = buildProductJsonLd(product as never);
    expect(jsonld.offers.availability).toBe('https://schema.org/InStock');
  });

  test('maps out_of_stock to ItemAvailability OutOfStock', () => {
    const outOfStock = { ...product, stock: { qty: 0, status: 'out_of_stock' as const } };
    const jsonld = buildProductJsonLd(outOfStock as never);
    expect(jsonld.offers.availability).toBe('https://schema.org/OutOfStock');
  });
});

describe('buildBreadcrumbJsonLd()', () => {
  const breadcrumbs = [
    { name: 'Home', url: 'https://opennest.store' },
    { name: 'Computer Components', url: 'https://opennest.store/computer-components' },
    { name: 'CPUs / Processors', url: 'https://opennest.store/computer-components/processors' },
  ];

  test('returns @type BreadcrumbList', () => {
    const jsonld = buildBreadcrumbJsonLd(breadcrumbs);
    expect(jsonld['@type']).toBe('BreadcrumbList');
  });

  test('itemListElement has correct length', () => {
    const jsonld = buildBreadcrumbJsonLd(breadcrumbs);
    expect(jsonld.itemListElement).toHaveLength(3);
  });

  test('first item position is 1', () => {
    const jsonld = buildBreadcrumbJsonLd(breadcrumbs);
    expect(jsonld.itemListElement[0].position).toBe(1);
  });

  test('each item has name and id (url)', () => {
    const jsonld = buildBreadcrumbJsonLd(breadcrumbs);
    jsonld.itemListElement.forEach((item: Record<string, unknown>) => {
      expect(item.name).toBeDefined();
      expect(item.item).toBeDefined();
    });
  });
});

describe('buildOrganizationJsonLd()', () => {
  test('returns @type Organization', () => {
    const jsonld = buildOrganizationJsonLd();
    expect(jsonld['@type']).toBe('Organization');
  });

  test('includes Open Nest as name', () => {
    const jsonld = buildOrganizationJsonLd();
    expect(jsonld.name).toBe('Open Nest');
  });
});
