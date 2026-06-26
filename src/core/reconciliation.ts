import { assertCents, roundHalfUp } from './money.ts';
import type { Cents } from './types.ts';

export interface ReconciliationRowInput {
  accountPaymentsTo?: string;
  propertyRef?: string;
  grossRentCents: Cents;
  commissionRatePercent: number;
  adminFeeCents?: Cents;
  repairsAndMaintenanceCents?: Cents;
  lettingFeeCents?: Cents;
  advertisingAndPromotionCents?: Cents;
  cleaningAndGardeningCents?: Cents;
  otherExpenseCents?: Cents;
  paymentsMadeCents?: Cents;
  ownerPaymentsCents?: Cents;
  depositsCents?: Cents;
  gstRate?: number;
}

export interface ReconciliationRowResult extends Required<Omit<
  ReconciliationRowInput,
  'accountPaymentsTo' | 'propertyRef' | 'gstRate'
>> {
  accountPaymentsTo?: string;
  propertyRef?: string;
  gstRate: number;
  commissionCents: Cents;
  agencyFeesExGstCents: Cents;
  ownersGstCents: Cents;
  externalOrOwnerPaymentsCents: Cents;
  chequeAmountWithheldCents: Cents;
}

export interface ReconciliationSummaryInput {
  rows: ReconciliationRowInput[];
  openingBalanceCents?: Cents;
  bondBalanceCents?: Cents;
  agentReimbursementOnPurchasesCents?: Cents;
  currentlyPaidAgentCents?: Cents;
  bankStatementBalanceCents?: Cents;
}

export interface ReconciliationSummary {
  rows: ReconciliationRowResult[];
  openingBalanceCents: Cents;
  ownerLedgerBalanceCents: Cents;
  agencyFeeExGstTotalCents: Cents;
  totalGstCents: Cents;
  agentReimbursementOnPurchasesCents: Cents;
  totalAgentReimbursementCents: Cents;
  currentlyPaidAgentCents: Cents;
  agentReimbursementOutstandingCents: Cents;
  totalGrossRentCents: Cents;
  totalDepositsCents: Cents;
  totalReceiptsCents: Cents;
  lessPaymentsMadeCents: Cents;
  bookBalanceCents: Cents;
  bondBalanceCents: Cents;
  clientLedgerBalanceCents: Cents;
  sumCheckCents: Cents;
  bankStatementBalanceCents?: Cents;
  bankVarianceCents?: Cents;
  isBalanced: boolean;
}

export function calculateReconciliationRow(input: ReconciliationRowInput): ReconciliationRowResult {
  validateCentsInput(input.grossRentCents, 'grossRentCents');

  if (input.commissionRatePercent < 0) {
    throw new RangeError('commissionRatePercent cannot be negative');
  }

  const gstRate = input.gstRate ?? 0.1;
  const row = {
    accountPaymentsTo: input.accountPaymentsTo,
    propertyRef: input.propertyRef,
    grossRentCents: input.grossRentCents,
    commissionRatePercent: input.commissionRatePercent,
    adminFeeCents: input.adminFeeCents ?? 0,
    repairsAndMaintenanceCents: input.repairsAndMaintenanceCents ?? 0,
    lettingFeeCents: input.lettingFeeCents ?? 0,
    advertisingAndPromotionCents: input.advertisingAndPromotionCents ?? 0,
    cleaningAndGardeningCents: input.cleaningAndGardeningCents ?? 0,
    otherExpenseCents: input.otherExpenseCents ?? 0,
    paymentsMadeCents: input.paymentsMadeCents ?? 0,
    ownerPaymentsCents: input.ownerPaymentsCents ?? 0,
    depositsCents: input.depositsCents ?? 0,
    gstRate,
  };

  validateCentsInput(row.adminFeeCents, 'adminFeeCents');
  validateCentsInput(row.repairsAndMaintenanceCents, 'repairsAndMaintenanceCents');
  validateCentsInput(row.lettingFeeCents, 'lettingFeeCents');
  validateCentsInput(row.advertisingAndPromotionCents, 'advertisingAndPromotionCents');
  validateCentsInput(row.cleaningAndGardeningCents, 'cleaningAndGardeningCents');
  validateCentsInput(row.otherExpenseCents, 'otherExpenseCents');
  validateCentsInput(row.paymentsMadeCents, 'paymentsMadeCents');
  validateCentsInput(row.ownerPaymentsCents, 'ownerPaymentsCents');
  validateCentsInput(row.depositsCents, 'depositsCents');

  const commissionCents = roundHalfUp(row.grossRentCents * (row.commissionRatePercent / 100));
  const agencyFeesExGstCents =
    commissionCents + row.adminFeeCents + row.lettingFeeCents + row.advertisingAndPromotionCents;
  const ownersGstCents = roundHalfUp(agencyFeesExGstCents * gstRate);
  const externalOrOwnerPaymentsCents =
    row.repairsAndMaintenanceCents +
    row.cleaningAndGardeningCents +
    row.otherExpenseCents +
    row.paymentsMadeCents +
    row.ownerPaymentsCents;
  const chequeAmountWithheldCents =
    row.grossRentCents +
    row.depositsCents -
    agencyFeesExGstCents -
    ownersGstCents -
    externalOrOwnerPaymentsCents;

  return {
    ...row,
    commissionCents,
    agencyFeesExGstCents,
    ownersGstCents,
    externalOrOwnerPaymentsCents,
    chequeAmountWithheldCents,
  };
}

export function calculateReconciliationSummary(input: ReconciliationSummaryInput): ReconciliationSummary {
  const rows = input.rows.map(calculateReconciliationRow);
  const openingBalanceCents = input.openingBalanceCents ?? 0;
  const bondBalanceCents = input.bondBalanceCents ?? 0;
  const agentReimbursementOnPurchasesCents = input.agentReimbursementOnPurchasesCents ?? 0;
  const currentlyPaidAgentCents = input.currentlyPaidAgentCents ?? 0;

  validateCentsInput(openingBalanceCents, 'openingBalanceCents');
  validateCentsInput(bondBalanceCents, 'bondBalanceCents');
  validateCentsInput(agentReimbursementOnPurchasesCents, 'agentReimbursementOnPurchasesCents');
  validateCentsInput(currentlyPaidAgentCents, 'currentlyPaidAgentCents');

  const ownerLedgerBalanceCents = sum(rows.map((row) => row.chequeAmountWithheldCents));
  const agencyFeeExGstTotalCents = sum(rows.map((row) => row.agencyFeesExGstCents));
  const totalGstCents = sum(rows.map((row) => row.ownersGstCents));
  const totalAgentReimbursementCents =
    agencyFeeExGstTotalCents + totalGstCents + agentReimbursementOnPurchasesCents;
  const totalGrossRentCents = sum(rows.map((row) => row.grossRentCents));
  const totalDepositsCents = sum(rows.map((row) => row.depositsCents));
  const totalReceiptsCents = openingBalanceCents + totalGrossRentCents + totalDepositsCents;
  const lessPaymentsMadeCents = sum(rows.map((row) => row.externalOrOwnerPaymentsCents));
  const bookBalanceCents = totalReceiptsCents - lessPaymentsMadeCents;
  const clientLedgerBalanceCents = ownerLedgerBalanceCents + totalAgentReimbursementCents + bondBalanceCents;
  const sumCheckCents = bookBalanceCents - clientLedgerBalanceCents;
  const bankVarianceCents =
    input.bankStatementBalanceCents === undefined ? undefined : input.bankStatementBalanceCents - bookBalanceCents;

  return {
    rows,
    openingBalanceCents,
    ownerLedgerBalanceCents,
    agencyFeeExGstTotalCents,
    totalGstCents,
    agentReimbursementOnPurchasesCents,
    totalAgentReimbursementCents,
    currentlyPaidAgentCents,
    agentReimbursementOutstandingCents: totalAgentReimbursementCents - currentlyPaidAgentCents,
    totalGrossRentCents,
    totalDepositsCents,
    totalReceiptsCents,
    lessPaymentsMadeCents,
    bookBalanceCents,
    bondBalanceCents,
    clientLedgerBalanceCents,
    sumCheckCents,
    bankStatementBalanceCents: input.bankStatementBalanceCents,
    bankVarianceCents,
    isBalanced: sumCheckCents === 0 && (bankVarianceCents === undefined || bankVarianceCents === 0),
  };
}

function validateCentsInput(value: Cents, name: string): void {
  assertCents(value, name);
}

function sum(values: Cents[]): Cents {
  return values.reduce((total, value) => total + value, 0);
}
