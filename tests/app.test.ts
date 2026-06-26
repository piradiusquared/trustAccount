import test from 'node:test';
import assert from 'node:assert/strict';

import { PropertyManagementApp, createInMemoryStore } from '../src/app/index.ts';

test('keeps the first pass entirely in RAM', () => {
  const app = new PropertyManagementApp(createInMemoryStore());

  const owner = app.createOwner({
    reference: 'OWN-1',
    firstName: 'Merry',
    surname: 'Tui',
  });

  const property = app.createProperty({
    reference: 'PROP-1',
    ownerId: owner.id,
    propertyType: 'Townhouse',
    address: '0 TEST, Tests QLD 0000',
    rentFrequency: 'weekly',
    rentCents: 50_000,
    commissionRatePercent: 5,
    adminFeeCents: 500,
  });

  const lease = app.createLease({
    propertyId: property.id,
    tenantName: 'test test2',
    startDate: '2026-06-21',
    endDate: '2026-12-19',
    rentFrequency: 'weekly',
    rentCents: 50_000,
    bondCents: 2_000_00,
    existingTenantCreditCents: 100_00,
  });

  app.recordLedgerEntry({
    targetType: 'lease',
    targetId: lease.id,
    kind: 'deposit',
    amountCents: 20_000,
    occurredOn: '2026-06-21',
    note: 'Tenant deposit',
  });

  app.recordLedgerEntry({
    targetType: 'lease',
    targetId: lease.id,
    kind: 'payment',
    amountCents: 5_000,
    occurredOn: '2026-06-22',
    note: 'Payment',
  });

  app.recordLedgerEntry({
    targetType: 'lease',
    targetId: lease.id,
    kind: 'withheld',
    amountCents: 2_500,
    occurredOn: '2026-06-23',
    note: 'Withheld amount',
  });

  assert.equal(app.getLedgerBalance('lease', lease.id), 12_500);
  assert.equal(app.listOwners().length, 1);
  assert.equal(app.listProperties().length, 1);
  assert.equal(app.listLeases().length, 1);
});

test('tracks invoices separately from the ledger balance', () => {
  const app = new PropertyManagementApp(createInMemoryStore());

  const invoice = app.createInvoice({
    issueTo: 'H156E [Merry Tui]',
    auditNo: '2777',
    category: 'water',
    description: 'H156 final water usage bill',
    invoiceDate: '2026-05-15',
    dueDate: '2026-05-15',
    amountCents: 34_932,
  });

  assert.equal(app.listInvoices('unpaid').length, 1);
  assert.equal(app.listInvoices('paid').length, 0);

  app.markInvoicePaid(invoice.id, '2026-06-19');

  assert.equal(app.listInvoices('unpaid').length, 0);
  assert.equal(app.listInvoices('paid').length, 1);
});

test('refuses to create leases for unknown properties', () => {
  const app = new PropertyManagementApp(createInMemoryStore());

  assert.throws(() => {
    app.createLease({
      propertyId: 'missing-property',
      tenantName: 'test',
      startDate: '2026-06-21',
      endDate: '2026-12-19',
      rentFrequency: 'weekly',
      rentCents: 50_000,
    });
  }, /Property not found/);
});

