/**
 * E2E TESTS — Product Detail Page
 * RED: Will fail until product detail page is implemented.
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PRODUCT_URL = '/product/intel-core-i9-14900k-desktop-processor';

test.describe('Product Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCT_URL);
  });

  test('product name is displayed as H1', async ({ page }) => {
    const h1 = page.locator('h1[data-testid="product-title"]');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Intel Core i9-14900K');
  });

  test('product price is visible in correct currency', async ({ page }) => {
    const price = page.locator('[data-testid="product-price"]');
    await expect(price).toBeVisible();
    await expect(price).toContainText('AED');
  });

  test('product image gallery renders at least one image', async ({ page }) => {
    const gallery = page.locator('[data-testid="product-gallery"]');
    await expect(gallery).toBeVisible();
    const mainImg = gallery.locator('[data-testid="gallery-main-image"] img');
    await expect(mainImg).toBeVisible();
  });

  test('clicking gallery thumbnail changes main image', async ({ page }) => {
    const thumbnails = page.locator('[data-testid="gallery-thumbnail"]');
    const thumbCount = await thumbnails.count();
    if (thumbCount > 1) {
      const mainImgBefore = await page.locator('[data-testid="gallery-main-image"] img').getAttribute('src');
      await thumbnails.nth(1).click();
      const mainImgAfter = await page.locator('[data-testid="gallery-main-image"] img').getAttribute('src');
      expect(mainImgAfter).not.toBe(mainImgBefore);
    }
  });

  test('quantity stepper is visible and defaults to 1', async ({ page }) => {
    const qtyInput = page.locator('[data-testid="quantity-input"]');
    await expect(qtyInput).toBeVisible();
    await expect(qtyInput).toHaveValue('1');
  });

  test('quantity stepper increments and decrements correctly', async ({ page }) => {
    await page.click('[data-testid="quantity-increment"]');
    await expect(page.locator('[data-testid="quantity-input"]')).toHaveValue('2');
    await page.click('[data-testid="quantity-decrement"]');
    await expect(page.locator('[data-testid="quantity-input"]')).toHaveValue('1');
  });

  test('quantity cannot go below 1', async ({ page }) => {
    await page.click('[data-testid="quantity-decrement"]');
    await expect(page.locator('[data-testid="quantity-input"]')).toHaveValue('1');
  });

  test('Add to Cart button is visible', async ({ page }) => {
    const btn = page.locator('[data-testid="add-to-cart-btn"]');
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('clicking Add to Cart increments header cart badge', async ({ page }) => {
    const badge = page.locator('[data-testid="cart-badge"]');
    const countBefore = parseInt((await badge.textContent()) ?? '0');
    await page.click('[data-testid="add-to-cart-btn"]');
    await page.waitForTimeout(300);
    const countAfter = parseInt((await badge.textContent()) ?? '0');
    expect(countAfter).toBeGreaterThan(countBefore);
  });

  test('Add to Cart shows success feedback', async ({ page }) => {
    await page.click('[data-testid="add-to-cart-btn"]');
    const toast = page.locator('[data-testid="toast-success"]');
    await expect(toast).toBeVisible({ timeout: 3000 });
    await expect(toast).toContainText(/added to cart/i);
  });

  test('product description tab is present and contains text', async ({ page }) => {
    const descTab = page.locator('[data-testid="tab-description"]');
    await expect(descTab).toBeVisible();
    await descTab.click();
    const content = page.locator('[data-testid="tab-content-description"]');
    await expect(content).toBeVisible();
    const text = await content.textContent();
    expect(text!.length).toBeGreaterThan(50);
  });

  test('specifications tab shows product attributes', async ({ page }) => {
    const specsTab = page.locator('[data-testid="tab-specifications"]');
    await expect(specsTab).toBeVisible();
    await specsTab.click();
    const rows = page.locator('[data-testid="spec-row"]');
    await expect(rows.first()).toBeVisible();
  });

  test('specifications tab shows Socket LGA1700 for i9-14900K', async ({ page }) => {
    await page.click('[data-testid="tab-specifications"]');
    const content = page.locator('[data-testid="tab-content-specifications"]');
    await expect(content).toContainText('LGA1700');
  });

  test('related products section shows at least one product', async ({ page }) => {
    const related = page.locator('[data-testid="related-products"]');
    await expect(related).toBeVisible();
    const cards = related.locator('[data-testid="product-card"]');
    await expect(cards.first()).toBeVisible();
  });

  test('breadcrumb correctly reflects category path', async ({ page }) => {
    const breadcrumb = page.locator('[data-testid="breadcrumb"]');
    await expect(breadcrumb).toContainText('Home');
    await expect(breadcrumb).toContainText('Computer Components');
    await expect(breadcrumb).toContainText('Intel Core i9-14900K');
  });

  test('meta title includes product name and brand for SEO', async ({ page }) => {
    const title = await page.title();
    expect(title).toMatch(/Intel/i);
    expect(title).toMatch(/i9-14900K/i);
  });

  test('JSON-LD Product schema script is present', async ({ page }) => {
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThan(0);
    const content = await jsonLd.first().textContent();
    const schema = JSON.parse(content!);
    expect(schema['@type']).toBe('Product');
  });

  test('no accessibility violations on product detail page', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toHaveLength(0);
  });

  test('out-of-stock badge shown for out-of-stock products', async ({ page }) => {
    await page.goto('/product/amd-ryzen-9-7950x-desktop-processor');
    const badge = page.locator('[data-testid="out-of-stock-badge"]');
    await expect(badge).toBeVisible();
    const addBtn = page.locator('[data-testid="add-to-cart-btn"]');
    await expect(addBtn).toBeDisabled();
  });
});
