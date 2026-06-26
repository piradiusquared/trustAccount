import { addCalendarMonths, addDays, daysBetween, fromEpochDay, overlapDays, toEpochDay } from './dates.ts';
import { assertCents, prorateCents, roundHalfUp } from './money.ts';
import type { Cents, IsoDate } from './types.ts';

export interface RentScheduleRow {
  startDate: IsoDate;
  endDateExclusive?: IsoDate;
  rentAmountCents: Cents;
  rentFrequencyDays: number;
}

export interface RentIncrease {
  oldRentCents: Cents;
  newRentCents: Cents;
  increaseCents: Cents;
  increasePercent: number;
}

export type QldRentInAdvanceAgreementType =
  | 'fixed-term'
  | 'periodic'
  | 'moveable'
  | 'rooming';

export function calculateDailyRentCents(rentAmountCents: Cents, rentFrequencyDays: number): number {
  assertCents(rentAmountCents, 'rentAmountCents');

  if (rentFrequencyDays <= 0) {
    throw new RangeError('rentFrequencyDays must be greater than 0');
  }

  return rentAmountCents / rentFrequencyDays;
}

export function calculateAnnualRentFromWeeklyCents(weeklyRentCents: Cents): Cents {
  assertCents(weeklyRentCents, 'weeklyRentCents');
  return weeklyRentCents * 52;
}

export function calculateMonthlyEquivalentFromWeeklyCents(weeklyRentCents: Cents): Cents {
  return prorateCents(calculateAnnualRentFromWeeklyCents(weeklyRentCents), 1, 12);
}

export function calculateProrataRentCents(
  rentAmountCents: Cents,
  rentFrequencyDays: number,
  chargeableDays: number,
): Cents {
  return prorateCents(rentAmountCents, chargeableDays, rentFrequencyDays);
}

export function calculateAccruedRentCents(
  rentSchedule: RentScheduleRow[],
  periodStartDate: IsoDate,
  periodEndDateExclusive: IsoDate,
): Cents {
  if (daysBetween(periodStartDate, periodEndDateExclusive) < 0) {
    throw new RangeError('period end date cannot be before period start date');
  }

  return rentSchedule.reduce((total, row) => {
    validateRentScheduleRow(row);

    const rowEndDateExclusive = row.endDateExclusive ?? periodEndDateExclusive;
    const chargeableDays = overlapDays(
      row.startDate,
      rowEndDateExclusive,
      periodStartDate,
      periodEndDateExclusive,
    );

    return total + calculateProrataRentCents(row.rentAmountCents, row.rentFrequencyDays, chargeableDays);
  }, 0);
}

export function derivePaidToDate(
  rentSchedule: RentScheduleRow[],
  leaseStartDate: IsoDate,
  rentCreditsCents: Cents,
): IsoDate {
  assertCents(rentCreditsCents, 'rentCreditsCents');

  if (rentCreditsCents <= 0) {
    return addDays(leaseStartDate, -1);
  }

  let searchEndDateExclusive = addCalendarMonths(leaseStartDate, 12);
  let attempts = 0;

  while (
    calculateAccruedRentCents(rentSchedule, leaseStartDate, searchEndDateExclusive) <= rentCreditsCents &&
    attempts < 100
  ) {
    searchEndDateExclusive = addCalendarMonths(searchEndDateExclusive, 12);
    attempts += 1;
  }

  const leaseStartEpoch = toEpochDay(leaseStartDate);
  let low = leaseStartEpoch;
  let high = toEpochDay(searchEndDateExclusive);

  while (low < high) {
    const mid = Math.ceil((low + high + 1) / 2);
    const midDateExclusive = fromEpochDay(mid);
    const accruedCents = calculateAccruedRentCents(rentSchedule, leaseStartDate, midDateExclusive);

    if (accruedCents <= rentCreditsCents) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return fromEpochDay(low - 1);
}

export function calculateRentArrearsCents(
  rentSchedule: RentScheduleRow[],
  leaseStartDate: IsoDate,
  asAtDateExclusive: IsoDate,
  rentCreditsCents: Cents,
): Cents {
  const accruedRentCents = calculateAccruedRentCents(rentSchedule, leaseStartDate, asAtDateExclusive);
  return Math.max(0, accruedRentCents - rentCreditsCents);
}

export function calculateRentInAdvanceCents(
  rentSchedule: RentScheduleRow[],
  leaseStartDate: IsoDate,
  asAtDateExclusive: IsoDate,
  rentCreditsCents: Cents,
): Cents {
  const accruedRentCents = calculateAccruedRentCents(rentSchedule, leaseStartDate, asAtDateExclusive);
  return Math.max(0, rentCreditsCents - accruedRentCents);
}

export function calculateDaysInArrears(paidToDateInclusive: IsoDate, asAtDate: IsoDate): number {
  return Math.max(0, daysBetween(paidToDateInclusive, asAtDate));
}

export function calculateRentIncrease(oldRentCents: Cents, newRentCents: Cents): RentIncrease {
  assertCents(oldRentCents, 'oldRentCents');
  assertCents(newRentCents, 'newRentCents');

  if (oldRentCents <= 0) {
    throw new RangeError('oldRentCents must be greater than 0');
  }

  const increaseCents = newRentCents - oldRentCents;

  return {
    oldRentCents,
    newRentCents,
    increaseCents,
    increasePercent: roundHalfUp((increaseCents / oldRentCents) * 10000) / 100,
  };
}

export function calculateQldEarliestRentIncreaseDate(currentRentBecamePayableDate: IsoDate): IsoDate {
  return addCalendarMonths(currentRentBecamePayableDate, 12);
}

export function calculateQldMaxRentInAdvanceCents(
  weeklyRentCents: Cents,
  agreementType: QldRentInAdvanceAgreementType,
): Cents {
  assertCents(weeklyRentCents, 'weeklyRentCents');

  switch (agreementType) {
    case 'fixed-term':
      return calculateMonthlyEquivalentFromWeeklyCents(weeklyRentCents);
    case 'periodic':
    case 'moveable':
    case 'rooming':
      return weeklyRentCents * 2;
    default:
      return assertNever(agreementType);
  }
}

function validateRentScheduleRow(row: RentScheduleRow): void {
  assertCents(row.rentAmountCents, 'rentAmountCents');

  if (row.rentFrequencyDays <= 0) {
    throw new RangeError('rentFrequencyDays must be greater than 0');
  }

  if (row.endDateExclusive && daysBetween(row.startDate, row.endDateExclusive) < 0) {
    throw new RangeError('rent schedule end date cannot be before start date');
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${value}`);
}
