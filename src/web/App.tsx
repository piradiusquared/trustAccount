import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import {
  PropertyManagementApp,
  createInMemoryStore,
  type InvoiceRecord,
  type LedgerKind,
  type LedgerTargetType,
  type LeaseRecord,
  type OwnerRecord,
  type PropertyRecord,
} from '../app/index.ts';

type SectionId = 'overview' | 'owners' | 'properties' | 'leases' | 'ledger' | 'invoices';

interface DemoContext {
  app: PropertyManagementApp;
  primaryOwnerId: string;
  primaryPropertyId: string;
  primaryLeaseId: string;
}

const sections: Array<{ id: SectionId; label: string; hint: string }> = [
  { id: 'overview', label: 'Overview', hint: 'Raw state and counts' },
  { id: 'owners', label: 'Owners', hint: 'Create and edit owner records' },
  { id: 'properties', label: 'Properties', hint: 'Create and edit property records' },
  { id: 'leases', label: 'Leases', hint: 'Create and edit lease records' },
  { id: 'ledger', label: 'Ledger', hint: 'Deposit, payment, expense, withheld' },
  { id: 'invoices', label: 'Invoices', hint: 'Create and mark invoices' },
];

/**
 * AppShell is the React entry point.
 *
 * The whole UI is intentionally thin:
 * - the service layer handles record creation and validation
 * - React handles form state and visual feedback
 * - the debug inspector shows the current in-memory snapshot
 */
export function AppShell() {
  const [sessionKey, setSessionKey] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [renderTick, setRenderTick] = useState(0);

  const demo = useMemo(() => createDemoContext(), [sessionKey]);

  const refresh = () => {
    setRenderTick((value) => value + 1);
  };

  const resetDemo = () => {
    setSessionKey((value) => value + 1);
    setActiveSection('overview');
  };

  return (
    <div className="app-shell" key={sessionKey}>
      <header className="topbar">
        <div>
          <p className="eyebrow">Simply Property</p>
          <h1>React shell for RAM-first testing</h1>
          <p className="topbar-copy">
            The app state stays in memory for now, which makes it easy to inspect form flow before any database is
            wired in.
          </p>
        </div>
        <button className="ghost-button" type="button" onClick={resetDemo}>
          Reset demo
        </button>
      </header>

      <nav className="tabbar" aria-label="Main sections">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={section.id === activeSection ? 'tab active' : 'tab'}
            onClick={() => setActiveSection(section.id)}
          >
            <span>{section.label}</span>
            <small>{section.hint}</small>
          </button>
        ))}
      </nav>

      <section className="summary-grid">
        <Metric label="Owners" value={demo.app.listOwners().length} />
        <Metric label="Properties" value={demo.app.listProperties().length} />
        <Metric label="Leases" value={demo.app.listLeases().length} />
        <Metric label="Lease balance" value={formatMoney(demo.app.getLedgerBalance('lease', demo.primaryLeaseId))} />
      </section>

      <main className="workspace">
        {activeSection === 'overview' && <OverviewPanel app={demo.app} />}
        {activeSection === 'owners' && <OwnersPanel app={demo.app} onMutate={refresh} />}
        {activeSection === 'properties' && (
          <PropertiesPanel app={demo.app} onMutate={refresh} defaultOwnerId={demo.primaryOwnerId} />
        )}
        {activeSection === 'leases' && (
          <LeasesPanel app={demo.app} onMutate={refresh} defaultPropertyId={demo.primaryPropertyId} />
        )}
        {activeSection === 'ledger' && (
          <LedgerPanel app={demo.app} onMutate={refresh} defaultLeaseId={demo.primaryLeaseId} />
        )}
        {activeSection === 'invoices' && <InvoicesPanel app={demo.app} onMutate={refresh} />}
      </main>

      <footer className="debug-panel">
        <div className="panel-head">
          <div>
            <h2>Live state inspector</h2>
            <p>Use this to compare the visual form state against the underlying in-memory model.</p>
          </div>
        </div>
        <pre>{JSON.stringify(demo.app.getSnapshot(), null, 2)}</pre>
        <span className="debug-note">Render tick: {renderTick}</span>
      </footer>
    </div>
  );
}

function OverviewPanel({ app }: { app: PropertyManagementApp }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Overview</h2>
          <p>Everything here is still RAM-backed. This is the safest place to test small flows.</p>
        </div>
      </div>
      <div className="grid-two">
        <InfoCard label="Owners" value={String(app.listOwners().length)} />
        <InfoCard label="Properties" value={String(app.listProperties().length)} />
        <InfoCard label="Leases" value={String(app.listLeases().length)} />
        <InfoCard label="Unpaid invoices" value={String(app.listInvoices('unpaid').length)} />
      </div>
      <ListPreview title="Recent owners" rows={app.listOwners().slice(-3).map(formatOwnerRow)} />
      <ListPreview title="Recent leases" rows={app.listLeases().slice(-3).map(formatLeaseRow)} />
    </section>
  );
}

function OwnersPanel({ app, onMutate }: { app: PropertyManagementApp; onMutate: () => void }) {
  const [reference, setReference] = useState('OWN-2');
  const [firstName, setFirstName] = useState('New');
  const [surname, setSurname] = useState('Owner');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    app.createOwner({ reference, firstName, surname, email, notes });
    setReference(nextAutoReference(reference, 'OWN'));
    setFirstName('');
    setSurname('');
    setEmail('');
    setNotes('');
    onMutate();
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Owners</h2>
          <p>This panel is for identity and contact data. Keep the fields editable and simple.</p>
        </div>
      </div>
      <form className="form-grid" onSubmit={submit}>
        <Field label="Reference">
          <input value={reference} onChange={(event) => setReference(event.target.value)} />
        </Field>
        <Field label="Title">
          <input value="" readOnly placeholder="Optional" />
        </Field>
        <Field label="First name">
          <input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
        </Field>
        <Field label="Surname">
          <input value={surname} onChange={(event) => setSurname(event.target.value)} />
        </Field>
        <Field label="Email">
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <Field label="Notes">
          <input value={notes} onChange={(event) => setNotes(event.target.value)} />
        </Field>
        <div className="actions">
          <button type="submit">Create owner</button>
        </div>
      </form>

      <RecordsTable
        columns={['Reference', 'Name', 'Email', 'Notes', 'Actions']}
        rows={app.listOwners().map((owner) => [
          owner.reference,
          [owner.firstName, owner.surname].filter(Boolean).join(' '),
          owner.email ?? '—',
          owner.notes ?? '—',
          <button
            type="button"
            className="small-button"
            onClick={() => {
              if (confirm(`Are you sure you want to delete owner ${owner.reference}?`)) {
                app.deleteOwner(owner.id);
                onMutate();
              }
            }}
          >
            Delete
          </button>,
        ])}
      />
    </section>
  );
}

function PropertiesPanel({
  app,
  onMutate,
  defaultOwnerId,
}: {
  app: PropertyManagementApp;
  onMutate: () => void;
  defaultOwnerId: string;
}) {
  const [ownerId, setOwnerId] = useState(defaultOwnerId);
  const [reference, setReference] = useState('PROP-2');
  const [propertyType, setPropertyType] = useState('Townhouse');
  const [address, setAddress] = useState('1 Example Street, Test QLD 0000');
  const [rentFrequency, setRentFrequency] = useState<'weekly' | 'fortnightly' | 'monthly'>('weekly');
  const [rent, setRent] = useState('500.00');
  const [commission, setCommission] = useState('5.00');
  const [adminFee, setAdminFee] = useState('5.00');

  const owners = app.listOwners();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    app.createProperty({
      reference,
      ownerId,
      propertyType,
      address,
      rentFrequency,
      rentCents: parseMoney(rent),
      commissionRatePercent: Number(commission),
      adminFeeCents: parseMoney(adminFee),
    });
    setReference(nextAutoReference(reference, 'PROP'));
    onMutate();
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Properties</h2>
          <p>Property records carry the rent and fee defaults. This is the main setup layer for leases.</p>
        </div>
      </div>
      <form className="form-grid" onSubmit={submit}>
        <Field label="Owner">
          <select value={ownerId} onChange={(event) => setOwnerId(event.target.value)}>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.reference} - {owner.firstName} {owner.surname ?? ''}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Reference">
          <input value={reference} onChange={(event) => setReference(event.target.value)} />
        </Field>
        <Field label="Type">
          <input value={propertyType} onChange={(event) => setPropertyType(event.target.value)} />
        </Field>
        <Field label="Address">
          <input value={address} onChange={(event) => setAddress(event.target.value)} />
        </Field>
        <Field label="Rent frequency">
          <select value={rentFrequency} onChange={(event) => setRentFrequency(event.target.value as typeof rentFrequency)}>
            <option value="weekly">Weekly</option>
            <option value="fortnightly">Fortnightly</option>
            <option value="monthly">Monthly</option>
          </select>
        </Field>
        <Field label="Rent">
          <input value={rent} onChange={(event) => setRent(event.target.value)} />
        </Field>
        <Field label="Commission %">
          <input value={commission} onChange={(event) => setCommission(event.target.value)} />
        </Field>
        <Field label="Admin fee">
          <input value={adminFee} onChange={(event) => setAdminFee(event.target.value)} />
        </Field>
        <div className="actions">
          <button type="submit">Create property</button>
        </div>
      </form>

      <RecordsTable
        columns={['Reference', 'Owner', 'Address', 'Rent', 'Commission']}
        rows={app.listProperties().map((property) => [
          property.reference,
          property.ownerId,
          property.address,
          formatMoney(property.rentCents),
          formatPercent(property.commissionRatePercent),
        ])}
      />
    </section>
  );
}

function LeasesPanel({
  app,
  onMutate,
  defaultPropertyId,
}: {
  app: PropertyManagementApp;
  onMutate: () => void;
  defaultPropertyId: string;
}) {
  const [propertyId, setPropertyId] = useState(defaultPropertyId);
  const [tenantName, setTenantName] = useState('New Tenant');
  const [startDate, setStartDate] = useState('2026-06-21');
  const [endDate, setEndDate] = useState('2026-12-19');
  const [rentFrequency, setRentFrequency] = useState<'weekly' | 'fortnightly' | 'monthly'>('weekly');
  const [rent, setRent] = useState('500.00');
  const [bond, setBond] = useState('2000.00');
  const [existingCredit, setExistingCredit] = useState('0.00');

  const properties = app.listProperties();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    app.createLease({
      propertyId,
      tenantName,
      startDate,
      endDate,
      rentFrequency,
      rentCents: parseMoney(rent),
      bondCents: parseMoney(bond),
      existingTenantCreditCents: parseMoney(existingCredit),
    });
    setTenantName('');
    onMutate();
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Leases</h2>
          <p>Use this panel to test lease setup, historic edits, and rent-linked data entry.</p>
        </div>
      </div>
      <form className="form-grid" onSubmit={submit}>
        <Field label="Property">
          <select value={propertyId} onChange={(event) => setPropertyId(event.target.value)}>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.reference} - {property.address}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tenant name">
          <input value={tenantName} onChange={(event) => setTenantName(event.target.value)} />
        </Field>
        <Field label="Start date">
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </Field>
        <Field label="End date">
          <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </Field>
        <Field label="Rent frequency">
          <select value={rentFrequency} onChange={(event) => setRentFrequency(event.target.value as typeof rentFrequency)}>
            <option value="weekly">Weekly</option>
            <option value="fortnightly">Fortnightly</option>
            <option value="monthly">Monthly</option>
          </select>
        </Field>
        <Field label="Rent">
          <input value={rent} onChange={(event) => setRent(event.target.value)} />
        </Field>
        <Field label="Bond">
          <input value={bond} onChange={(event) => setBond(event.target.value)} />
        </Field>
        <Field label="Existing credit">
          <input value={existingCredit} onChange={(event) => setExistingCredit(event.target.value)} />
        </Field>
        <div className="actions">
          <button type="submit">Create lease</button>
        </div>
      </form>

      <RecordsTable
        columns={['Property', 'Tenant', 'Term', 'Rent', 'Bond']}
        rows={app.listLeases().map((lease) => [
          lease.propertyId,
          lease.tenantName,
          `${formatDate(lease.startDate)} to ${formatDate(lease.endDate)}`,
          formatMoney(lease.rentCents),
          formatMoney(lease.bondCents ?? 0),
        ])}
      />
    </section>
  );
}

function LedgerPanel({
  app,
  onMutate,
  defaultLeaseId,
}: {
  app: PropertyManagementApp;
  onMutate: () => void;
  defaultLeaseId: string;
}) {
  const [targetType, setTargetType] = useState<LedgerTargetType>('lease');
  const [targetId, setTargetId] = useState(defaultLeaseId);
  const [kind, setKind] = useState<LedgerKind>('deposit');
  const [amount, setAmount] = useState('200.00');
  const [occurredOn, setOccurredOn] = useState('2026-06-21');
  const [note, setNote] = useState('Test entry');

  const targetOptions = getTargetOptions(app, targetType);

  useEffect(() => {
    setTargetId(targetOptions[0]?.value ?? '');
  }, [targetType]);

  const balance = targetId ? app.getLedgerBalance(targetType, targetId) : 0;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    app.recordLedgerEntry({
      targetType,
      targetId,
      kind,
      amountCents: parseMoney(amount),
      occurredOn,
      note,
    });
    onMutate();
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Ledger</h2>
          <p>Deposits add to balance. Payments, expenses, and withheld amounts reduce it.</p>
        </div>
        <div className="balance-pill">Current balance {formatMoney(balance)}</div>
      </div>
      <form className="form-grid" onSubmit={submit}>
        <Field label="Target type">
          <select value={targetType} onChange={(event) => setTargetType(event.target.value as LedgerTargetType)}>
            <option value="lease">Lease</option>
            <option value="property">Property</option>
            <option value="owner">Owner</option>
          </select>
        </Field>
        <Field label="Target record">
          <select value={targetId} onChange={(event) => setTargetId(event.target.value)}>
            {targetOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Entry type">
          <select value={kind} onChange={(event) => setKind(event.target.value as LedgerKind)}>
            <option value="deposit">Deposit</option>
            <option value="payment">Payment</option>
            <option value="expense">Expense</option>
            <option value="withheld">Withheld</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </Field>
        <Field label="Amount">
          <input value={amount} onChange={(event) => setAmount(event.target.value)} />
        </Field>
        <Field label="Date">
          <input type="date" value={occurredOn} onChange={(event) => setOccurredOn(event.target.value)} />
        </Field>
        <Field label="Note">
          <input value={note} onChange={(event) => setNote(event.target.value)} />
        </Field>
        <div className="actions">
          <button type="submit">Record entry</button>
        </div>
      </form>

      <RecordsTable
        columns={['Date', 'Target', 'Type', 'Amount', 'Delta', 'Note']}
        rows={app.listLedgerEntries(targetType, targetId).map((entry) => [
          formatDate(entry.occurredOn),
          entry.targetId,
          entry.kind,
          formatMoney(entry.amountCents),
          formatMoney(entry.deltaCents),
          entry.note ?? '—',
        ])}
      />
    </section>
  );
}

function InvoicesPanel({ app, onMutate }: { app: PropertyManagementApp; onMutate: () => void }) {
  const [issueTo, setIssueTo] = useState('H156E [Merry Tui]');
  const [auditNo, setAuditNo] = useState('2777');
  const [category, setCategory] = useState('water');
  const [description, setDescription] = useState('H156 final water usage bill');
  const [invoiceDate, setInvoiceDate] = useState('2026-05-15');
  const [dueDate, setDueDate] = useState('2026-05-15');
  const [amount, setAmount] = useState('349.32');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    app.createInvoice({
      issueTo,
      auditNo,
      category,
      description,
      invoiceDate,
      dueDate,
      amountCents: parseMoney(amount),
    });
    onMutate();
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Invoices</h2>
          <p>Separate from the ledger, this is where you can test unpaid, paid, reversed, and void states.</p>
        </div>
      </div>

      <form className="form-grid" onSubmit={submit}>
        <Field label="Issue to">
          <input value={issueTo} onChange={(event) => setIssueTo(event.target.value)} />
        </Field>
        <Field label="Audit no.">
          <input value={auditNo} onChange={(event) => setAuditNo(event.target.value)} />
        </Field>
        <Field label="Category">
          <input value={category} onChange={(event) => setCategory(event.target.value)} />
        </Field>
        <Field label="Description">
          <input value={description} onChange={(event) => setDescription(event.target.value)} />
        </Field>
        <Field label="Invoice date">
          <input type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} />
        </Field>
        <Field label="Due date">
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </Field>
        <Field label="Amount">
          <input value={amount} onChange={(event) => setAmount(event.target.value)} />
        </Field>
        <div className="actions">
          <button type="submit">Create invoice</button>
        </div>
      </form>

      <InvoiceBoard app={app} onMutate={onMutate} />
    </section>
  );
}

function InvoiceBoard({ app, onMutate }: { app: PropertyManagementApp; onMutate: () => void }) {
  const paid = app.listInvoices('paid');
  const unpaid = app.listInvoices('unpaid');
  const reversed = app.listInvoices('reversed');
  const voided = app.listInvoices('void');

  return (
    <div className="invoice-grid">
      <InvoiceTable title="Unpaid invoices" rows={unpaid} onMutate={onMutate} app={app} />
      <InvoiceTable title="Paid invoices" rows={paid} onMutate={onMutate} app={app} />
      <InvoiceTable title="Reversed invoices" rows={reversed} onMutate={onMutate} app={app} />
      <InvoiceTable title="Void invoices" rows={voided} onMutate={onMutate} app={app} />
    </div>
  );
}

function InvoiceTable({
  title,
  rows,
  app,
  onMutate,
}: {
  title: string;
  rows: readonly InvoiceRecord[];
  app: PropertyManagementApp;
  onMutate: () => void;
}) {
  return (
    <section className="subpanel">
      <div className="panel-head">
        <div>
          <h3>{title}</h3>
          <p>Invoice records stay independent from ledger balances.</p>
        </div>
      </div>
      <RecordsTable
        columns={['Issue to', 'Audit no.', 'Category', 'Description', 'Invoice date', 'Due date', 'Amount', 'Actions']}
        rows={rows.map((invoice) => [
          invoice.issueTo,
          invoice.auditNo,
          invoice.category,
          invoice.description,
          formatDate(invoice.invoiceDate),
          formatDate(invoice.dueDate),
          formatMoney(invoice.amountCents),
          <InvoiceActions app={app} invoice={invoice} onMutate={onMutate} />,
        ])}
      />
    </section>
  );
}

function InvoiceActions({ app, invoice, onMutate }: { app: PropertyManagementApp; invoice: InvoiceRecord; onMutate: () => void }) {
  return (
    <div className="action-row">
      <button
        type="button"
        className="small-button"
        onClick={() => {
          app.markInvoicePaid(invoice.id, todayIso());
          onMutate();
        }}
      >
        Paid
      </button>
      <button
        type="button"
        className="small-button"
        onClick={() => {
          app.markInvoiceReversed(invoice.id, todayIso());
          onMutate();
        }}
      >
        Reverse
      </button>
      <button
        type="button"
        className="small-button"
        onClick={() => {
          app.markInvoiceVoided(invoice.id, todayIso());
          onMutate();
        }}
      >
        Void
      </button>
      <button type="button" className="small-button" onClick={onMutate}>
        Refresh
      </button>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ListPreview({ title, rows }: { title: string; rows: string[] }) {
  return (
    <section className="preview">
      <h3>{title}</h3>
      <ul>
        {rows.length ? rows.map((row) => <li key={row}>{row}</li>) : <li>No records yet.</li>}
      </ul>
    </section>
  );
}

function RecordsTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>No records yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function createDemoContext(): DemoContext {
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
    rentCents: 500_00,
    commissionRatePercent: 5,
    adminFeeCents: 5_00,
  });

  const lease = app.createLease({
    propertyId: property.id,
    tenantName: 'test test2',
    startDate: '2026-06-21',
    endDate: '2026-12-19',
    rentFrequency: 'weekly',
    rentCents: 500_00,
    bondCents: 2_000_00,
    existingTenantCreditCents: 100_00,
  });

  app.recordLedgerEntry({
    targetType: 'lease',
    targetId: lease.id,
    kind: 'deposit',
    amountCents: 200_00,
    occurredOn: '2026-06-21',
    note: 'Seed deposit',
  });

  app.recordLedgerEntry({
    targetType: 'lease',
    targetId: lease.id,
    kind: 'payment',
    amountCents: 50_00,
    occurredOn: '2026-06-22',
    note: 'Seed payment',
  });

  app.createInvoice({
    issueTo: 'H156E [Merry Tui]',
    auditNo: '2777',
    category: 'water',
    description: 'H156 final water usage bill',
    invoiceDate: '2026-05-15',
    dueDate: '2026-05-15',
    amountCents: 349_32,
  });

  return {
    app,
    primaryOwnerId: owner.id,
    primaryPropertyId: property.id,
    primaryLeaseId: lease.id,
  };
}

function getTargetOptions(app: PropertyManagementApp, targetType: LedgerTargetType): Array<{ label: string; value: string }> {
  if (targetType === 'owner') {
    return app.listOwners().map((owner) => ({ label: `${owner.reference} - ${owner.firstName} ${owner.surname ?? ''}`, value: owner.id }));
  }

  if (targetType === 'property') {
    return app.listProperties().map((property) => ({ label: `${property.reference} - ${property.address}`, value: property.id }));
  }

  return app.listLeases().map((lease) => ({ label: `${lease.tenantName} - ${lease.id}`, value: lease.id }));
}

function formatOwnerRow(owner: OwnerRecord): string {
  return `${owner.reference}: ${owner.firstName} ${owner.surname ?? ''}`;
}

function formatLeaseRow(lease: LeaseRecord): string {
  return `${lease.tenantName} (${formatDate(lease.startDate)} to ${formatDate(lease.endDate)})`;
}

function nextAutoReference(current: string, prefix: string): string {
  const match = current.match(new RegExp(`^${prefix}-(\\d+)$`));
  if (!match) {
    return `${prefix}-2`;
  }

  return `${prefix}-${Number(match[1]) + 1}`;
}

function parseMoney(value: string): number {
  const normalized = value.replace(/[$,\s]/g, '');
  const amount = Number.parseFloat(normalized);

  if (Number.isNaN(amount)) {
    throw new Error(`Invalid money value: ${value}`);
  }

  return Math.round(amount * 100);
}

function formatMoney(cents: number): string {
  const amount = (cents / 100).toFixed(2);
  return `$${Number(amount).toLocaleString('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-AU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
