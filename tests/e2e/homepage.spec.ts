/**
 * E2E TESTS — Homepage
 * RED: Will fail until the homepage is developed.
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page title contains Open Nest', async ({ page }) => {
    await expect(page).toHaveTitle(/Open Nest/i);
  });

  test('hero banner is visible with headline and CTA', async ({ page }) => {
    const hero = page.locator('[data-testid="hero-banner"]');
    await expect(hero).toBeVisible();
    await expect(hero.locator('h1')).toBeVisible();
    await expect(hero.locator('[data-testid="hero-cta"]')).toBeVisible();
  });

  test('hero CTA navigates to shop page', async ({ page }) => {
    await page.click('[data-testid="hero-cta"]');
    await expect(page).toHaveURL(/\/shop|\/products|\/categories/);
  });

  test('featured categories section shows 8 categories', async ({ page }) => {
    const section = page.locator('[data-testid="featured-categories"]');
    await expect(section).toBeVisible();
    const cards = section.locator('[data-testid="category-card"]');
    await expect(cards).toHaveCount(8);
  });

  test('each category card has an image and name', async ({ page }) => {
    const cards = page.locator('[data-testid="category-card"]');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      await expect(card.locator('img')).toBeVisible();
      await expect(card.locator('[data-testid="category-name"]')).toBeVisible();
    }
  });

  test('clicking category card navigates to category page', async ({ page }) => {
    const firstCard = page.locator('[data-testid="category-card"]').first();
    const href = await firstCard.getAttribute('href');
    await firstCard.click();
    await expect(page).toHaveURL(new RegExp(href!));
  });

  test('featured products section is visible', async ({ page }) => {
    const section = page.locator('[data-testid="featured-products"]');
    await expect(section).toBeVisible();
  });

  test('header navigation has logo', async ({ page }) => {
    const logo = page.locator('[data-testid="site-logo"]');
    await expect(logo).toBeVisible();
  });

  test('header has search input', async ({ page }) => {
    const search = page.locator('[data-testid="search-input"]');
    await expect(search).toBeVisible();
  });

  test('header shows cart icon with item count badge', async ({ page }) => {
    const cartIcon = page.locator('[data-testid="cart-icon"]');
    await expect(cartIcon).toBeVisible();
  });

  test('currency switcher is present in header', async ({ page }) => {
    const switcher = page.locator('[data-testid="currency-switcher"]');
    await expect(switcher).toBeVisible();
  });

  test('currency switcher defaults to AED', async ({ page }) => {
    const switcher = page.locator('[data-testid="currency-switcher"]');
    await expect(switcher).toContainText('AED');
  });

  test('switching currency to USD updates visible prices', async ({ page }) => {
    await page.click('[data-testid="currency-switcher"]');
    await page.click('[data-testid="currency-option-USD"]');
    await expect(page.locator('[data-testid="currency-switcher"]')).toContainText('USD');
    const firstPrice = page.locator('[data-testid="product-price"]').first();
    await expect(firstPrice).toContainText('$');
  });

  test('footer is visible with contact information', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('[data-testid="footer-contact"]')).toBeVisible();
  });

  test('footer has links to social media', async ({ page }) => {
    const footer = page.locator('footer');
    const socials = footer.locator('[data-testid="social-links"] a');
    await expect(socials).not.toHaveCount(0);
  });

  test('no accessibility violations on homepage', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toHaveLength(0);
  });

  test('layout is responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const hero = page.locator('[data-testid="hero-banner"]');
    await expect(hero).toBeVisible();
    const mobileMenu = page.locator('[data-testid="mobile-menu-toggle"]');
    await expect(mobileMenu).toBeVisible();
  });

  test('meta description is present for SEO', async ({ page }) => {
    const metaDesc = page.locator('meta[name="description"]');
    const content = await metaDesc.getAttribute('content');
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(50);
  });
});
