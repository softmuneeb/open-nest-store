/**
 * UNIT TESTS — <ProductCard /> Component
 * RED: These will fail until app/components/product/ProductCard.tsx is created.
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from '~/components/product/ProductCard';
import productsFixture from '../../fixtures/products.json';

const inStockProduct = productsFixture[0];     // Intel i9 — in_stock, has compare price
const outOfStockProduct = productsFixture[1];  // AMD 7950X — out_of_stock

const RATES = {
  AED: { factor: 1, symbol: 'AED' },
  SAR: { factor: 1.02, symbol: 'SAR' },
  USD: { factor: 0.2717, symbol: '$' },
};

describe('<ProductCard />', () => {
  const mockAddToCart = vi.fn();
  const mockWishlist = vi.fn();

  beforeEach(() => {
    mockAddToCart.mockClear();
    mockWishlist.mockClear();
  });

  // ─── Rendering ────────────────────────────────────────────────────────────

  test('renders the product name', () => {
    render(
      <ProductCard
        product={inStockProduct as never}
        currency="AED"
        rates={RATES}
        onAddToCart={mockAddToCart}
        onWishlist={mockWishlist}
      />
    );
    expect(screen.getByText(inStockProduct.name)).toBeInTheDocument();
  });

  test('renders the product brand name', () => {
    render(
      <ProductCard
        product={inStockProduct as never}
        currency="AED"
        rates={RATES}
        onAddToCart={mockAddToCart}
        onWishlist={mockWishlist}
      />
    );
    expect(screen.getByText(inStockProduct.brand!.name)).toBeInTheDocument();
  });

  test('renders price in AED by default', () => {
    render(
      <ProductCard
        product={inStockProduct as never}
        currency="AED"
        rates={RATES}
        onAddToCart={mockAddToCart}
        onWishlist={mockWishlist}
      />
    );
    expect(screen.getByText(/2,199/)).toBeInTheDocument();
  });

  test('renders price in SAR when currency is SAR', () => {
    render(
      <ProductCard
        product={inStockProduct as never}
        currency="SAR"
        rates={RATES}
        onAddToCart={mockAddToCart}
        onWishlist={mockWishlist}
      />
    );
    // 2199 * 1.02 = 2242.98
    expect(screen.getByText(/2,242/)).toBeInTheDocument();
  });

  test('renders compare price with strikethrough when available', () => {
    render(
      <ProductCard
        product={inStockProduct as never}
        currency="AED"
        rates={RATES}
        onAddToCart={mockAddToCart}
        onWishlist={mockWishlist}
      />
    );
    const strikethrough = screen.getByText(/2,499/);
    expect(strikethrough).toBeInTheDocument();
    expect(strikethrough.tagName.toLowerCase()).toMatch(/del|s/);
  });

  test('shows "In Stock" badge for in_stock products', () => {
    render(
      <ProductCard
        product={inStockProduct as never}
        currency="AED"
        rates={RATES}
        onAddToCart={mockAddToCart}
        onWishlist={mockWishlist}
      />
    );
    expect(screen.getByText(/in stock/i)).toBeInTheDocument();
  });

  test('shows "Out of Stock" badge for out_of_stock products', () => {
    render(
      <ProductCard
        product={outOfStockProduct as never}
        currency="AED"
        rates={RATES}
        onAddToCart={mockAddToCart}
        onWishlist={mockWishlist}
      />
    );
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
  });

  test('renders product image with correct alt text', () => {
    render(
      <ProductCard
        product={inStockProduct as never}
        currency="AED"
        rates={RATES}
        onAddToCart={mockAddToCart}
        onWishlist={mockWishlist}
      />
    );
    const img = screen.getByAltText(inStockProduct.images[0].alt);
    expect(img).toBeInTheDocument();
  });

  // ─── Interactions ─────────────────────────────────────────────────────────

  test('calls onAddToCart with product._id and qty=1 when "Add to Cart" clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProductCard
        product={inStockProduct as never}
        currency="AED"
        rates={RATES}
        onAddToCart={mockAddToCart}
        onWishlist={mockWishlist}
      />
    );
    await user.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(mockAddToCart).toHaveBeenCalledOnce();
    expect(mockAddToCart).toHaveBeenCalledWith(inStockProduct._id, 1);
  });

  test('"Add to Cart" button is disabled for out_of_stock products', () => {
    render(
      <ProductCard
        product={outOfStockProduct as never}
        currency="AED"
        rates={RATES}
        onAddToCart={mockAddToCart}
        onWishlist={mockWishlist}
      />
    );
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeDisabled();
  });

  test('does not call onAddToCart when out-of-stock button clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProductCard
        product={outOfStockProduct as never}
        currency="AED"
        rates={RATES}
        onAddToCart={mockAddToCart}
        onWishlist={mockWishlist}
      />
    );
    await user.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(mockAddToCart).not.toHaveBeenCalled();
  });

  test('calls onWishlist with product._id when wishlist button clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProductCard
        product={inStockProduct as never}
        currency="AED"
        rates={RATES}
        onAddToCart={mockAddToCart}
        onWishlist={mockWishlist}
      />
    );
    await user.click(screen.getByRole('button', { name: /wishlist/i }));
    expect(mockWishlist).toHaveBeenCalledOnce();
    expect(mockWishlist).toHaveBeenCalledWith(inStockProduct._id);
  });

  // ─── Accessibility ────────────────────────────────────────────────────────

  test('product link points to the correct product URL', () => {
    render(
      <ProductCard
        product={inStockProduct as never}
        currency="AED"
        rates={RATES}
        onAddToCart={mockAddToCart}
        onWishlist={mockWishlist}
      />
    );
    const link = screen.getByRole('link', { name: new RegExp(inStockProduct.name, 'i') });
    expect(link).toHaveAttribute('href', `/products/${inStockProduct.slug}`);
  });
});
