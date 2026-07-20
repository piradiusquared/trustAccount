export type EntityId = string;
export type IsoDate = string;
export type MoneyCents = number;

export type LedgerTargetType = 'lease' | 'property' | 'owner';
export type LedgerKind = 'deposit' | 'payment' | 'expense' | 'withheld' | 'adjustment';
export type InvoiceStatus = 'unpaid' | 'paid' | 'reversed' | 'void';
export type RecordStatus = 'active' | 'inactive';

interface DetailedAddress {
    // Detailed address
    country: string;
    overseasAddress: string;
    unitNumber: string;
    streetNumber: string;
    streetName: string;
    suburb: string;
    state: string;
    postcode: string;
}

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
    bankName?: string;
    accountName?: string;
    bsb?: string;
    accountNumber?: string;
    paymentRef?: string;
    notes?: string;
    status?: RecordStatus;
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

export interface OwnerFormState extends DetailedAddress {
    reference: string;
    title: string;
    firstName: string;
    surname: string;
    email: string;
    mobile: string;

    // Banking
    bankName?: string,
    accountName: string,
    bsb: string,
    accountNumber: string,
    paymentRef: string,

    // Notes
    notes?: string
};

export const EmptyOwnerForm: OwnerFormState = {
    reference: '',
    title: '-',
    firstName: '',
    surname: '',
    email: '',
    mobile: '',

    country: 'Australia',
    overseasAddress: '',
    unitNumber: '',
    streetNumber: '',
    streetName: '',
    suburb: '',
    state: '',
    postcode: '',

    // Banking
    bankName: '',
    accountName: '',
    bsb: '',
    accountNumber: '',
    paymentRef: '',

    notes: ''
};

/*
Property RECORD. Plus Property entry

Depends on an Owner
*/
export interface PropertyRecord {
    id: EntityId;
    reference: string;
    ownerId: EntityId;
    propertyType: string;
    rentFrequency: string;

    address: string;

    isFurnished: string;
    commissionRatePercent: number;
    adminFeeCents: MoneyCents;
    backyardMaintenanceFeeCents?: MoneyCents;
    advertisementFeeCents?: MoneyCents;
    agreedSpendingLimitCents?: MoneyCents;
    notes?: string;

    status: RecordStatus;
    createdAt: IsoDate;
    updatedAt: IsoDate;
}

export interface CreatePropertyInput {
    reference: string;
    ownerId: string;
    propertyType: string;
    address: string;
    isFurnished: string;
    rentFrequency: string;
    commissionRatePercent: number;
    adminFeeCents: number;
    backyardMaintenanceFeeCents?: number;
    advertisementFeeCents?: number;
    agreedSpendingLimitCents?: number;
    notes?: string;
}

export interface PropertyFormState extends DetailedAddress {
    reference: string;
    ownerId: string;
    propertyType: string;

    isFurnished: string;
    rentFrequency: string; // derived from property type use switch statement
    commissionRatePercent: number;
    adminFeeCents: number;
    backyardMaintenanceFeeCents?: number;
    advertisementFeeCents?: number;
    agreedSpendingLimitCents?: number;
    notes?: string;
};

export const EmptyPropertyForm: PropertyFormState = {
    reference: '',
    ownerId: '',
    propertyType: 'Townhouse',

    overseasAddress: '', // unused
    unitNumber: '',
    streetNumber: '',
    streetName: '',
    suburb: '',
    state: '',
    postcode: '',
    country: '',

    isFurnished: 'false',
    rentFrequency: '',
    commissionRatePercent: 0,
    adminFeeCents: 0,
    backyardMaintenanceFeeCents: 0,
    advertisementFeeCents: 0,
    agreedSpendingLimitCents: 0,

    notes: ''
};


/*
Lease RECORD. Plus Lease entry

Depends on Property and Owner
*/
export interface LeaseRecord {
    id: EntityId;
    propertyRef: EntityId;
    leaseTerm: string;
    tenantName: string;
    startDate: IsoDate;
    endDate: IsoDate;
    rentFrequency: string;
    rentCents: MoneyCents;
    bondCents?: MoneyCents;
    existingTenantCreditCents?: MoneyCents;
    tenantCount?: number;
    petsAllowed?: number;
    petCount?: number;
    notes?: string;
    actualMoveOutDate?: IsoDate;
    lettingFee?: string;
    status: RecordStatus;
    createdAt: IsoDate;
    updatedAt: IsoDate;
}


export interface CreateLeaseInput {
    // Note: status will automatically be set to "active" for a new lease
    propertyRef: string;
    leaseTerm: string;
    tenantName: string;
    startDate: string;
    endDate: string;
    rentFrequency: string;
    rentCents: number;
    bondCents?: number;
    existingTenantCreditCents?: number;
    tenantCount?: number;
    petsAllowed?: number;
    petCount?: number;
    notes?: string;
    actualMoveOutDate?: string;
    lettingFee?: string;
}

export const EmptyLeaseForm: CreateLeaseInput = {
    propertyRef: '',
    leaseTerm: '',
    tenantName: '',
    startDate: '',
    endDate: '',
    rentFrequency: '',
    rentCents: 0,
    bondCents: 0,
    existingTenantCreditCents: 0,
    tenantCount: 0,
    petsAllowed: 1,
    petCount: 0,
    notes: '',
    actualMoveOutDate: '',
    lettingFee: ''
}

export interface CreateTenantInput {
    firstName: string;
    lastName?: string;
    email?: string;
    mobile?: string;
    notes?: string;
}