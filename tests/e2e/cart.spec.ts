/**
 * E2E TESTS — Shopping Cart
 * RED: Will fail until cart page is implemented.
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PRODUCT_URL = '/product/intel-core-i9-14900k-desktop-processor';
const CART_URL = '/cart';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart by visiting cart and clearing it on each test
    await page.goto(CART_URL);
    const clearBtn = page.locator('[data-testid="clear-cart-btn"]');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
    }
  });

  test('empty cart shows empty state message', async ({ page }) => {
    await page.goto(CART_URL);
    const empty = page.locator('[data-testid="cart-empty"]');
    await expect(empty).toBeVisible();
    await expect(empty).toContainText(/your cart is empty/i);
  });

  test('empty cart shows Continue Shopping link', async ({ page }) => {
    await page.goto(CART_URL);
    const continueBtn = page.locator('[data-testid="cart-continue-shopping"]');
    await expect(continueBtn).toBeVisible();
  });

  test('adding a product from PDP shows it in cart', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    await page.click('[data-testid="add-to-cart-btn"]');
    await page.goto(CART_URL);
    const items = page.locator('[data-testid="cart-item"]');
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText('Intel Core i9-14900K');
  });

  test('cart item displays product image, name, price, quantity', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    await page.click('[data-testid="add-to-cart-btn"]');
    await page.goto(CART_URL);
    const item = page.locator('[data-testid="cart-item"]').first();
    await expect(item.locator('img')).toBeVisible();
    await expect(item.locator('[data-testid="cart-item-name"]')).toBeVisible();
    await expect(item.locator('[data-testid="cart-item-price"]')).toBeVisible();
    await expect(item.locator('[data-testid="cart-item-qty"]')).toBeVisible();
  });

  test('increasing quantity in cart updates line total', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    await page.click('[data-testid="add-to-cart-btn"]');
    await page.goto(CART_URL);
    const item = page.locator('[data-testid="cart-item"]').first();
    const priceBefore = await item.locator('[data-testid="cart-item-line-total"]').textContent();
    await item.locator('[data-testid="cart-qty-increment"]').click();
    await page.waitForLoadState('networkidle');
    const priceAfter = await item.locator('[data-testid="cart-item-line-total"]').textContent();
    expect(priceAfter).not.toBe(priceBefore);
  });

  test('cart subtotal updates when quantity changes', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    await page.click('[data-testid="add-to-cart-btn"]');
    await page.goto(CART_URL);
    const subtotalBefore = await page.locator('[data-testid="cart-subtotal"]').textContent();
    await page.locator('[data-testid="cart-qty-increment"]').first().click();
    await page.waitForLoadState('networkidle');
    const subtotalAfter = await page.locator('[data-testid="cart-subtotal"]').textContent();
    expect(subtotalAfter).not.toBe(subtotalBefore);
  });

  test('removing item from cart decrements item list', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    await page.click('[data-testid="add-to-cart-btn"]');
    await page.goto(CART_URL);
    await page.locator('[data-testid="cart-item-remove"]').first().click();
    await expect(page.locator('[data-testid="cart-empty"]')).toBeVisible({ timeout: 3000 });
  });

  test('cart summary shows subtotal, shipping, and total', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    await page.click('[data-testid="add-to-cart-btn"]');
    await page.goto(CART_URL);
    await expect(page.locator('[data-testid="cart-subtotal"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-shipping"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-total"]')).toBeVisible();
  });

  test('coupon code input is present', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    await page.click('[data-testid="add-to-cart-btn"]');
    await page.goto(CART_URL);
    const couponInput = page.locator('[data-testid="coupon-input"]');
    await expect(couponInput).toBeVisible();
  });

  test('applying valid coupon reduces the cart total', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    await page.click('[data-testid="add-to-cart-btn"]');
    await page.goto(CART_URL);
    const totalBefore = await page.locator('[data-testid="cart-total"]').textContent();
    await page.fill('[data-testid="coupon-input"]', 'SAVE10');
    await page.click('[data-testid="coupon-apply-btn"]');
    await page.waitForLoadState('networkidle');
    const totalAfter = await page.locator('[data-testid="cart-total"]').textContent();
    expect(totalAfter).not.toBe(totalBefore);
    await expect(page.locator('[data-testid="coupon-discount"]')).toBeVisible();
  });

  test('applying invalid coupon shows error message', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    await page.click('[data-testid="add-to-cart-btn"]');
    await page.goto(CART_URL);
    await page.fill('[data-testid="coupon-input"]', 'INVALID_CODE_XYZ');
    await page.click('[data-testid="coupon-apply-btn"]');
    const error = page.locator('[data-testid="coupon-error"]');
    await expect(error).toBeVisible({ timeout: 3000 });
  });

  test('Proceed to Checkout button navigates to checkout', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    await page.click('[data-testid="add-to-cart-btn"]');
    await page.goto(CART_URL);
    await page.click('[data-testid="checkout-btn"]');
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('cart badge in header shows correct item count', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    await page.click('[data-testid="add-to-cart-btn"]');
    const badge = page.locator('[data-testid="cart-badge"]');
    await expect(badge).toContainText('1');
  });

  test('no accessibility violations on cart page', async ({ page }) => {
    await page.goto(CART_URL);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toHaveLength(0);
  });
});
