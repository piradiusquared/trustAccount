import test from 'node:test';
import assert from 'node:assert/strict';

import { getFormulaDefinitionsForClient, runCalculation } from '../src/workbench/calculators.ts';

test('workbench exposes formula definitions without executable functions', () => {
  const formulas = getFormulaDefinitionsForClient();

  assert.ok(formulas.length >= 8);
  assert.equal('run' in formulas[0], false);
});

test('workbench runs the QLD bond cap calculator', () => {
  assert.deepEqual(
    runCalculation('qld-bond-cap', {
      weeklyRent: '455.00',
      tenancyType: 'general',
    }),
    [
      { label: 'Weekly rent', value: '$455.00' },
      { label: 'Tenancy type', value: 'General' },
      { label: 'Max bond', value: '$1,820.00', isAnswer: true },
    ],
  );
});

test('workbench runs the Property360 reconciliation row calculator', () => {
  const outputs = runCalculation('reconciliation-row', {
    grossRent: '1820.00',
    commissionRatePercent: '7.5',
    adminFee: '5.00',
    repairsAndMaintenance: '0.00',
    lettingFee: '0.00',
    advertisingAndPromotion: '0.00',
    cleaningAndGardening: '0.00',
    otherExpense: '0.00',
    paymentsMade: '129.00',
    ownerPayments: '0.00',
    deposits: '0.00',
  });

  assert.deepEqual(outputs.at(-1), {
    label: 'Chq amount withheld',
    value: '$1,535.35',
    isAnswer: true,
  });
});
