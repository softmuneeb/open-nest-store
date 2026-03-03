/**
 * UNIT TESTS — Shipping Calculator
 * RED: These will fail until app/lib/shipping/calculator.ts is created.
 */
import { describe, test, expect } from 'vitest';
import {
  calculateShipping,
  FREE_SHIPPING_THRESHOLD_AED,
  type ShippingInput,
} from '~/lib/shipping/calculator';

describe('calculateShipping()', () => {
  const baseInput: ShippingInput = {
    subtotal_aed: 200,
    weight_kg: 0.5,
    emirate: 'Dubai',
    method: 'standard',
  };

  test('returns 0 for orders over the free shipping threshold', () => {
    const result = calculateShipping({ ...baseInput, subtotal_aed: FREE_SHIPPING_THRESHOLD_AED + 1 });
    expect(result).toBe(0);
  });

  test('returns 0 for orders exactly at the free shipping threshold', () => {
    const result = calculateShipping({ ...baseInput, subtotal_aed: FREE_SHIPPING_THRESHOLD_AED });
    expect(result).toBe(0);
  });

  test('charges standard rate for Dubai delivery under 1 kg', () => {
    const result = calculateShipping({ ...baseInput, weight_kg: 0.8 });
    expect(result).toBeGreaterThan(0);
    expect(result).toBeTypeOf('number');
  });

  test('charges more for heavier items', () => {
    const light = calculateShipping({ ...baseInput, weight_kg: 0.5 });
    const heavy = calculateShipping({ ...baseInput, weight_kg: 5 });
    expect(heavy).toBeGreaterThan(light);
  });

  test('adds AED 25 surcharge for express delivery', () => {
    const standard = calculateShipping({ ...baseInput, method: 'standard' });
    const express = calculateShipping({ ...baseInput, method: 'express' });
    expect(express).toBe(standard + 25);
  });

  test('returns higher rate for Fujairah vs Dubai', () => {
    const dubai = calculateShipping({ ...baseInput, emirate: 'Dubai' });
    const fujairah = calculateShipping({ ...baseInput, emirate: 'Fujairah' });
    expect(fujairah).toBeGreaterThanOrEqual(dubai);
  });

  test('returns number type (not NaN)', () => {
    const result = calculateShipping(baseInput);
    expect(result).not.toBeNaN();
  });

  test('free shipping overrides express surcharge', () => {
    const result = calculateShipping({
      ...baseInput,
      subtotal_aed: FREE_SHIPPING_THRESHOLD_AED + 100,
      method: 'express',
    });
    expect(result).toBe(0);
  });

  test('handles zero weight (uses minimum rate)', () => {
    const result = calculateShipping({ ...baseInput, weight_kg: 0 });
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).not.toBeNaN();
  });

  test('throws for unknown emirate', () => {
    expect(() =>
      calculateShipping({ ...baseInput, emirate: 'Unknown City' as never })
    ).toThrowError(/unknown emirate/i);
  });
});

describe('FREE_SHIPPING_THRESHOLD_AED constant', () => {
  test('is a positive number', () => {
    expect(FREE_SHIPPING_THRESHOLD_AED).toBeGreaterThan(0);
  });

  test('is set to 500', () => {
    expect(FREE_SHIPPING_THRESHOLD_AED).toBe(500);
  });
});
