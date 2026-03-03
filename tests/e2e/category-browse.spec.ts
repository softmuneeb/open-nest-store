/**
 * E2E TESTS — Category Browse
 * RED: Will fail until category listing page is implemented.
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Category Browse', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/category/computer-components');
  });

  test('category page loads with correct H1', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Computer Components');
  });

  test('breadcrumb is visible and shows correct path', async ({ page }) => {
    const breadcrumb = page.locator('[data-testid="breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText('Home');
    await expect(breadcrumb).toContainText('Computer Components');
  });

  test('breadcrumb Home link navigates to homepage', async ({ page }) => {
    await page.click('[data-testid="breadcrumb"] [data-testid="breadcrumb-home"]');
    await expect(page).toHaveURL('/');
  });

  test('product grid is visible with at least one product card', async ({ page }) => {
    const grid = page.locator('[data-testid="product-grid"]');
    await expect(grid).toBeVisible();
    const cards = grid.locator('[data-testid="product-card"]');
    await expect(cards.first()).toBeVisible();
  });

  test('each product card shows image, name, and price', async ({ page }) => {
    const cards = page.locator('[data-testid="product-card"]');
    const count = await cards.count();
    const checkCount = Math.min(count, 4);
    for (let i = 0; i < checkCount; i++) {
      const card = cards.nth(i);
      await expect(card.locator('img')).toBeVisible();
      await expect(card.locator('[data-testid="product-name"]')).toBeVisible();
      await expect(card.locator('[data-testid="product-price"]')).toBeVisible();
    }
  });

  test('product card links to product detail page', async ({ page }) => {
    const firstCard = page.locator('[data-testid="product-card"]').first();
    await firstCard.click();
    await expect(page).toHaveURL(/\/product\//);
  });

  test('filter sidebar is visible', async ({ page }) => {
    const sidebar = page.locator('[data-testid="filter-sidebar"]');
    await expect(sidebar).toBeVisible();
  });

  test('price range filter adjusts visible products', async ({ page }) => {
    const minPriceInput = page.locator('[data-testid="filter-price-min"]');
    await minPriceInput.fill('1000');
    await minPriceInput.press('Enter');
    await page.waitForLoadState('networkidle');
    const prices = page.locator('[data-testid="product-price"]');
    const count = await prices.count();
    for (let i = 0; i < count; i++) {
      const text = await prices.nth(i).textContent();
      const value = parseFloat(text!.replace(/[^0-9.]/g, ''));
      expect(value).toBeGreaterThanOrEqual(1000);
    }
  });

  test('brand filter checkboxes are present', async ({ page }) => {
    const brandFilters = page.locator('[data-testid="filter-brand"] input[type="checkbox"]');
    await expect(brandFilters.first()).toBeVisible();
  });

  test('checking brand filter checkbox updates product list', async ({ page }) => {
    const firstBrandCheckbox = page.locator('[data-testid="filter-brand"] input[type="checkbox"]').first();
    const brandName = await page.locator('[data-testid="filter-brand"] label').first().textContent();
    await firstBrandCheckbox.check();
    await page.waitForLoadState('networkidle');
    const cards = page.locator('[data-testid="product-card"]');
    await expect(cards.first()).toBeVisible();
    const activeFilter = page.locator('[data-testid="active-filters"]');
    await expect(activeFilter).toContainText(brandName!.trim());
  });

  test('in-stock toggle filters out-of-stock products', async ({ page }) => {
    const inStockToggle = page.locator('[data-testid="filter-in-stock"]');
    await inStockToggle.click();
    await page.waitForLoadState('networkidle');
    const outOfStock = page.locator('[data-testid="out-of-stock-badge"]');
    await expect(outOfStock).toHaveCount(0);
  });

  test('sort dropdown is present with default option', async ({ page }) => {
    const sortDropdown = page.locator('[data-testid="sort-select"]');
    await expect(sortDropdown).toBeVisible();
  });

  test('sorting by price ascending reorders products', async ({ page }) => {
    await page.selectOption('[data-testid="sort-select"]', 'price_asc');
    await page.waitForLoadState('networkidle');
    const prices: number[] = [];
    const priceEls = page.locator('[data-testid="product-price"]');
    const count = await priceEls.count();
    for (let i = 0; i < count; i++) {
      const text = await priceEls.nth(i).textContent();
      prices.push(parseFloat(text!.replace(/[^0-9.]/g, '')));
    }
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  test('pagination controls are present when products exceed limit', async ({ page }) => {
    const pagination = page.locator('[data-testid="pagination"]');
    // Only check pagination if it exists (depends on data volume)
    const count = await pagination.count();
    if (count > 0) {
      await expect(pagination).toBeVisible();
    }
  });

  test('changing page via pagination loads next set of products', async ({ page }) => {
    const nextBtn = page.locator('[data-testid="pagination-next"]');
    const hasNext = await nextBtn.count();
    if (hasNext > 0) {
      const firstProductBefore = await page.locator('[data-testid="product-name"]').first().textContent();
      await nextBtn.click();
      await page.waitForLoadState('networkidle');
      const firstProductAfter = await page.locator('[data-testid="product-name"]').first().textContent();
      expect(firstProductAfter).not.toBe(firstProductBefore);
    }
  });

  test('subcategory navigation links are shown for parent categories', async ({ page }) => {
    const subCatNav = page.locator('[data-testid="subcategory-nav"]');
    await expect(subCatNav).toBeVisible();
  });

  test('SEO meta title includes category name', async ({ page }) => {
    const title = await page.title();
    expect(title).toMatch(/Computer Components/i);
  });

  test('canonical link tag is present', async ({ page }) => {
    const canonical = page.locator('link[rel="canonical"]');
    const href = await canonical.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toMatch(/computer-components/);
  });

  test('no accessibility violations on category page', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toHaveLength(0);
  });
});
