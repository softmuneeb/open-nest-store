/* eslint-disable @typescript-eslint/no-explicit-any */

interface ProductLike {
  name: string;
  sku: string;
  slug: string;
  description?: string;
  images?: Array<{ url: string; alt?: string }>;
  price: { aed: number };
  stock: { status: string };
  brand?: { name: string };
  meta?: { keywords?: string };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Build Schema.org Product JSON-LD object.
 */
export function buildProductJsonLd(product: ProductLike): Record<string, any> {
  const availability =
    product.stock.status === 'in_stock'
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    description: product.description ?? '',
    image: product.images?.map((i) => i.url) ?? [],
    brand: {
      '@type': 'Brand',
      name: product.brand?.name ?? '',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'AED',
      price: product.price.aed,
      availability,
      url: `/products/${product.slug}`,
    },
    keywords: product.meta?.keywords ?? '',
  };
}

/**
 * Build Schema.org BreadcrumbList JSON-LD object.
 */
export function buildBreadcrumbJsonLd(
  items: BreadcrumbItem[]
): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Build Schema.org Organization JSON-LD for Open Nest brand.
 */
export function buildOrganizationJsonLd(): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Open Nest',
    url: 'https://opennest.store',
    logo: 'https://opennest.store/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@opennest.store',
    },
    sameAs: [
      'https://www.instagram.com/openneststore',
      'https://www.linkedin.com/company/openneststore',
    ],
  };
}
