/**
 * UNIT TESTS — <CartItem /> Component
 * RED: These will fail until app/components/cart/CartItem.tsx is created.
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartItem } from '~/components/cart/CartItem';
import productsFixture from '../../fixtures/products.json';

const product = productsFixture[0];

const mockCartItem = {
  id: 'ci_001',
  product_id: product._id,
  product: {
    _id: product._id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    price: product.price,
    stock: product.stock,
    images: product.images,
  },
  qty: 2,
  unit_price_aed: product.price.aed,
  line_total_aed: product.price.aed * 2,
};

const RATES = {
  AED: { factor: 1, symbol: 'AED' },
  SAR: { factor: 1.02, symbol: 'SAR' },
  USD: { factor: 0.2717, symbol: '$' },
};

describe('<CartItem />', () => {
  const mockQtyChange = vi.fn();
  const mockRemove = vi.fn();

  beforeEach(() => {
    mockQtyChange.mockClear();
    mockRemove.mockClear();
  });

  test('renders product name', () => {
    render(
      <CartItem
        item={mockCartItem as never}
        currency="AED"
        rates={RATES}
        onQtyChange={mockQtyChange}
        onRemove={mockRemove}
      />
    );
    expect(screen.getByText(product.name)).toBeInTheDocument();
  });

  test('renders product SKU', () => {
    render(
      <CartItem
        item={mockCartItem as never}
        currency="AED"
        rates={RATES}
        onQtyChange={mockQtyChange}
        onRemove={mockRemove}
      />
    );
    expect(screen.getByText(product.sku)).toBeInTheDocument();
  });

  test('renders current quantity', () => {
    render(
      <CartItem
        item={mockCartItem as never}
        currency="AED"
        rates={RATES}
        onQtyChange={mockQtyChange}
        onRemove={mockRemove}
      />
    );
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  test('renders line total (unit_price × qty)', () => {
    render(
      <CartItem
        item={mockCartItem as never}
        currency="AED"
        rates={RATES}
        onQtyChange={mockQtyChange}
        onRemove={mockRemove}
      />
    );
    // 2199 * 2 = 4398
    expect(screen.getByText(/4,398/)).toBeInTheDocument();
  });

  test('calls onQtyChange with item.id and qty+1 when + clicked', async () => {
    const user = userEvent.setup();
    render(
      <CartItem
        item={mockCartItem as never}
        currency="AED"
        rates={RATES}
        onQtyChange={mockQtyChange}
        onRemove={mockRemove}
      />
    );
    await user.click(screen.getByRole('button', { name: /increase quantity/i }));
    expect(mockQtyChange).toHaveBeenCalledWith(mockCartItem.id, 3);
  });

  test('calls onQtyChange with item.id and qty-1 when - clicked', async () => {
    const user = userEvent.setup();
    render(
      <CartItem
        item={mockCartItem as never}
        currency="AED"
        rates={RATES}
        onQtyChange={mockQtyChange}
        onRemove={mockRemove}
      />
    );
    await user.click(screen.getByRole('button', { name: /decrease quantity/i }));
    expect(mockQtyChange).toHaveBeenCalledWith(mockCartItem.id, 1);
  });

  test('decrement button is disabled when qty is 1', () => {
    render(
      <CartItem
        item={{ ...mockCartItem, qty: 1 } as never}
        currency="AED"
        rates={RATES}
        onQtyChange={mockQtyChange}
        onRemove={mockRemove}
      />
    );
    expect(screen.getByRole('button', { name: /decrease quantity/i })).toBeDisabled();
  });

  test('does not call onQtyChange below 1', async () => {
    const user = userEvent.setup();
    render(
      <CartItem
        item={{ ...mockCartItem, qty: 1 } as never}
        currency="AED"
        rates={RATES}
        onQtyChange={mockQtyChange}
        onRemove={mockRemove}
      />
    );
    await user.click(screen.getByRole('button', { name: /decrease quantity/i }));
    expect(mockQtyChange).not.toHaveBeenCalled();
  });

  test('calls onRemove with item.id when remove button clicked', async () => {
    const user = userEvent.setup();
    render(
      <CartItem
        item={mockCartItem as never}
        currency="AED"
        rates={RATES}
        onQtyChange={mockQtyChange}
        onRemove={mockRemove}
      />
    );
    await user.click(screen.getByRole('button', { name: /remove/i }));
    expect(mockRemove).toHaveBeenCalledWith(mockCartItem.id);
  });

  test('renders product thumbnail image', () => {
    render(
      <CartItem
        item={mockCartItem as never}
        currency="AED"
        rates={RATES}
        onQtyChange={mockQtyChange}
        onRemove={mockRemove}
      />
    );
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
  });
});
