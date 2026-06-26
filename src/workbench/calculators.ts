import {
  calculateGstOnExclusive,
  calculateGrossYieldPercent,
  calculateQldEarliestRentIncreaseDate,
  calculateQldMaxBondCents,
  calculateQldMaxRentInAdvanceCents,
  calculateReconciliationRow,
  calculateWaterChargeByBillProportionCents,
  calculateWaterChargeByMeterReadingCents,
  canChargeFullQldWaterConsumption,
  dollarsToCents,
  splitGstFromInclusive,
  type QldRentInAdvanceAgreementType,
  type QldTenancyType,
} from '../core/index.ts';

type FieldType = 'money' | 'number' | 'date' | 'select' | 'boolean';

export interface FormulaField {
  id: string;
  label: string;
  type: FieldType;
  defaultValue: string | number | boolean;
  options?: Array<{ label: string; value: string }>;
  note?: string;
}

export interface FormulaForClient {
  id: string;
  name: string;
  group: string;
  description: string;
  confidence: string;
  fields: FormulaField[];
}

export interface CalculationOutput {
  label: string;
  value: string;
  isAnswer?: boolean;
}

interface FormulaDefinition extends FormulaForClient {
  run: (input: Record<string, unknown>) => CalculationOutput[];
}

export const formulaDefinitions: FormulaDefinition[] = [
  {
    id: 'qld-bond-cap',
    name: 'QLD Bond Cap',
    group: 'Bond',
    description: 'Maximum bond from weekly rent and tenancy type.',
    confidence: 'Official RTA rule',
    fields: [
      { id: 'weeklyRent', label: 'Weekly Rent', type: 'money', defaultValue: '455.00' },
      {
        id: 'tenancyType',
        label: 'Tenancy Type',
        type: 'select',
        defaultValue: 'general',
        options: [
          { label: 'General', value: 'general' },
          { label: 'Rooming', value: 'rooming' },
          { label: 'Moveable', value: 'moveable' },
          { label: 'Moveable With Electricity', value: 'moveable-with-electricity' },
        ],
      },
    ],
    run(input) {
      const weeklyRentCents = moneyInput(input, 'weeklyRent');
      const tenancyType = selectInput<QldTenancyType>(input, 'tenancyType');
      const maxBondCents = calculateQldMaxBondCents(weeklyRentCents, tenancyType);

      return [
        { label: 'Weekly rent', value: formatMoney(weeklyRentCents) },
        { label: 'Tenancy type', value: formatLabel(tenancyType) },
        { label: 'Max bond', value: formatMoney(maxBondCents), isAnswer: true },
      ];
    },
  },
  {
    id: 'qld-rent-in-advance',
    name: 'QLD Rent In Advance Cap',
    group: 'Rent',
    description: 'Maximum rent in advance that can be requested at tenancy start.',
    confidence: 'Official RTA rule',
    fields: [
      { id: 'weeklyRent', label: 'Weekly Rent', type: 'money', defaultValue: '455.00' },
      {
        id: 'agreementType',
        label: 'Agreement Type',
        type: 'select',
        defaultValue: 'fixed-term',
        options: [
          { label: 'Fixed Term', value: 'fixed-term' },
          { label: 'Periodic', value: 'periodic' },
          { label: 'Moveable', value: 'moveable' },
          { label: 'Rooming', value: 'rooming' },
        ],
      },
    ],
    run(input) {
      const weeklyRentCents = moneyInput(input, 'weeklyRent');
      const agreementType = selectInput<QldRentInAdvanceAgreementType>(input, 'agreementType');
      const maxAdvanceCents = calculateQldMaxRentInAdvanceCents(weeklyRentCents, agreementType);

      return [
        { label: 'Weekly rent', value: formatMoney(weeklyRentCents) },
        { label: 'Agreement type', value: formatLabel(agreementType) },
        { label: 'Maximum rent in advance', value: formatMoney(maxAdvanceCents), isAnswer: true },
      ];
    },
  },
  {
    id: 'qld-rent-increase-date',
    name: 'QLD Earliest Rent Increase Date',
    group: 'Rent',
    description: 'Earliest date after the 12-month rent increase frequency rule.',
    confidence: 'Official RTA rule; notice rules still need separate validation',
    fields: [
      {
        id: 'currentRentBecamePayableDate',
        label: 'Current Rent Became Payable',
        type: 'date',
        defaultValue: '2026-05-14',
      },
    ],
    run(input) {
      const currentRentBecamePayableDate = stringInput(input, 'currentRentBecamePayableDate');
      const earliestDate = calculateQldEarliestRentIncreaseDate(currentRentBecamePayableDate);

      return [
        { label: 'Current rent became payable', value: currentRentBecamePayableDate },
        { label: 'Earliest increase date', value: earliestDate, isAnswer: true },
      ];
    },
  },
  {
    id: 'qld-water-eligibility',
    name: 'QLD Water Charging Eligibility',
    group: 'Water',
    description: 'Checks whether full water consumption can be passed to the tenant.',
    confidence: 'Official RTA rule',
    fields: [
      {
        id: 'premisesIndividuallyMetered',
        label: 'Individually Metered',
        type: 'boolean',
        defaultValue: true,
      },
      { id: 'premisesWaterEfficient', label: 'Water Efficient', type: 'boolean', defaultValue: true },
      {
        id: 'agreementSaysTenantPaysConsumption',
        label: 'Agreement Says Tenant Pays',
        type: 'boolean',
        defaultValue: true,
      },
    ],
    run(input) {
      const canCharge = canChargeFullQldWaterConsumption({
        premisesIndividuallyMetered: booleanInput(input, 'premisesIndividuallyMetered'),
        premisesWaterEfficient: booleanInput(input, 'premisesWaterEfficient'),
        agreementSaysTenantPaysConsumption: booleanInput(input, 'agreementSaysTenantPaysConsumption'),
      });

      return [
        { label: 'Individually metered', value: formatBoolean(booleanInput(input, 'premisesIndividuallyMetered')) },
        { label: 'Water efficient', value: formatBoolean(booleanInput(input, 'premisesWaterEfficient')) },
        {
          label: 'Agreement says tenant pays',
          value: formatBoolean(booleanInput(input, 'agreementSaysTenantPaysConsumption')),
        },
        { label: 'Can charge full consumption', value: formatBoolean(canCharge), isAnswer: true },
      ];
    },
  },
  {
    id: 'water-meter-charge',
    name: 'Water Charge By Meter Reading',
    group: 'Water',
    description: 'Calculates tenant water usage from start/end meter readings.',
    confidence: 'Accounting method backed by RTA charge eligibility',
    fields: [
      { id: 'startReadingKl', label: 'Start Reading kL', type: 'number', defaultValue: '100' },
      { id: 'endReadingKl', label: 'End Reading kL', type: 'number', defaultValue: '112.5' },
      { id: 'eligibleRatePerKl', label: 'Eligible Rate Per kL', type: 'money', defaultValue: '3.00' },
    ],
    run(input) {
      const startReadingKl = numberInput(input, 'startReadingKl');
      const endReadingKl = numberInput(input, 'endReadingKl');
      const eligibleRateCentsPerKl = moneyInput(input, 'eligibleRatePerKl');
      const chargeCents = calculateWaterChargeByMeterReadingCents({
        startReadingKl,
        endReadingKl,
        eligibleRateCentsPerKl,
      });

      return [
        { label: 'Usage', value: `${formatNumber(endReadingKl - startReadingKl)} kL` },
        { label: 'Rate', value: `${formatMoney(eligibleRateCentsPerKl)} per kL` },
        { label: 'Water charge', value: formatMoney(chargeCents), isAnswer: true },
      ];
    },
  },
  {
    id: 'water-bill-proportion',
    name: 'Water Charge By Bill Proportion',
    group: 'Water',
    description: 'Apportions a water usage bill by tenancy occupancy days.',
    confidence: 'Accounting method; prefer meter readings where available',
    fields: [
      { id: 'billableUsage', label: 'Billable Usage Amount', type: 'money', defaultValue: '900.00' },
      { id: 'billStartDate', label: 'Bill Start Date', type: 'date', defaultValue: '2026-01-01' },
      { id: 'billEndDateExclusive', label: 'Bill End Date Exclusive', type: 'date', defaultValue: '2026-04-01' },
      { id: 'tenancyStartDate', label: 'Tenancy Start Date', type: 'date', defaultValue: '2026-02-01' },
      {
        id: 'tenancyEndDateExclusive',
        label: 'Tenancy End Date Exclusive',
        type: 'date',
        defaultValue: '2026-04-01',
      },
    ],
    run(input) {
      const chargeCents = calculateWaterChargeByBillProportionCents({
        billableUsageCents: moneyInput(input, 'billableUsage'),
        billStartDate: stringInput(input, 'billStartDate'),
        billEndDateExclusive: stringInput(input, 'billEndDateExclusive'),
        tenancyStartDate: stringInput(input, 'tenancyStartDate'),
        tenancyEndDateExclusive: stringInput(input, 'tenancyEndDateExclusive'),
      });

      return [
        { label: 'Billable usage amount', value: formatMoney(moneyInput(input, 'billableUsage')) },
        { label: 'Tenant charge', value: formatMoney(chargeCents), isAnswer: true },
      ];
    },
  },
  {
    id: 'gst-exclusive',
    name: 'GST From Exclusive Amount',
    group: 'GST',
    description: 'Adds Australian GST to a GST-exclusive agency or supplier amount.',
    confidence: 'Official ATO rate',
    fields: [{ id: 'exGstAmount', label: 'Ex GST Amount', type: 'money', defaultValue: '141.50' }],
    run(input) {
      const result = calculateGstOnExclusive(moneyInput(input, 'exGstAmount'));

      return [
        { label: 'Ex GST amount', value: formatMoney(result.exGstCents) },
        { label: 'GST', value: formatMoney(result.gstCents) },
        { label: 'Inc GST amount', value: formatMoney(result.incGstCents), isAnswer: true },
      ];
    },
  },
  {
    id: 'gst-inclusive',
    name: 'GST Split From Inclusive Amount',
    group: 'GST',
    description: 'Splits GST from a GST-inclusive amount using one-eleventh at 10 percent.',
    confidence: 'Official ATO method for 10 percent GST-inclusive taxable amounts',
    fields: [{ id: 'incGstAmount', label: 'Inc GST Amount', type: 'money', defaultValue: '155.65' }],
    run(input) {
      const result = splitGstFromInclusive(moneyInput(input, 'incGstAmount'));

      return [
        { label: 'Inc GST amount', value: formatMoney(result.incGstCents) },
        { label: 'GST', value: formatMoney(result.gstCents) },
        { label: 'Ex GST amount', value: formatMoney(result.exGstCents), isAnswer: true },
      ];
    },
  },
  {
    id: 'reconciliation-row',
    name: 'Reconciliation Row',
    group: 'Reconciliation',
    description: 'Property360-style row calculation for commission, GST, and withheld amount.',
    confidence: 'Inferred from screenshots; needs more real examples',
    fields: [
      { id: 'grossRent', label: 'Gross Rent', type: 'money', defaultValue: '1820.00' },
      { id: 'commissionRatePercent', label: 'Comm Rate %', type: 'number', defaultValue: '7.5' },
      { id: 'adminFee', label: 'Admin Fee', type: 'money', defaultValue: '5.00' },
      { id: 'repairsAndMaintenance', label: 'R & M', type: 'money', defaultValue: '0.00' },
      { id: 'lettingFee', label: 'Letting', type: 'money', defaultValue: '0.00' },
      { id: 'advertisingAndPromotion', label: 'Adv & Pro', type: 'money', defaultValue: '0.00' },
      { id: 'cleaningAndGardening', label: 'Clean & Gardening', type: 'money', defaultValue: '0.00' },
      { id: 'otherExpense', label: 'Other Expense', type: 'money', defaultValue: '0.00' },
      { id: 'paymentsMade', label: 'Payments Made', type: 'money', defaultValue: '129.00' },
      { id: 'ownerPayments', label: 'Owner Payments', type: 'money', defaultValue: '0.00' },
      { id: 'deposits', label: 'Deposits', type: 'money', defaultValue: '0.00' },
    ],
    run(input) {
      const row = calculateReconciliationRow({
        grossRentCents: moneyInput(input, 'grossRent'),
        commissionRatePercent: numberInput(input, 'commissionRatePercent'),
        adminFeeCents: moneyInput(input, 'adminFee'),
        repairsAndMaintenanceCents: moneyInput(input, 'repairsAndMaintenance'),
        lettingFeeCents: moneyInput(input, 'lettingFee'),
        advertisingAndPromotionCents: moneyInput(input, 'advertisingAndPromotion'),
        cleaningAndGardeningCents: moneyInput(input, 'cleaningAndGardening'),
        otherExpenseCents: moneyInput(input, 'otherExpense'),
        paymentsMadeCents: moneyInput(input, 'paymentsMade'),
        ownerPaymentsCents: moneyInput(input, 'ownerPayments'),
        depositsCents: moneyInput(input, 'deposits'),
      });

      return [
        { label: 'Commission', value: formatMoney(row.commissionCents) },
        { label: 'Agency fees ex GST', value: formatMoney(row.agencyFeesExGstCents) },
        { label: 'Owners GST', value: formatMoney(row.ownersGstCents) },
        { label: 'External/owner payments', value: formatMoney(row.externalOrOwnerPaymentsCents) },
        { label: 'Chq amount withheld', value: formatMoney(row.chequeAmountWithheldCents), isAnswer: true },
      ];
    },
  },
  {
    id: 'gross-yield',
    name: 'Gross Rental Yield',
    group: 'Performance',
    description: 'Annualised weekly rent divided by property value.',
    confidence: 'Finance convention',
    fields: [
      { id: 'weeklyRent', label: 'Weekly Rent', type: 'money', defaultValue: '650.00' },
      { id: 'propertyValue', label: 'Property Value', type: 'money', defaultValue: '800000.00' },
    ],
    run(input) {
      const yieldPercent = calculateGrossYieldPercent(
        moneyInput(input, 'weeklyRent'),
        moneyInput(input, 'propertyValue'),
      );

      return [
        { label: 'Weekly rent', value: formatMoney(moneyInput(input, 'weeklyRent')) },
        { label: 'Property value', value: formatMoney(moneyInput(input, 'propertyValue')) },
        { label: 'Gross yield', value: `${yieldPercent.toFixed(2)}%`, isAnswer: true },
      ];
    },
  },
];

export function getFormulaDefinitionsForClient(): FormulaForClient[] {
  return formulaDefinitions.map(({ run: _run, ...definition }) => definition);
}

export function runCalculation(id: string, input: Record<string, unknown>): CalculationOutput[] {
  const formula = formulaDefinitions.find((definition) => definition.id === id);

  if (!formula) {
    throw new Error(`Unknown formula: ${id}`);
  }

  return formula.run(input);
}

function moneyInput(input: Record<string, unknown>, id: string): number {
  const raw = input[id];

  if (typeof raw !== 'string' && typeof raw !== 'number') {
    throw new TypeError(`${id} must be a money value`);
  }

  const value = typeof raw === 'number' ? raw : Number(raw.replace(/[$,]/g, ''));

  if (!Number.isFinite(value)) {
    throw new TypeError(`${id} must be a valid money value`);
  }

  return dollarsToCents(value);
}

function numberInput(input: Record<string, unknown>, id: string): number {
  const raw = input[id];
  const value = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : Number.NaN;

  if (!Number.isFinite(value)) {
    throw new TypeError(`${id} must be a valid number`);
  }

  return value;
}

function booleanInput(input: Record<string, unknown>, id: string): boolean {
  const raw = input[id];

  if (typeof raw === 'boolean') {
    return raw;
  }

  if (raw === 'true') {
    return true;
  }

  if (raw === 'false') {
    return false;
  }

  throw new TypeError(`${id} must be true or false`);
}

function stringInput(input: Record<string, unknown>, id: string): string {
  const raw = input[id];

  if (typeof raw !== 'string' || raw.length === 0) {
    throw new TypeError(`${id} must be a non-empty string`);
  }

  return raw;
}

function selectInput<T extends string>(input: Record<string, unknown>, id: string): T {
  return stringInput(input, id) as T;
}

function formatMoney(cents: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(cents / 100);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-AU', {
    maximumFractionDigits: 4,
  }).format(value);
}

function formatBoolean(value: boolean): string {
  return value ? 'Yes' : 'No';
}

function formatLabel(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
