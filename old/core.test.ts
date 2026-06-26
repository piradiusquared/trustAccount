import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addCalendarMonths,
  calculateAccruedRentCents,
  calculateAvailableToDisburseCents,
  calculateDaysInArrears,
  calculateGrossYieldPercent,
  calculateManagementFeeCents,
  calculateMonthlyEquivalentFromWeeklyCents,
  calculateOwnerClosingBalanceCents,
  calculateProrataRentCents,
  calculateQldEarliestRentIncreaseDate,
  calculateQldMaxBondCents,
  calculateReconciliationRow,
  calculateReconciliationSummary,
  calculateRentArrearsCents,
  calculateRentInAdvanceCents,
  calculateSubmeterShareCents,
  calculateWaterChargeByBillProportionCents,
  calculateWaterChargeByMeterReadingCents,
  canChargeFullQldWaterConsumption,
  derivePaidToDate,
  inclusiveEndToExclusive,
  overlapDays,
  splitGstFromInclusive,
  type RentScheduleRow,
} from '../src/core/index.ts';

const weekly650 = 65_000;
const rentSchedule: RentScheduleRow[] = [
  {
    startDate: '2026-01-01',
    rentAmountCents: weekly650,
    rentFrequencyDays: 7,
  },
];

test('converts an inclusive end date to an end-exclusive period', () => {
  assert.equal(inclusiveEndToExclusive('2026-01-31'), '2026-02-01');
});

test('adds calendar months and clamps end-of-month dates', () => {
  assert.equal(addCalendarMonths('2026-01-31', 1), '2026-02-28');
});

test('calculates overlap days between date periods', () => {
  assert.equal(overlapDays('2026-01-10', '2026-01-20', '2026-01-15', '2026-02-01'), 5);
});

test('calculates pro-rata rent without rounding daily rent early', () => {
  assert.equal(calculateProrataRentCents(weekly650, 7, 10), 92_857);
});

test('calculates monthly equivalent rent from weekly rent', () => {
  assert.equal(calculateMonthlyEquivalentFromWeeklyCents(weekly650), 281_667);
});

test('calculates accrued rent across a schedule', () => {
  assert.equal(calculateAccruedRentCents(rentSchedule, '2026-01-01', '2026-01-15'), 130_000);
});

test('derives paid-to date from rent credits', () => {
  assert.equal(derivePaidToDate(rentSchedule, '2026-01-01', weekly650), '2026-01-07');
});

test('derives paid-to date for partial-period rent credits', () => {
  assert.equal(derivePaidToDate(rentSchedule, '2026-01-01', 97_500), '2026-01-10');
});

test('calculates rent arrears and rent in advance', () => {
  assert.equal(calculateRentArrearsCents(rentSchedule, '2026-01-01', '2026-01-15', weekly650), 65_000);
  assert.equal(calculateRentInAdvanceCents(rentSchedule, '2026-01-01', '2026-01-08', 130_000), 65_000);
});

test('calculates days in arrears from paid-to date', () => {
  assert.equal(calculateDaysInArrears('2026-01-07', '2026-01-15'), 8);
});

test('calculates Queensland rent increase eligibility date', () => {
  assert.equal(calculateQldEarliestRentIncreaseDate('2024-06-25'), '2025-06-25');
});

test('calculates Queensland bond caps', () => {
  assert.equal(calculateQldMaxBondCents(weekly650), 260_000);
  assert.equal(calculateQldMaxBondCents(weekly650, 'moveable-with-electricity'), 195_000);
});

test('checks Queensland full water consumption eligibility', () => {
  assert.equal(
    canChargeFullQldWaterConsumption({
      premisesIndividuallyMetered: true,
      premisesWaterEfficient: true,
      agreementSaysTenantPaysConsumption: true,
    }),
    true,
  );
});

test('calculates tenant water charge from meter reading', () => {
  assert.equal(
    calculateWaterChargeByMeterReadingCents({
      startReadingKl: 100,
      endReadingKl: 112.5,
      eligibleRateCentsPerKl: 300,
    }),
    3_750,
  );
});

test('calculates tenant water charge by bill proportion', () => {
  assert.equal(
    calculateWaterChargeByBillProportionCents({
      billableUsageCents: 10_000,
      billStartDate: '2026-01-01',
      billEndDateExclusive: '2026-01-21',
      tenancyStartDate: '2026-01-06',
      tenancyEndDateExclusive: '2026-01-16',
    }),
    5_000,
  );
});

test('calculates tenant submeter share', () => {
  assert.equal(
    calculateSubmeterShareCents({
      billableUsageCents: 24_000,
      tenantUsageKl: 30,
      totalSubmeterUsageKl: 120,
    }),
    6_000,
  );
});

test('splits GST from an inclusive amount', () => {
  assert.deepEqual(splitGstFromInclusive(11_000), {
    exGstCents: 10_000,
    gstCents: 1_000,
    incGstCents: 11_000,
  });
});

test('calculates management fee with GST', () => {
  assert.deepEqual(
    calculateManagementFeeCents({
      rentCollectedCents: weekly650,
      managementFeeRate: 0.08,
    }),
    {
      exGstCents: 5_200,
      gstCents: 520,
      incGstCents: 5_720,
    },
  );
});

test('calculates owner statement closing balance and disbursement availability', () => {
  assert.equal(
    calculateOwnerClosingBalanceCents({
      openingBalanceCents: 10_000,
      rentReceiptsCents: 130_000,
      supplierInvoicesPaidCents: 20_000,
      agencyFeesIncGstCents: 5_720,
      withheldFundsCents: 15_000,
    }),
    99_280,
  );

  assert.equal(
    calculateAvailableToDisburseCents({
      ownerLedgerBalanceCents: 99_280,
      ownerReserveCents: 15_000,
      approvedUnpaidBillsCents: 20_000,
    }),
    64_280,
  );
});

test('calculates gross yield', () => {
  assert.equal(calculateGrossYieldPercent(weekly650, 80_000_000), 4.23);
});

test('calculates reconciliation row values visible in the screenshots', () => {
  assert.deepEqual(
    calculateReconciliationRow({
      accountPaymentsTo: 'Mr. J And Mrs. S',
      propertyRef: 'CU12',
      grossRentCents: 182_000,
      commissionRatePercent: 7.5,
      adminFeeCents: 500,
      paymentsMadeCents: 12_900,
    }),
    {
      accountPaymentsTo: 'Mr. J And Mrs. S',
      propertyRef: 'CU12',
      grossRentCents: 182_000,
      commissionRatePercent: 7.5,
      adminFeeCents: 500,
      repairsAndMaintenanceCents: 0,
      lettingFeeCents: 0,
      advertisingAndPromotionCents: 0,
      cleaningAndGardeningCents: 0,
      otherExpenseCents: 0,
      paymentsMadeCents: 12_900,
      ownerPaymentsCents: 0,
      depositsCents: 0,
      gstRate: 0.1,
      commissionCents: 13_650,
      agencyFeesExGstCents: 14_150,
      ownersGstCents: 1_415,
      externalOrOwnerPaymentsCents: 12_900,
      chequeAmountWithheldCents: 153_535,
    },
  );
});

test('calculates reconciliation row values with deposits', () => {
  const row = calculateReconciliationRow({
    grossRentCents: 192_800,
    commissionRatePercent: 7.5,
    adminFeeCents: 500,
    depositsCents: 10_794,
  });

  assert.equal(row.commissionCents, 14_460);
  assert.equal(row.ownersGstCents, 1_496);
  assert.equal(row.chequeAmountWithheldCents, 187_138);
});

test('calculates reconciliation summary totals and three-way balance', () => {
  const summary = calculateReconciliationSummary({
    rows: [
      {
        grossRentCents: 182_000,
        commissionRatePercent: 7.5,
        adminFeeCents: 500,
        paymentsMadeCents: 12_900,
      },
      {
        grossRentCents: 192_800,
        commissionRatePercent: 7.5,
        adminFeeCents: 500,
        depositsCents: 10_794,
      },
    ],
    bankStatementBalanceCents: 372_694,
  });

  assert.equal(summary.totalReceiptsCents, 385_594);
  assert.equal(summary.lessPaymentsMadeCents, 12_900);
  assert.equal(summary.ownerLedgerBalanceCents, 340_673);
  assert.equal(summary.totalAgentReimbursementCents, 32_021);
  assert.equal(summary.bookBalanceCents, 372_694);
  assert.equal(summary.clientLedgerBalanceCents, 372_694);
  assert.equal(summary.sumCheckCents, 0);
  assert.equal(summary.bankVarianceCents, 0);
  assert.equal(summary.isBalanced, true);
});
