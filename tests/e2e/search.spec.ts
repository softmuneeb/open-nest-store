/**
 * E2E TESTS — Search
 * RED: Will fail until search functionality is implemented.
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('search input is focusable from anywhere via keyboard shortcut /', async ({ page }) => {
    await page.press('body', '/');
    const search = page.locator('[data-testid="search-input"]');
    await expect(search).toBeFocused();
  });

  test('typing into search shows autocomplete dropdown', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('intel');
    const dropdown = page.locator('[data-testid="search-autocomplete"]');
    await expect(dropdown).toBeVisible({ timeout: 2000 });
  });

  test('autocomplete shows at least one suggestion for "intel"', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('intel');
    const suggestions = page.locator('[data-testid="autocomplete-item"]');
    await expect(suggestions.first()).toBeVisible({ timeout: 2000 });
  });

  test('autocomplete suggestion shows product name and price', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('intel');
    const firstSuggestion = page.locator('[data-testid="autocomplete-item"]').first();
    await expect(firstSuggestion.locator('[data-testid="autocomplete-item-name"]')).toBeVisible();
    await expect(firstSuggestion.locator('[data-testid="autocomplete-item-price"]')).toBeVisible();
  });

  test('clicking autocomplete suggestion navigates to product page', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('intel');
    const firstSuggestion = page.locator('[data-testid="autocomplete-item"]').first();
    await expect(firstSuggestion).toBeVisible({ timeout: 2000 });
    await firstSuggestion.click();
    await expect(page).toHaveURL(/\/product\//);
  });

  test('pressing Enter navigates to search results page', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('processor');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/\/search\?q=processor/);
  });

  test('search results page shows heading with query term', async ({ page }) => {
    await page.goto('/search?q=processor');
    const heading = page.locator('[data-testid="search-results-heading"]');
    await expect(heading).toContainText('processor');
  });

  test('search results page shows results count', async ({ page }) => {
    await page.goto('/search?q=intel');
    const count = page.locator('[data-testid="search-results-count"]');
    await expect(count).toBeVisible();
    const text = await count.textContent();
    expect(text).toMatch(/\d+.*result/i);
  });

  test('search results page shows product cards', async ({ page }) => {
    await page.goto('/search?q=intel');
    const cards = page.locator('[data-testid="product-card"]');
    await expect(cards.first()).toBeVisible();
  });

  test('search results page shows no-results message for unknown query', async ({ page }) => {
    await page.goto('/search?q=xyzproductdoesnotexist999');
    const noResults = page.locator('[data-testid="no-search-results"]');
    await expect(noResults).toBeVisible();
    await expect(noResults).toContainText(/no results/i);
  });

  test('no-results page shows search suggestions or popular products', async ({ page }) => {
    await page.goto('/search?q=xyzproductdoesnotexist999');
    const alternate = page.locator('[data-testid="search-fallback"]');
    await expect(alternate).toBeVisible();
  });

  test('search results can be filtered by brand', async ({ page }) => {
    await page.goto('/search?q=processor');
    const brandFilter = page.locator('[data-testid="filter-brand"] input[type="checkbox"]').first();
    const brandLabel = await page.locator('[data-testid="filter-brand"] label').first().textContent();
    await brandFilter.check();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(new RegExp(`brand=`));
    const filterTag = page.locator('[data-testid="active-filters"]');
    await expect(filterTag).toContainText(brandLabel!.trim());
  });

  test('clearing search input hides autocomplete dropdown', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('intel');
    await expect(page.locator('[data-testid="search-autocomplete"]')).toBeVisible({ timeout: 2000 });
    await searchInput.fill('');
    const dropdown = page.locator('[data-testid="search-autocomplete"]');
    await expect(dropdown).toBeHidden({ timeout: 1000 });
  });

  test('pressing Escape closes autocomplete', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('intel');
    await expect(page.locator('[data-testid="search-autocomplete"]')).toBeVisible({ timeout: 2000 });
    await searchInput.press('Escape');
    await expect(page.locator('[data-testid="search-autocomplete"]')).toBeHidden({ timeout: 1000 });
  });

  test('search meta title reflects query for SEO', async ({ page }) => {
    await page.goto('/search?q=gaming+laptop');
    const title = await page.title();
    expect(title).toMatch(/gaming.*laptop/i);
  });

  test('no accessibility violations on search results page', async ({ page }) => {
    await page.goto('/search?q=processor');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toHaveLength(0);
  });
});
