export interface MetaResult {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
}

interface CategoryLike {
  meta_title: string;
  meta_description: string;
  meta_keywords?: string;
  slug: string;
  url?: string;
}

interface ProductLike {
  meta: { title: string; description: string; keywords?: string };
  slug: string;
}

/**
 * Truncate a description to at most `maxLen` characters, appending '...' if cut.
 */
export function truncateDescription(text: string, maxLen = 160): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

/**
 * Build meta tags for a category page.
 */
export function buildCategoryMeta(
  category: CategoryLike,
  baseUrl?: string
): MetaResult {
  // Truncate to 157 so that with '...' appended the total is ≤ 160 chars
  const description = truncateDescription(category.meta_description, 157);
  const canonical = baseUrl
    ? `${baseUrl}/${category.slug}`
    : undefined;

  return {
    title: category.meta_title,
    description,
    keywords: category.meta_keywords,
    canonical,
  };
}

/**
 * Build meta tags for a product page.
 */
export function buildProductMeta(
  product: ProductLike,
  baseUrl?: string
): MetaResult {
  const description = truncateDescription(product.meta.description);
  const canonical = baseUrl
    ? `${baseUrl}/products/${product.slug}`
    : undefined;

  return {
    title: product.meta.title,
    description,
    keywords: product.meta.keywords,
    canonical,
  };
}
