export interface OwnerFormState {
    reference: string;
    title: string;
    firstName: string;
    surname?: string;
    email: string;
    mobile: string;

    // Detailed address
    country: string;
    overseasAddress: string;
    unitNumber: string;
    streetNumber: string;
    streetName: string;
    suburb: string;
    state: string;
    postcode: string;

    // Banking
    accountName: string,
    bsb: string,
    accountNumber: string,
    paymentRef: string,

    // Notes
    ownerNotes: string
};