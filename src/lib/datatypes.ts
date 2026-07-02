export type EntityId = string;
export type IsoDate = string;
export type MoneyCents = number;

export type LedgerTargetType = 'lease' | 'property' | 'owner';
export type LedgerKind = 'deposit' | 'payment' | 'expense' | 'withheld' | 'adjustment';
export type InvoiceStatus = 'unpaid' | 'paid' | 'reversed' | 'void';
export type LeaseStatus = 'active' | 'historic';
export type RentFrequency = 'weekly' | 'fortnightly' | 'monthly';


/*
Owner RECORD. Plus Owner fields for entry
*/
export interface OwnerRecord {
  id: EntityId;
  reference: string;
  title?: string;
  firstName: string;
  surname?: string;
  email?: string;
  mobile?: string;
  postalAddress?: string;
  accountName?: string;
  bsb?: string;
  accountNumber?: string;
  paymentRef?: string;
  notes?: string;
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

export interface CreateOwnerInput {
  reference: string;
  title?: string;
  firstName: string;
  surname?: string;
  email?: string;
  mobile?: string;
  postalAddress?: string;
  bankName?: string;
  accountName?: string;
  bsb?: string;
  accountNumber?: string;
  paymentRef?: string;
  notes?: string;
}

/*
Property RECORD. Plus Property entry

Depends on an Owner
*/
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
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: IsoDate;
  updatedAt: IsoDate;
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
  notes?: string;
}

/*
Lease RECORD. Plus Lease entry

Depends on Property and Owner
*/
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