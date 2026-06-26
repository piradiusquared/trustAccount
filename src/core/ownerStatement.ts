import { calculateGstOnExclusive, roundHalfUp } from './money.ts';
import type { Cents } from './types.ts';

export interface ManagementFeeResult {
  exGstCents: Cents;
  gstCents: Cents;
  incGstCents: Cents;
}

export interface OwnerStatementInput {
  openingBalanceCents: Cents;
  rentReceiptsCents?: Cents;
  tenantReimbursementsCents?: Cents;
  ownerContributionsCents?: Cents;
  otherOwnerIncomeCents?: Cents;
  supplierInvoicesPaidCents?: Cents;
  agencyFeesIncGstCents?: Cents;
  ownerDisbursementsCents?: Cents;
  withheldFundsCents?: Cents;
}

export function calculateManagementFeeCents(input: {
  rentCollectedCents: Cents;
  managementFeeRate: number;
  gstRate?: number;
}): ManagementFeeResult {
  if (input.managementFeeRate < 0) {
    throw new RangeError('managementFeeRate cannot be negative');
  }

  const exGstCents = roundHalfUp(input.rentCollectedCents * input.managementFeeRate);
  return calculateGstOnExclusive(exGstCents, input.gstRate ?? 0.1);
}

export function calculateLettingFeeCents(input: {
  weeklyRentCents: Cents;
  lettingFeeWeeks: number;
  gstRate?: number;
}): ManagementFeeResult {
  if (input.lettingFeeWeeks < 0) {
    throw new RangeError('lettingFeeWeeks cannot be negative');
  }

  const exGstCents = roundHalfUp(input.weeklyRentCents * input.lettingFeeWeeks);
  return calculateGstOnExclusive(exGstCents, input.gstRate ?? 0.1);
}

export function calculateOwnerClosingBalanceCents(input: OwnerStatementInput): Cents {
  return (
    input.openingBalanceCents +
    (input.rentReceiptsCents ?? 0) +
    (input.tenantReimbursementsCents ?? 0) +
    (input.ownerContributionsCents ?? 0) +
    (input.otherOwnerIncomeCents ?? 0) -
    (input.supplierInvoicesPaidCents ?? 0) -
    (input.agencyFeesIncGstCents ?? 0) -
    (input.ownerDisbursementsCents ?? 0) -
    (input.withheldFundsCents ?? 0)
  );
}

export function calculateAvailableToDisburseCents(input: {
  ownerLedgerBalanceCents: Cents;
  ownerReserveCents?: Cents;
  approvedUnpaidBillsCents?: Cents;
  pendingAgencyFeesCents?: Cents;
  minimumRetainedBalanceCents?: Cents;
}): Cents {
  return Math.max(
    0,
    input.ownerLedgerBalanceCents -
      (input.ownerReserveCents ?? 0) -
      (input.approvedUnpaidBillsCents ?? 0) -
      (input.pendingAgencyFeesCents ?? 0) -
      (input.minimumRetainedBalanceCents ?? 0),
  );
}

export function calculateOwnerShareCents(transactionAmountCents: Cents, ownershipPercent: number): Cents {
  if (ownershipPercent < 0 || ownershipPercent > 1) {
    throw new RangeError('ownershipPercent must be between 0 and 1');
  }

  return roundHalfUp(transactionAmountCents * ownershipPercent);
}
