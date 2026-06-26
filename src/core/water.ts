import { overlapDays } from './dates.ts';
import { assertCents, roundHalfUp } from './money.ts';
import type { Cents, IsoDate } from './types.ts';

export interface QldWaterChargeEligibility {
  premisesIndividuallyMetered: boolean;
  premisesWaterEfficient: boolean;
  agreementSaysTenantPaysConsumption: boolean;
}

export function canChargeFullQldWaterConsumption(eligibility: QldWaterChargeEligibility): boolean {
  return (
    eligibility.premisesIndividuallyMetered &&
    eligibility.premisesWaterEfficient &&
    eligibility.agreementSaysTenantPaysConsumption
  );
}

export function calculateEligibleWaterUsageCents(parts: {
  stateBulkWaterUsageCents?: Cents;
  distributionUsageCents?: Cents;
  otherEligibleUsageCents?: Cents;
}): Cents {
  const values = [
    parts.stateBulkWaterUsageCents ?? 0,
    parts.distributionUsageCents ?? 0,
    parts.otherEligibleUsageCents ?? 0,
  ];

  values.forEach((value, index) => assertCents(value, `waterUsagePart${index}`));

  return values.reduce((total, value) => total + value, 0);
}

export function calculateWaterChargeByMeterReadingCents(input: {
  startReadingKl: number;
  endReadingKl: number;
  eligibleRateCentsPerKl: Cents;
}): Cents {
  assertCents(input.eligibleRateCentsPerKl, 'eligibleRateCentsPerKl');

  if (input.endReadingKl < input.startReadingKl) {
    throw new RangeError('endReadingKl cannot be less than startReadingKl');
  }

  const usageKl = input.endReadingKl - input.startReadingKl;
  return roundHalfUp(usageKl * input.eligibleRateCentsPerKl);
}

export function calculateWaterChargeByBillProportionCents(input: {
  billableUsageCents: Cents;
  billStartDate: IsoDate;
  billEndDateExclusive: IsoDate;
  tenancyStartDate: IsoDate;
  tenancyEndDateExclusive: IsoDate;
}): Cents {
  assertCents(input.billableUsageCents, 'billableUsageCents');

  const billDays = overlapDays(
    input.billStartDate,
    input.billEndDateExclusive,
    input.billStartDate,
    input.billEndDateExclusive,
  );

  if (billDays <= 0) {
    throw new RangeError('water bill period must be at least 1 day');
  }

  const tenantDays = overlapDays(
    input.billStartDate,
    input.billEndDateExclusive,
    input.tenancyStartDate,
    input.tenancyEndDateExclusive,
  );

  return roundHalfUp((input.billableUsageCents * tenantDays) / billDays);
}

export function calculateSubmeterShareCents(input: {
  billableUsageCents: Cents;
  tenantUsageKl: number;
  totalSubmeterUsageKl: number;
}): Cents {
  assertCents(input.billableUsageCents, 'billableUsageCents');

  if (input.tenantUsageKl < 0) {
    throw new RangeError('tenantUsageKl cannot be negative');
  }

  if (input.totalSubmeterUsageKl <= 0) {
    throw new RangeError('totalSubmeterUsageKl must be greater than 0');
  }

  return roundHalfUp((input.billableUsageCents * input.tenantUsageKl) / input.totalSubmeterUsageKl);
}
