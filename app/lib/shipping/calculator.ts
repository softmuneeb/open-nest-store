export const FREE_SHIPPING_THRESHOLD_AED = 500;

export type UAEEmirate =
  | 'Abu Dhabi'
  | 'Dubai'
  | 'Sharjah'
  | 'Ajman'
  | 'Umm Al Quwain'
  | 'Ras Al Khaimah'
  | 'Fujairah';

export type ShippingMethod = 'standard' | 'express';

export interface ShippingInput {
  subtotal_aed: number;
  weight_kg: number;
  emirate: UAEEmirate;
  method: ShippingMethod;
}

/**
 * Base rates per emirate (AED flat + AED per kg)
 */
const EMIRATE_RATES: Record<UAEEmirate, { base: number; perKg: number }> = {
  Dubai:              { base: 15, perKg: 3 },
  Sharjah:            { base: 15, perKg: 3 },
  Ajman:              { base: 15, perKg: 3 },
  'Abu Dhabi':        { base: 20, perKg: 4 },
  'Umm Al Quwain':    { base: 20, perKg: 4 },
  'Ras Al Khaimah':   { base: 20, perKg: 4 },
  Fujairah:           { base: 25, perKg: 5 },
};

const EXPRESS_SURCHARGE_AED = 25;

/**
 * Calculate shipping cost in AED.
 * Returns 0 when subtotal meets the free-shipping threshold.
 */
export function calculateShipping(input: ShippingInput): number {
  if (input.subtotal_aed >= FREE_SHIPPING_THRESHOLD_AED) {
    return 0;
  }

  const rates = EMIRATE_RATES[input.emirate as UAEEmirate];
  if (!rates) {
    throw new Error(`Unknown emirate: ${input.emirate}`);
  }

  const weight = Math.max(0, input.weight_kg);
  const base = rates.base + weight * rates.perKg;
  const surcharge = input.method === 'express' ? EXPRESS_SURCHARGE_AED : 0;

  return Math.round((base + surcharge) * 100) / 100;
}
