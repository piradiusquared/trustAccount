import type { Cents } from './types.ts';

export function assertCents(value: Cents, name = 'amount'): void {
  if (!Number.isInteger(value)) {
    throw new TypeError(`${name} must be an integer number of cents`);
  }
}

export function roundHalfUp(value: number): number {
  return value >= 0 ? Math.floor(value + 0.5) : Math.ceil(value - 0.5);
}

export function dollarsToCents(dollars: number): Cents {
  return roundHalfUp(dollars * 100);
}

export function centsToDollars(cents: Cents): number {
  assertCents(cents, 'cents');
  return cents / 100;
}

export function prorateCents(amountCents: Cents, numerator: number, denominator: number): Cents {
  assertCents(amountCents, 'amountCents');

  if (denominator <= 0) {
    throw new RangeError('denominator must be greater than 0');
  }

  if (numerator < 0) {
    throw new RangeError('numerator cannot be negative');
  }

  return roundHalfUp((amountCents * numerator) / denominator);
}

export function calculateGstOnExclusive(exGstCents: Cents, gstRate = 0.1): {
  exGstCents: Cents;
  gstCents: Cents;
  incGstCents: Cents;
} {
  assertCents(exGstCents, 'exGstCents');

  const gstCents = roundHalfUp(exGstCents * gstRate);

  return {
    exGstCents,
    gstCents,
    incGstCents: exGstCents + gstCents,
  };
}

export function splitGstFromInclusive(incGstCents: Cents, gstRate = 0.1): {
  exGstCents: Cents;
  gstCents: Cents;
  incGstCents: Cents;
} {
  assertCents(incGstCents, 'incGstCents');

  const gstCents = roundHalfUp(incGstCents * (gstRate / (1 + gstRate)));

  return {
    exGstCents: incGstCents - gstCents,
    gstCents,
    incGstCents,
  };
}
