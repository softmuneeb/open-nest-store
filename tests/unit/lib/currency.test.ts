/**
 * UNIT TESTS — Currency Converter
 * RED: These will fail until app/lib/currency/converter.ts is created.
 */
import { describe, test, expect } from 'vitest';
import {
  convertPrice,
  formatPrice,
  getSupportedCurrencies,
} from '~/lib/currency/converter';

const RATES = {
  AED: { factor: 1, symbol: 'AED' },
  SAR: { factor: 1.02, symbol: 'SAR' },
  USD: { factor: 0.2717, symbol: '$' },
};

describe('convertPrice()', () => {
  test('returns same amount when converting AED to AED', () => {
    expect(convertPrice(100, 'AED', RATES)).toBe(100);
  });

  test('converts AED to SAR using factor 1.02', () => {
    expect(convertPrice(100, 'SAR', RATES)).toBeCloseTo(102, 2);
  });

  test('converts AED to USD using factor 0.2717', () => {
    expect(convertPrice(100, 'USD', RATES)).toBeCloseTo(27.17, 2);
  });

  test('converts AED 1000 to SAR correctly', () => {
    expect(convertPrice(1000, 'SAR', RATES)).toBeCloseTo(1020, 2);
  });

  test('handles zero price', () => {
    expect(convertPrice(0, 'USD', RATES)).toBe(0);
  });

  test('rounds result to 2 decimal places', () => {
    const result = convertPrice(99.999, 'AED', RATES);
    expect(result).toBe(100.0);
  });

  test('throws RangeError for unknown currency code', () => {
    expect(() => convertPrice(100, 'GBP' as never, RATES)).toThrowError(
      /unsupported currency/i
    );
  });

  test('handles large prices accurately', () => {
    expect(convertPrice(50000, 'USD', RATES)).toBeCloseTo(13585, 0);
  });
});

describe('formatPrice()', () => {
  test('formats AED price with symbol prefix', () => {
    expect(formatPrice(100, 'AED', RATES)).toBe('AED 100.00');
  });

  test('formats SAR price with symbol', () => {
    expect(formatPrice(102, 'SAR', RATES)).toBe('SAR 102.00');
  });

  test('formats USD price with $ symbol', () => {
    expect(formatPrice(27.17, 'USD', RATES)).toBe('$ 27.17');
  });

  test('formats zero', () => {
    expect(formatPrice(0, 'AED', RATES)).toBe('AED 0.00');
  });

  test('formats large price with commas', () => {
    expect(formatPrice(5000, 'AED', RATES)).toBe('AED 5,000.00');
  });
});

describe('getSupportedCurrencies()', () => {
  test('returns array of supported currency codes', () => {
    const currencies = getSupportedCurrencies(RATES);
    expect(currencies).toContain('AED');
    expect(currencies).toContain('SAR');
    expect(currencies).toContain('USD');
  });

  test('returns exactly the currencies in the rates map', () => {
    const currencies = getSupportedCurrencies(RATES);
    expect(currencies).toHaveLength(3);
  });
});
