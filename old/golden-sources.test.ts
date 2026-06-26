import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateBondTopUpCents,
  calculateEligibleWaterUsageCents,
  calculateGstOnExclusive,
  calculateQldEarliestRentIncreaseDate,
  calculateQldMaxBondCents,
  calculateQldMaxRentInAdvanceCents,
  calculateReconciliationRow,
  calculateWaterChargeByBillProportionCents,
  calculateWaterChargeByMeterReadingCents,
  canChargeFullQldWaterConsumption,
  splitGstFromInclusive,
} from '../src/core/index.ts';

test('golden: RTA QLD bond caps are based on weeks of rent', () => {
  const weeklyRentCents = 45_500;

  assert.equal(calculateQldMaxBondCents(weeklyRentCents, 'general'), 182_000);
  assert.equal(calculateQldMaxBondCents(weeklyRentCents, 'rooming'), 182_000);
  assert.equal(calculateQldMaxBondCents(weeklyRentCents, 'moveable'), 91_000);
  assert.equal(calculateQldMaxBondCents(weeklyRentCents, 'moveable-with-electricity'), 136_500);
});

test('golden: RTA QLD bond top-up cannot exceed the current maximum bond', () => {
  assert.equal(calculateBondTopUpCents(160_000, 45_500, 'general'), 22_000);
  assert.equal(calculateBondTopUpCents(190_000, 45_500, 'general'), 0);
});

test('golden: RTA QLD rent in advance caps differ by agreement type', () => {
  const weeklyRentCents = 45_500;

  assert.equal(calculateQldMaxRentInAdvanceCents(weeklyRentCents, 'fixed-term'), 197_167);
  assert.equal(calculateQldMaxRentInAdvanceCents(weeklyRentCents, 'periodic'), 91_000);
  assert.equal(calculateQldMaxRentInAdvanceCents(weeklyRentCents, 'moveable'), 91_000);
  assert.equal(calculateQldMaxRentInAdvanceCents(weeklyRentCents, 'rooming'), 91_000);
});

test('golden: RTA rent-in-advance fortnight example equals two weeks rent', () => {
  assert.equal(calculateQldMaxRentInAdvanceCents(20_000, 'periodic'), 40_000);
});

test('golden: RTA QLD rent increase frequency uses a 12-month anniversary', () => {
  assert.equal(calculateQldEarliestRentIncreaseDate('2026-05-14'), '2027-05-14');
  assert.equal(calculateQldEarliestRentIncreaseDate('2024-02-29'), '2025-02-28');
});

test('golden: RTA QLD full water consumption requires all minimum criteria', () => {
  assert.equal(
    canChargeFullQldWaterConsumption({
      premisesIndividuallyMetered: true,
      premisesWaterEfficient: true,
      agreementSaysTenantPaysConsumption: true,
    }),
    true,
  );

  assert.equal(
    canChargeFullQldWaterConsumption({
      premisesIndividuallyMetered: true,
      premisesWaterEfficient: false,
      agreementSaysTenantPaysConsumption: true,
    }),
    false,
  );
});

test('golden: RTA QLD water charge excludes fixed and sewerage charges by construction', () => {
  assert.equal(
    calculateEligibleWaterUsageCents({
      stateBulkWaterUsageCents: 1_200,
      distributionUsageCents: 3_400,
      otherEligibleUsageCents: 500,
    }),
    5_100,
  );
});

test('golden: RTA QLD partial water billing can be apportioned by occupied days', () => {
  assert.equal(
    calculateWaterChargeByBillProportionCents({
      billableUsageCents: 90_000,
      billStartDate: '2026-01-01',
      billEndDateExclusive: '2026-04-01',
      tenancyStartDate: '2026-02-01',
      tenancyEndDateExclusive: '2026-04-01',
    }),
    59_000,
  );
});

test('golden: RTA QLD water usage can be calculated from meter readings and current rate', () => {
  assert.equal(
    calculateWaterChargeByMeterReadingCents({
      startReadingKl: 100,
      endReadingKl: 112.5,
      eligibleRateCentsPerKl: 300,
    }),
    3_750,
  );
});

test('golden: ATO GST helpers use 10 percent exclusive or one-eleventh inclusive', () => {
  assert.deepEqual(calculateGstOnExclusive(14_150), {
    exGstCents: 14_150,
    gstCents: 1_415,
    incGstCents: 15_565,
  });

  assert.deepEqual(splitGstFromInclusive(15_565), {
    exGstCents: 14_150,
    gstCents: 1_415,
    incGstCents: 15_565,
  });
});

test('golden: Property360 screenshot reconciliation row CU12', () => {
  const row = calculateReconciliationRow({
    grossRentCents: 182_000,
    commissionRatePercent: 7.5,
    adminFeeCents: 500,
    paymentsMadeCents: 12_900,
  });

  assert.equal(row.commissionCents, 13_650);
  assert.equal(row.ownersGstCents, 1_415);
  assert.equal(row.chequeAmountWithheldCents, 153_535);
});
