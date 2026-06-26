import type { IsoDate } from './types.ts';

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface DateParts {
  year: number;
  month: number;
  day: number;
}

export function parseIsoDate(date: IsoDate): DateParts {
  const match = ISO_DATE_PATTERN.exec(date);

  if (!match) {
    throw new TypeError(`Invalid ISO date: ${date}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const lastDay = daysInMonth(year, month);

  if (month < 1 || month > 12 || day < 1 || day > lastDay) {
    throw new TypeError(`Invalid ISO date: ${date}`);
  }

  return { year, month, day };
}

export function toEpochDay(date: IsoDate): number {
  const { year, month, day } = parseIsoDate(date);
  return Math.floor(Date.UTC(year, month - 1, day) / MS_PER_DAY);
}

export function fromEpochDay(epochDay: number): IsoDate {
  if (!Number.isInteger(epochDay)) {
    throw new TypeError('epochDay must be an integer');
  }

  return new Date(epochDay * MS_PER_DAY).toISOString().slice(0, 10);
}

export function daysBetween(startDate: IsoDate, endDateExclusive: IsoDate): number {
  return toEpochDay(endDateExclusive) - toEpochDay(startDate);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  if (!Number.isInteger(days)) {
    throw new TypeError('days must be an integer');
  }

  return fromEpochDay(toEpochDay(date) + days);
}

export function addCalendarMonths(date: IsoDate, months: number): IsoDate {
  if (!Number.isInteger(months)) {
    throw new TypeError('months must be an integer');
  }

  const parts = parseIsoDate(date);
  const totalMonths = parts.year * 12 + (parts.month - 1) + months;
  const year = Math.floor(totalMonths / 12);
  const month = modulo(totalMonths, 12) + 1;
  const day = Math.min(parts.day, daysInMonth(year, month));

  return formatIsoDate({ year, month, day });
}

export function overlapDays(
  aStartDate: IsoDate,
  aEndDateExclusive: IsoDate,
  bStartDate: IsoDate,
  bEndDateExclusive: IsoDate,
): number {
  const aStart = toEpochDay(aStartDate);
  const aEnd = toEpochDay(aEndDateExclusive);
  const bStart = toEpochDay(bStartDate);
  const bEnd = toEpochDay(bEndDateExclusive);

  if (aEnd < aStart) {
    throw new RangeError('first period end date cannot be before start date');
  }

  if (bEnd < bStart) {
    throw new RangeError('second period end date cannot be before start date');
  }

  return Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
}

export function inclusiveEndToExclusive(endDateInclusive: IsoDate): IsoDate {
  return addDays(endDateInclusive, 1);
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function formatIsoDate(parts: DateParts): IsoDate {
  return [
    String(parts.year).padStart(4, '0'),
    String(parts.month).padStart(2, '0'),
    String(parts.day).padStart(2, '0'),
  ].join('-');
}

function modulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}
