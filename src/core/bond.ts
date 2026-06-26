import { assertCents } from './money.ts';
import type { Cents } from './types.ts';

export type QldTenancyType =
  | 'general'
  | 'rooming'
  | 'moveable'
  | 'moveable-with-electricity';

export function calculateQldMaxBondCents(
  weeklyRentCents: Cents,
  tenancyType: QldTenancyType = 'general',
): Cents {
  assertCents(weeklyRentCents, 'weeklyRentCents');

  switch (tenancyType) {
    case 'moveable':
      return weeklyRentCents * 2;
    case 'moveable-with-electricity':
      return weeklyRentCents * 3;
    case 'general':
    case 'rooming':
      return weeklyRentCents * 4;
    default:
      return assertNever(tenancyType);
  }
}

export function calculateBondTopUpCents(
  currentBondHeldCents: Cents,
  weeklyRentCents: Cents,
  tenancyType: QldTenancyType = 'general',
): Cents {
  assertCents(currentBondHeldCents, 'currentBondHeldCents');

  const maxBondCents = calculateQldMaxBondCents(weeklyRentCents, tenancyType);
  return Math.max(0, maxBondCents - currentBondHeldCents);
}

function assertNever(value: never): never {
  throw new Error(`Unhandled tenancy type: ${value}`);
}
