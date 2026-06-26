export type EntityId = string;
export type IsoDate = string;
export type MoneyCents = number;

export type LedgerTargetType = 'lease' | 'property' | 'owner';
export type LedgerKind = 'deposit' | 'payment' | 'expense' | 'withheld' | 'adjustment';
export type InvoiceStatus = 'unpaid' | 'paid' | 'reversed' | 'void';
export type LeaseStatus = 'active' | 'historic';
export type RentFrequency = 'weekly' | 'fortnightly' | 'monthly';

export interface OwnerRecord {
  id: EntityId;
  reference: string;
  title?: string;
  firstName: string;
  surname?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  postalAddress?: string;
  bankName?: string;
  accountName?: string;
  bsb?: string;
  accountNumber?: string;
  paymentReference?: string;
  notes?: string;
  driveFolderLink?: string;
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

export interface PropertyRecord {
  id: EntityId;
  reference: string;
  ownerId: EntityId;
  propertyType: string;
  address: string;
  rentFrequency: RentFrequency;
  rentCents: MoneyCents;
  commissionRatePercent: number;
  adminFeeCents: MoneyCents;
  backyardMaintenanceFeeCents?: MoneyCents;
  advertisementFeeCents?: MoneyCents;
  agreedSpendingLimitCents?: MoneyCents;
  wifiSsid?: string;
  wifiPassword?: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

export interface LeaseRecord {
  id: EntityId;
  propertyId: EntityId;
  tenantName: string;
  startDate: IsoDate;
  endDate: IsoDate;
  rentFrequency: RentFrequency;
  rentCents: MoneyCents;
  bondCents?: MoneyCents;
  existingTenantCreditCents?: MoneyCents;
  tenantCount?: number;
  petsAllowed?: boolean;
  petCount?: number;
  specialConditionNotes?: string;
  actualMoveOutDate?: IsoDate;
  lettingFeeSelection?: string;
  status: LeaseStatus;
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

export interface LedgerEntryRecord {
  id: EntityId;
  targetType: LedgerTargetType;
  targetId: EntityId;
  kind: LedgerKind;
  amountCents: MoneyCents;
  deltaCents: MoneyCents;
  occurredOn: IsoDate;
  note?: string;
  createdAt: IsoDate;
}

export interface InvoiceRecord {
  id: EntityId;
  issueTo: string;
  auditNo: string;
  category: string;
  description: string;
  invoiceDate: IsoDate;
  dueDate: IsoDate;
  amountCents: MoneyCents;
  paymentDate?: IsoDate;
  reversalDate?: IsoDate;
  voidDate?: IsoDate;
  status: InvoiceStatus;
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

export interface AppState {
  owners: OwnerRecord[];
  properties: PropertyRecord[];
  leases: LeaseRecord[];
  ledgerEntries: LedgerEntryRecord[];
  invoices: InvoiceRecord[];
}

export interface CreateOwnerInput {
  reference: string;
  title?: string;
  firstName: string;
  surname?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  postalAddress?: string;
  bankName?: string;
  accountName?: string;
  bsb?: string;
  accountNumber?: string;
  paymentReference?: string;
  notes?: string;
  driveFolderLink?: string;
}

export interface CreatePropertyInput {
  reference: string;
  ownerId: EntityId;
  propertyType: string;
  address: string;
  rentFrequency: RentFrequency;
  rentCents: MoneyCents;
  commissionRatePercent: number;
  adminFeeCents: MoneyCents;
  backyardMaintenanceFeeCents?: MoneyCents;
  advertisementFeeCents?: MoneyCents;
  agreedSpendingLimitCents?: MoneyCents;
  wifiSsid?: string;
  wifiPassword?: string;
  notes?: string;
}

export interface CreateLeaseInput {
  propertyId: EntityId;
  tenantName: string;
  startDate: IsoDate;
  endDate: IsoDate;
  rentFrequency: RentFrequency;
  rentCents: MoneyCents;
  bondCents?: MoneyCents;
  existingTenantCreditCents?: MoneyCents;
  tenantCount?: number;
  petsAllowed?: boolean;
  petCount?: number;
  specialConditionNotes?: string;
  actualMoveOutDate?: IsoDate;
  lettingFeeSelection?: string;
  status?: LeaseStatus;
}

export interface CreateLedgerEntryInput {
  targetType: LedgerTargetType;
  targetId: EntityId;
  kind: LedgerKind;
  amountCents: MoneyCents;
  occurredOn: IsoDate;
  note?: string;
}

export interface CreateInvoiceInput {
  issueTo: string;
  auditNo: string;
  category: string;
  description: string;
  invoiceDate: IsoDate;
  dueDate: IsoDate;
  amountCents: MoneyCents;
}

