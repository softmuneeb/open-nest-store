/**
 * E2E TESTS — User Account
 * RED: Will fail until account pages are implemented.
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const TEST_USER = {
  email: `e2e_test_${Date.now()}@example.com`,
  password: 'E2eTestPass@123',
  first_name: 'E2E',
  last_name: 'Tester',
};

const EXISTING_USER = {
  email: 'alice@example.com',
  password: 'Password@123',
};

test.describe('User Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/register');
  });

  test('registration page loads with form fields', async ({ page }) => {
    await expect(page.locator('[data-testid="register-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-password"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-first-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-last-name"]')).toBeVisible();
  });

  test('successful registration redirects to account dashboard', async ({ page }) => {
    await page.fill('[data-testid="register-first-name"]', TEST_USER.first_name);
    await page.fill('[data-testid="register-last-name"]', TEST_USER.last_name);
    await page.fill('[data-testid="register-email"]', TEST_USER.email);
    await page.fill('[data-testid="register-password"]', TEST_USER.password);
    await page.click('[data-testid="register-submit"]');
    await expect(page).toHaveURL(/\/account\/dashboard/, { timeout: 5000 });
  });

  test('shows error for already registered email', async ({ page }) => {
    await page.fill('[data-testid="register-first-name"]', 'Alice');
    await page.fill('[data-testid="register-last-name"]', 'Repeat');
    await page.fill('[data-testid="register-email"]', EXISTING_USER.email);
    await page.fill('[data-testid="register-password"]', 'AnyPassword@123');
    await page.click('[data-testid="register-submit"]');
    const error = page.locator('[data-testid="register-error"]');
    await expect(error).toBeVisible({ timeout: 3000 });
    await expect(error).toContainText(/email.*already/i);
  });

  test('shows validation error for invalid email format', async ({ page }) => {
    await page.fill('[data-testid="register-email"]', 'not-valid');
    await page.click('[data-testid="register-submit"]');
    await expect(page.locator('[data-testid="register-email-error"]')).toBeVisible();
  });

  test('shows validation error for weak password', async ({ page }) => {
    await page.fill('[data-testid="register-email"]', 'test@example.com');
    await page.fill('[data-testid="register-password"]', '123');
    await page.click('[data-testid="register-submit"]');
    await expect(page.locator('[data-testid="register-password-error"]')).toBeVisible();
  });

  test('no accessibility violations on register page', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toHaveLength(0);
  });
});

test.describe('User Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/login');
  });

  test('login page shows email and password fields', async ({ page }) => {
    await expect(page.locator('[data-testid="login-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-password"]')).toBeVisible();
  });

  test('successful login redirects to account dashboard', async ({ page }) => {
    await page.fill('[data-testid="login-email"]', EXISTING_USER.email);
    await page.fill('[data-testid="login-password"]', EXISTING_USER.password);
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/account\/dashboard/, { timeout: 5000 });
  });

  test('wrong password shows error message', async ({ page }) => {
    await page.fill('[data-testid="login-email"]', EXISTING_USER.email);
    await page.fill('[data-testid="login-password"]', 'WrongPassword!');
    await page.click('[data-testid="login-submit"]');
    const error = page.locator('[data-testid="login-error"]');
    await expect(error).toBeVisible({ timeout: 3000 });
    await expect(error).toContainText(/invalid.*credentials/i);
  });

  test('unknown email shows same generic error (no email enumeration)', async ({ page }) => {
    await page.fill('[data-testid="login-email"]', 'nobody@nowhere.com');
    await page.fill('[data-testid="login-password"]', 'AnyPass@123');
    await page.click('[data-testid="login-submit"]');
    const error = page.locator('[data-testid="login-error"]');
    await expect(error).toBeVisible({ timeout: 3000 });
    await expect(error).toContainText(/invalid.*credentials/i);
  });

  test('no accessibility violations on login page', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toHaveLength(0);
  });
});

test.describe('Account Dashboard', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="login-email"]', EXISTING_USER.email);
    await page.fill('[data-testid="login-password"]', EXISTING_USER.password);
    await page.click('[data-testid="login-submit"]');
    await page.waitForURL(/\/account\/dashboard/);
  });

  test('dashboard shows user first name greeting', async ({ page }) => {
    const greeting = page.locator('[data-testid="account-greeting"]');
    await expect(greeting).toContainText('Alice');
  });

  test('dashboard navigation links are present', async ({ page }) => {
    await expect(page.locator('[data-testid="nav-orders"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-wishlist"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-addresses"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-account-settings"]')).toBeVisible();
  });

  test('orders section shows order history', async ({ page }) => {
    await page.click('[data-testid="nav-orders"]');
    await expect(page).toHaveURL(/\/account\/orders/);
    const ordersList = page.locator('[data-testid="orders-list"]');
    await expect(ordersList).toBeVisible();
  });

  test('empty orders state shows message', async ({ page }) => {
    await page.goto('/account/orders');
    // If no orders for this test user, show empty state
    const emptyOrders = page.locator('[data-testid="orders-empty"]');
    const ordersList = page.locator('[data-testid="order-item"]');
    const hasOrders = await ordersList.count();
    if (!hasOrders) {
      await expect(emptyOrders).toBeVisible();
    }
  });

  test('wishlist section loads', async ({ page }) => {
    await page.goto('/account/wishlist');
    await expect(page.locator('[data-testid="wishlist-container"]')).toBeVisible();
  });

  test('adding product to wishlist from PDP appears in wishlist', async ({ page }) => {
    await page.goto('/product/intel-core-i9-14900k-desktop-processor');
    await page.click('[data-testid="wishlist-btn"]');
    await page.waitForLoadState('networkidle');
    await page.goto('/account/wishlist');
    const items = page.locator('[data-testid="wishlist-item"]');
    await expect(items.first()).toBeVisible();
    await expect(items.first()).toContainText('Intel Core i9-14900K');
  });

  test('addresses section loads with add address button', async ({ page }) => {
    await page.goto('/account/addresses');
    await expect(page.locator('[data-testid="add-address-btn"]')).toBeVisible();
  });

  test('adding a new address shows it in the list', async ({ page }) => {
    await page.goto('/account/addresses');
    await page.click('[data-testid="add-address-btn"]');
    await page.fill('[data-testid="address-first-name"]', 'Alice');
    await page.fill('[data-testid="address-last-name"]', 'Example');
    await page.fill('[data-testid="address-phone"]', '+971501234567');
    await page.fill('[data-testid="address-line1"]', '456 New Street');
    await page.selectOption('[data-testid="address-emirate"]', 'Abu Dhabi');
    await page.click('[data-testid="address-save-btn"]');
    await page.waitForLoadState('networkidle');
    const addresses = page.locator('[data-testid="address-card"]');
    await expect(addresses.last()).toContainText('456 New Street');
  });

  test('setting an address as default marks it appropriately', async ({ page }) => {
    await page.goto('/account/addresses');
    const setDefaultBtns = page.locator('[data-testid="set-default-address"]');
    const count = await setDefaultBtns.count();
    if (count > 0) {
      await setDefaultBtns.first().click();
      await page.waitForLoadState('networkidle');
      const defaultBadge = page.locator('[data-testid="default-address-badge"]');
      await expect(defaultBadge.first()).toBeVisible();
    }
  });

  test('logout button signs out and redirects to homepage', async ({ page }) => {
    await page.click('[data-testid="logout-btn"]');
    await expect(page).toHaveURL('/');
    const loginLink = page.locator('[data-testid="header-login-link"]');
    await expect(loginLink).toBeVisible();
  });

  test('no accessibility violations on account dashboard', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toHaveLength(0);
  });
});

test.describe('Authenticated Route Guards', () => {
  test('visiting /account/dashboard when logged out redirects to /login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/account/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('visiting /account/orders when logged out redirects to /login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/account/orders');
    await expect(page).toHaveURL(/\/login/);
  });
});
