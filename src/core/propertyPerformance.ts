import { roundHalfUp } from './money.ts';
import type { Cents } from './types.ts';

export function calculateGrossYieldPercent(weeklyRentCents: Cents, propertyValueCents: Cents): number {
  if (propertyValueCents <= 0) {
    throw new RangeError('propertyValueCents must be greater than 0');
  }

  const annualRentCents = weeklyRentCents * 52;
  return roundPercent((annualRentCents / propertyValueCents) * 100);
}

export function calculateNetYieldPercent(input: {
  annualRentCents: Cents;
  annualOperatingExpensesCents: Cents;
  vacancyLossCents?: Cents;
  propertyValueCents: Cents;
}): number {
  if (input.propertyValueCents <= 0) {
    throw new RangeError('propertyValueCents must be greater than 0');
  }

  const netAnnualIncomeCents =
    input.annualRentCents - input.annualOperatingExpensesCents - (input.vacancyLossCents ?? 0);

  return roundPercent((netAnnualIncomeCents / input.propertyValueCents) * 100);
}

export function calculateOccupancyRatePercent(occupiedDays: number, availableRentalDays: number): number {
  if (availableRentalDays <= 0) {
    throw new RangeError('availableRentalDays must be greater than 0');
  }

  return roundPercent((occupiedDays / availableRentalDays) * 100);
}

export function calculateVacancyLossCents(marketDailyRentCents: number, vacantDays: number): Cents {
  if (vacantDays < 0) {
    throw new RangeError('vacantDays cannot be negative');
  }

  return roundHalfUp(marketDailyRentCents * vacantDays);
}

export function calculateRentCollectionRatePercent(rentCollectedCents: Cents, rentDueCents: Cents): number {
  if (rentDueCents <= 0) {
    throw new RangeError('rentDueCents must be greater than 0');
  }

  return roundPercent((rentCollectedCents / rentDueCents) * 100);
}

function roundPercent(percent: number): number {
  return roundHalfUp(percent * 100) / 100;
}
