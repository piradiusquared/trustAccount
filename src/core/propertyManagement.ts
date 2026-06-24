import type {
  AppState,
  CreateInvoiceInput,
  CreateLedgerEntryInput,
  CreateLeaseInput,
  CreateOwnerInput,
  CreatePropertyInput,
  EntityId,
  InvoiceRecord,
  InvoiceStatus,
  LedgerEntryRecord,
  LedgerKind,
  LedgerTargetType,
  LeaseRecord,
  OwnerRecord,
  PropertyRecord,
} from './domain.ts';
import type { AppStore } from './store.ts';

export class PropertyManagementApp {
  private readonly store: AppStore;

  constructor(store: AppStore) {
    this.store = store;
  }

  getSnapshot(): AppState {
    return this.store.getSnapshot();
  }

  listOwners(): readonly OwnerRecord[] {
    return this.store.getSnapshot().owners;
  }

  listProperties(): readonly PropertyRecord[] {
    return this.store.getSnapshot().properties;
  }

  listLeases(): readonly LeaseRecord[] {
    return this.store.getSnapshot().leases;
  }

  listInvoices(status?: InvoiceStatus): readonly InvoiceRecord[] {
    const invoices = this.store.getSnapshot().invoices;
    return status ? invoices.filter((invoice) => invoice.status === status) : invoices;
  }

  listLedgerEntries(targetType: LedgerTargetType, targetId: EntityId): readonly LedgerEntryRecord[] {
    return this.store
      .getSnapshot()
      .ledgerEntries.filter((entry) => entry.targetType === targetType && entry.targetId === targetId);
  }

  createOwner(input: CreateOwnerInput): OwnerRecord {
    const now = currentIsoTimestamp();
    const owner: OwnerRecord = {
      id: nextId('owner'),
      reference: requireText(input.reference, 'reference'),
      title: input.title?.trim() || undefined,
      firstName: requireText(input.firstName, 'firstName'),
      surname: input.surname?.trim() || undefined,
      email: input.email?.trim() || undefined,
      mobile: input.mobile?.trim() || undefined,
      postalAddress: input.postalAddress?.trim() || undefined,
      bankName: input.bankName?.trim() || undefined,
      accountName: input.accountName?.trim() || undefined,
      bsb: input.bsb?.trim() || undefined,
      accountNumber: input.accountNumber?.trim() || undefined,
      paymentReference: input.paymentReference?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    this.store.update((draft) => {
      draft.owners.push(owner);
    });

    return owner;
  }

  updateOwner(id: EntityId, patch: Partial<CreateOwnerInput>): OwnerRecord {
    let updated: OwnerRecord | undefined;

    this.store.update((draft) => {
      const owner = findById(draft.owners, id, 'owner');
      applyDefinedPatch(owner, normalizeOwnerPatch(patch));
      owner.updatedAt = currentIsoTimestamp();
      updated = owner;
    });

    return updated as OwnerRecord;
  }

  deleteOwner(id: EntityId): void {
    this.store.update((draft) => {
      draft.owners = draft.owners.filter((owner) => owner.id !== id);
    });
  }

  createProperty(input: CreatePropertyInput): PropertyRecord {
    const now = currentIsoTimestamp();
    const property: PropertyRecord = {
      id: nextId('property'),
      reference: requireText(input.reference, 'reference'),
      ownerId: requireText(input.ownerId, 'ownerId'),
      propertyType: requireText(input.propertyType, 'propertyType'),
      address: requireText(input.address, 'address'),
      rentFrequency: input.rentFrequency,
      rentCents: requireMoney(input.rentCents, 'rentCents'),
      commissionRatePercent: requireNumber(input.commissionRatePercent, 'commissionRatePercent'),
      adminFeeCents: requireMoney(input.adminFeeCents, 'adminFeeCents'),
      backyardMaintenanceFeeCents: optionalMoney(input.backyardMaintenanceFeeCents),
      advertisementFeeCents: optionalMoney(input.advertisementFeeCents),
      agreedSpendingLimitCents: optionalMoney(input.agreedSpendingLimitCents),
      notes: input.notes?.trim() || undefined,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    this.ensureOwnerExists(property.ownerId);

    this.store.update((draft) => {
      draft.properties.push(property);
    });

    return property;
  }

  updateProperty(id: EntityId, patch: Partial<CreatePropertyInput>): PropertyRecord {
    let updated: PropertyRecord | undefined;

    this.store.update((draft) => {
      const property = findById(draft.properties, id, 'property');
      if (patch.ownerId) {
        this.ensureOwnerExists(patch.ownerId);
      }
      applyDefinedPatch(property, normalizePropertyPatch(patch));
      property.updatedAt = currentIsoTimestamp();
      updated = property;
    });

    return updated as PropertyRecord;
  }

  createLease(input: CreateLeaseInput): LeaseRecord {
    const now = currentIsoTimestamp();
    const lease: LeaseRecord = {
      id: nextId('lease'),
      propertyId: requireText(input.propertyId, 'propertyId'),
      tenantName: requireText(input.tenantName, 'tenantName'),
      startDate: requireText(input.startDate, 'startDate'),
      endDate: requireText(input.endDate, 'endDate'),
      rentFrequency: input.rentFrequency,
      rentCents: requireMoney(input.rentCents, 'rentCents'),
      bondCents: optionalMoney(input.bondCents),
      existingTenantCreditCents: optionalMoney(input.existingTenantCreditCents),
      tenantCount: optionalPositiveInteger(input.tenantCount, 'tenantCount'),
      petsAllowed: input.petsAllowed,
      petCount: optionalPositiveInteger(input.petCount, 'petCount'),
      specialConditionNotes: input.specialConditionNotes?.trim() || undefined,
      actualMoveOutDate: input.actualMoveOutDate?.trim() || undefined,
      lettingFeeSelection: input.lettingFeeSelection?.trim() || undefined,
      status: input.status ?? 'active',
      createdAt: now,
      updatedAt: now,
    };

    this.ensurePropertyExists(lease.propertyId);

    this.store.update((draft) => {
      draft.leases.push(lease);
    });

    return lease;
  }

  updateLease(id: EntityId, patch: Partial<CreateLeaseInput>): LeaseRecord {
    let updated: LeaseRecord | undefined;

    this.store.update((draft) => {
      const lease = findById(draft.leases, id, 'lease');
      if (patch.propertyId) {
        this.ensurePropertyExists(patch.propertyId);
      }
      applyDefinedPatch(lease, normalizeLeasePatch(patch));
      lease.updatedAt = currentIsoTimestamp();
      updated = lease;
    });

    return updated as LeaseRecord;
  }

  recordLedgerEntry(input: CreateLedgerEntryInput): LedgerEntryRecord {
    const amountCents = requireMoney(input.amountCents, 'amountCents');
    const deltaCents = calculateDeltaCents(input.kind, amountCents);
    const entry: LedgerEntryRecord = {
      id: nextId('ledger'),
      targetType: input.targetType,
      targetId: requireText(input.targetId, 'targetId'),
      kind: input.kind,
      amountCents,
      deltaCents,
      occurredOn: requireText(input.occurredOn, 'occurredOn'),
      note: input.note?.trim() || undefined,
      createdAt: currentIsoTimestamp(),
    };

    this.ensureTargetExists(entry.targetType, entry.targetId);

    this.store.update((draft) => {
      draft.ledgerEntries.push(entry);
    });

    return entry;
  }

  getLedgerBalance(targetType: LedgerTargetType, targetId: EntityId): number {
    return this.listLedgerEntries(targetType, targetId).reduce((sum, entry) => sum + entry.deltaCents, 0);
  }

  createInvoice(input: CreateInvoiceInput): InvoiceRecord {
    const now = currentIsoTimestamp();
    const invoice: InvoiceRecord = {
      id: nextId('invoice'),
      issueTo: requireText(input.issueTo, 'issueTo'),
      auditNo: requireText(input.auditNo, 'auditNo'),
      category: requireText(input.category, 'category'),
      description: requireText(input.description, 'description'),
      invoiceDate: requireText(input.invoiceDate, 'invoiceDate'),
      dueDate: requireText(input.dueDate, 'dueDate'),
      amountCents: requireMoney(input.amountCents, 'amountCents'),
      status: 'unpaid',
      createdAt: now,
      updatedAt: now,
    };

    this.store.update((draft) => {
      draft.invoices.push(invoice);
    });

    return invoice;
  }

  markInvoicePaid(id: EntityId, paymentDate: string): InvoiceRecord {
    return this.updateInvoiceStatus(id, 'paid', { paymentDate });
  }

  markInvoiceReversed(id: EntityId, reversalDate: string): InvoiceRecord {
    return this.updateInvoiceStatus(id, 'reversed', { reversalDate });
  }

  markInvoiceVoided(id: EntityId, voidDate: string): InvoiceRecord {
    return this.updateInvoiceStatus(id, 'void', { voidDate });
  }

  private updateInvoiceStatus(
    id: EntityId,
    status: InvoiceStatus,
    patch: Pick<InvoiceRecord, 'paymentDate' | 'reversalDate' | 'voidDate'>,
  ): InvoiceRecord {
    let updated: InvoiceRecord | undefined;

    this.store.update((draft) => {
      const invoice = findById(draft.invoices, id, 'invoice');
      invoice.status = status;
      applyDefinedPatch(invoice, patch);
      invoice.updatedAt = currentIsoTimestamp();
      updated = invoice;
    });

    return updated as InvoiceRecord;
  }

  private ensureOwnerExists(ownerId: EntityId): void {
    const state = this.store.getSnapshot();
    if (!state.owners.some((owner) => owner.id === ownerId)) {
      throw new Error(`Owner not found: ${ownerId}`);
    }
  }

  private ensurePropertyExists(propertyId: EntityId): void {
    const state = this.store.getSnapshot();
    if (!state.properties.some((property) => property.id === propertyId)) {
      throw new Error(`Property not found: ${propertyId}`);
    }
  }

  private ensureTargetExists(targetType: LedgerTargetType, targetId: EntityId): void {
    const state = this.store.getSnapshot();
    const exists =
      targetType === 'owner'
        ? state.owners.some((owner) => owner.id === targetId)
        : targetType === 'property'
          ? state.properties.some((property) => property.id === targetId)
          : state.leases.some((lease) => lease.id === targetId);

    if (!exists) {
      throw new Error(`${targetType} not found: ${targetId}`);
    }
  }
}

function calculateDeltaCents(kind: LedgerKind, amountCents: number): number {
  if (!Number.isInteger(amountCents)) {
    throw new TypeError('amountCents must be an integer');
  }

  if (kind === 'adjustment') {
    return amountCents;
  }

  if (amountCents <= 0) {
    throw new RangeError('amountCents must be greater than 0');
  }

  return kind === 'deposit' ? amountCents : -amountCents;
}

function createIdGenerator() {
  const counters = new Map<string, number>();

  return (prefix: string): string => {
    const current = counters.get(prefix) ?? 0;
    const next = current + 1;
    counters.set(prefix, next);
    return `${prefix}_${next}`;
  };
}

const nextId = createIdGenerator();

function currentIsoTimestamp(): string {
  return new Date().toISOString();
}

function requireText(value: unknown, name: string): string {
  if (typeof value !== 'string') {
    throw new TypeError(`${name} must be a string`);
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new RangeError(`${name} cannot be empty`);
  }

  return normalized;
}

function requireNumber(value: unknown, name: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new TypeError(`${name} must be a number`);
  }

  return value;
}

function requireMoney(value: unknown, name: string): number {
  const amount = requireNumber(value, name);
  if (!Number.isInteger(amount)) {
    throw new TypeError(`${name} must be an integer number of cents`);
  }

  return amount;
}

function optionalMoney(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return requireMoney(value, 'money');
}

function optionalPositiveInteger(value: unknown, name: string): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const number = requireNumber(value, name);
  if (!Number.isInteger(number) || number < 0) {
    throw new RangeError(`${name} must be a non-negative integer`);
  }

  return number;
}

function findById<T extends { id: EntityId }>(items: T[], id: EntityId, label: string): T {
  const item = items.find((entry) => entry.id === id);
  if (!item) {
    throw new Error(`${label} not found: ${id}`);
  }

  return item;
}

function normalizeOwnerPatch(patch: Partial<CreateOwnerInput>): Partial<OwnerRecord> {
  return {
    reference: requiredPatchText(patch.reference, 'reference'),
    title: optionalPatchText(patch.title),
    firstName: requiredPatchText(patch.firstName, 'firstName'),
    surname: optionalPatchText(patch.surname),
    email: optionalPatchText(patch.email),
    mobile: optionalPatchText(patch.mobile),
    postalAddress: optionalPatchText(patch.postalAddress),
    bankName: optionalPatchText(patch.bankName),
    accountName: optionalPatchText(patch.accountName),
    bsb: optionalPatchText(patch.bsb),
    accountNumber: optionalPatchText(patch.accountNumber),
    paymentReference: optionalPatchText(patch.paymentReference),
    notes: optionalPatchText(patch.notes),
  };
}

function normalizePropertyPatch(patch: Partial<CreatePropertyInput>): Partial<PropertyRecord> {
  return {
    reference: requiredPatchText(patch.reference, 'reference'),
    ownerId: requiredPatchText(patch.ownerId, 'ownerId'),
    propertyType: requiredPatchText(patch.propertyType, 'propertyType'),
    address: requiredPatchText(patch.address, 'address'),
    rentFrequency: patch.rentFrequency,
    rentCents: patch.rentCents !== undefined ? requireMoney(patch.rentCents, 'rentCents') : undefined,
    commissionRatePercent:
      patch.commissionRatePercent !== undefined
        ? requireNumber(patch.commissionRatePercent, 'commissionRatePercent')
        : undefined,
    adminFeeCents: patch.adminFeeCents !== undefined ? requireMoney(patch.adminFeeCents, 'adminFeeCents') : undefined,
    backyardMaintenanceFeeCents: optionalMoney(patch.backyardMaintenanceFeeCents),
    advertisementFeeCents: optionalMoney(patch.advertisementFeeCents),
    agreedSpendingLimitCents: optionalMoney(patch.agreedSpendingLimitCents),
    notes: optionalPatchText(patch.notes),
  };
}

function normalizeLeasePatch(patch: Partial<CreateLeaseInput>): Partial<LeaseRecord> {
  return {
    propertyId: requiredPatchText(patch.propertyId, 'propertyId'),
    tenantName: requiredPatchText(patch.tenantName, 'tenantName'),
    startDate: requiredPatchText(patch.startDate, 'startDate'),
    endDate: requiredPatchText(patch.endDate, 'endDate'),
    rentFrequency: patch.rentFrequency,
    rentCents: patch.rentCents !== undefined ? requireMoney(patch.rentCents, 'rentCents') : undefined,
    bondCents: optionalMoney(patch.bondCents),
    existingTenantCreditCents: optionalMoney(patch.existingTenantCreditCents),
    tenantCount: optionalPositiveInteger(patch.tenantCount, 'tenantCount'),
    petsAllowed: patch.petsAllowed,
    petCount: optionalPositiveInteger(patch.petCount, 'petCount'),
    specialConditionNotes: optionalPatchText(patch.specialConditionNotes),
    actualMoveOutDate: optionalPatchText(patch.actualMoveOutDate),
    lettingFeeSelection: optionalPatchText(patch.lettingFeeSelection),
    status: patch.status,
  };
}

function optionalPatchText(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new TypeError('value must be a string');
  }

  const normalized = value.trim();
  return normalized || undefined;
}

function requiredPatchText(value: unknown, name: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return requireText(value, name);
}

function applyDefinedPatch<T extends object>(target: T, patch: Partial<T>): void {
  const targetRecord = target as Record<string, unknown>;

  for (const key of Object.keys(patch) as Array<keyof T>) {
    const value = patch[key];
    if (value !== undefined) {
      targetRecord[String(key)] = value;
    }
  }
}
