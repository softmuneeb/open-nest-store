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

// ── Text Contrast / Readability ────────────────────────────────────────────────

test.describe('Homepage — Text contrast & readability', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  /** Relative luminance per WCAG 2.1 spec */
  const getLuminance = `
    function toLinear(c) {
      c /= 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }
    function luminance(r, g, b) {
      return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    }
    function contrastRatio(rgb1, rgb2) {
      const l1 = luminance(...rgb1);
      const l2 = luminance(...rgb2);
      const lighter = Math.max(l1, l2);
      const darker  = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }
    function parseRgb(cssColor) {
      const m = cssColor.match(/\\d+/g);
      return m ? [+m[0], +m[1], +m[2]] : [0, 0, 0];
    }
  `;

  test('hero H1 has WCAG AA contrast ratio ≥ 4.5 against its background', async ({ page }) => {
    const ratio = await page.evaluate((script) => {
      eval(script);
      const el = document.querySelector('[data-testid="hero-banner"] h1');
      if (!el) return 0;
      const style = window.getComputedStyle(el);
      const textColor = parseRgb(style.color);
      const bgColor   = [10, 25, 71]; // bg-blue-950 overlay (#0a1947 ≈ rgb(10,25,71))
      return contrastRatio(textColor, bgColor);
    }, getLuminance);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('stats strip numbers are readable — contrast ≥ 4.5', async ({ page }) => {
    const ratio = await page.evaluate((script) => {
      eval(script);
      const el = document.querySelector('[data-testid="stat-item"] p');
      if (!el) return 0;
      const style = window.getComputedStyle(el);
      const parent = el.closest('[data-testid="stats-strip"]');
      const bg = parent ? window.getComputedStyle(parent).backgroundColor : 'rgb(10,25,71)';
      return contrastRatio(parseRgb(style.color), parseRgb(bg));
    }, getLuminance);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('footer column headings have sufficient contrast against footer background', async ({ page }) => {
    const ratio = await page.evaluate((script) => {
      eval(script);
      const el = document.querySelector('footer h3');
      if (!el) return 0;
      const style    = window.getComputedStyle(el);
      const bgStyle  = window.getComputedStyle(document.querySelector('footer')!);
      return contrastRatio(parseRgb(style.color), parseRgb(bgStyle.backgroundColor));
    }, getLuminance);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('product prices (red text) have contrast ≥ 3 against card background (WCAG AA large text)', async ({ page }) => {
    const ratio = await page.evaluate((script) => {
      eval(script);
      const price = document.querySelector('[data-testid="product-price"]');
      if (!price) return 999; // no products yet → pass
      const card  = price.closest('[data-testid="product-card"]') as HTMLElement;
      const priceStyle = window.getComputedStyle(price);
      const cardStyle  = card ? window.getComputedStyle(card) : { backgroundColor: 'rgb(255,255,255)' };
      return contrastRatio(parseRgb(priceStyle.color), parseRgb(cardStyle.backgroundColor));
    }, getLuminance);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  test('hero paragraph text is legible — contrast ≥ 3 (large/secondary text)', async ({ page }) => {
    const ratio = await page.evaluate((script) => {
      eval(script);
      const el = document.querySelector('[data-testid="hero-banner"] p');
      if (!el) return 0;
      const style = window.getComputedStyle(el);
      const bg    = [10, 25, 71];
      return contrastRatio(parseRgb(style.color), bg);
    }, getLuminance);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });
});

// ── Products Loading on Home Screen ───────────────────────────────────────────

test.describe('Homepage — Products loading', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('featured products section is present', async ({ page }) => {
    await expect(page.locator('[data-testid="featured-products"]')).toBeVisible();
  });

  test('at least one product card is rendered from the database', async ({ page }) => {
    const section = page.locator('[data-testid="featured-products"]');
    await expect(section).toBeVisible();
    const cards = section.locator('[data-testid="product-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
  });

  test('each product card shows a name', async ({ page }) => {
    const names = page.locator('[data-testid="product-name"]');
    const count = await names.count();
    if (count === 0) return; // no seeded products → skip assertions
    for (let i = 0; i < Math.min(count, 4); i++) {
      const text = await names.nth(i).innerText();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('each product card shows an AED price', async ({ page }) => {
    const prices = page.locator('[data-testid="product-price"]');
    const count = await prices.count();
    if (count === 0) return;
    for (let i = 0; i < Math.min(count, 4); i++) {
      await expect(prices.nth(i)).toContainText('AED');
    }
  });

  test('product cards link to /products/:slug URLs', async ({ page }) => {
    const cards = page.locator('[data-testid="product-card"]');
    const count = await cards.count();
    if (count === 0) return;
    const href = await cards.first().getAttribute('href');
    expect(href).toMatch(/\/products\/.+/);
  });

  test('products-empty notice shown when no products in DB', async ({ page }) => {
    // If product cards exist, this message must NOT be present and vice-versa.
    const cards  = page.locator('[data-testid="product-card"]');
    const empty  = page.locator('[data-testid="products-empty"]');
    const cardCount = await cards.count();
    if (cardCount > 0) {
      await expect(empty).not.toBeVisible();
    } else {
      await expect(empty).toBeVisible();
    }
  });
});

// ── Section Structure (itechdevices.ae parity) ────────────────────────────────

test.describe('Homepage — Section structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('stats strip is visible', async ({ page }) => {
    await expect(page.locator('[data-testid="stats-strip"]')).toBeVisible();
  });

  test('stats strip displays 5 stat items', async ({ page }) => {
    const items = page.locator('[data-testid="stat-item"]');
    await expect(items).toHaveCount(5);
  });

  test('stats strip includes "20,000+" clients stat', async ({ page }) => {
    await expect(page.locator('[data-testid="stats-strip"]')).toContainText('20,000+');
  });

  test('stats strip includes "24/7" support stat', async ({ page }) => {
    await expect(page.locator('[data-testid="stats-strip"]')).toContainText('24/7');
  });

  test('featured brands section is visible', async ({ page }) => {
    await expect(page.locator('[data-testid="featured-brands"]')).toBeVisible();
  });

  test('featured brands section shows AMD and Intel', async ({ page }) => {
    const brands = page.locator('[data-testid="featured-brands"]');
    await expect(brands).toContainText('AMD');
    await expect(brands).toContainText('Intel');
  });

  test('at least 8 brand items are listed', async ({ page }) => {
    const items = page.locator('[data-testid="brand-item"]');
    expect(await items.count()).toBeGreaterThanOrEqual(8);
  });

  test('first promotional banner is visible', async ({ page }) => {
    await expect(page.locator('[data-testid="promo-banner-1"]')).toBeVisible();
  });

  test('second promotional banner is visible', async ({ page }) => {
    await expect(page.locator('[data-testid="promo-banner-2"]')).toBeVisible();
  });

  test('trust badges section is visible', async ({ page }) => {
    await expect(page.locator('[data-testid="trust-badges"]')).toBeVisible();
  });

  test('footer has Featured Categories column', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toContainText('Featured Categories');
  });

  test('footer has Customer Services column', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toContainText('Customer Services');
  });

  test('footer has Corporate Information column', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toContainText('Corporate Information');
  });

  test('footer contact shows UAE location', async ({ page }) => {
    const contact = page.locator('[data-testid="footer-contact"]');
    await expect(contact).toBeVisible();
    await expect(contact).toContainText('UAE');
  });

  test('footer social links are present', async ({ page }) => {
    const socials = page.locator('[data-testid="social-links"] a');
    expect(await socials.count()).toBeGreaterThanOrEqual(2);
  });

  test('hero has "Shop Now" and "Browse Categories" CTAs', async ({ page }) => {
    const hero = page.locator('[data-testid="hero-banner"]');
    await expect(hero.locator('[data-testid="hero-cta"]')).toBeVisible();
    await expect(hero.locator('[data-testid="hero-browse-cta"]')).toBeVisible();
  });
});
