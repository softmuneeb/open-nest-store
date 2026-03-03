export type CurrencyCode = 'AED' | 'SAR' | 'USD';

export interface CurrencyRate {
  factor: number;
  symbol: string;
}

export type RatesMap = Record<string, CurrencyRate>;

export const DEFAULT_RATES: RatesMap = {
  AED: { factor: 1, symbol: 'AED' },
  SAR: { factor: 1.02, symbol: 'SAR' },
  USD: { factor: 0.2717, symbol: '$' },
};

/**
 * Convert a price from AED to the target currency.
 * All prices are stored in AED; this calculates the display value.
 */
export function convertPrice(
  priceAed: number,
  currency: string,
  rates: RatesMap = DEFAULT_RATES
): number {
  const rate = rates[currency];
  if (!rate) {
    throw new RangeError(`Unsupported currency: ${currency}`);
  }
  return Math.round(priceAed * rate.factor * 100) / 100;
}

/**
 * Format a price with its currency symbol and comma-separated thousands.
 */
export function formatPrice(
  price: number,
  currency: string,
  rates: RatesMap = DEFAULT_RATES
): string {
  const rate = rates[currency];
  if (!rate) {
    throw new RangeError(`Unsupported currency: ${currency}`);
  }
  const formatted = price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${rate.symbol} ${formatted}`;
}

/**
 * Return all currency codes available in the given rates map.
 */
export function getSupportedCurrencies(rates: RatesMap = DEFAULT_RATES): string[] {
  return Object.keys(rates);
}
