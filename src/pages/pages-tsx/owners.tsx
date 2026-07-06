
import { Link, useNavigate } from 'react-router'
import { CreateOwnerInput, OwnerRecord } from '../../lib/datatypes';
import { useState, ChangeEvent, SubmitEvent, useEffect } from 'react';

import '../pages-css/form.css'
import { ownerService } from '../../services/ownerService';

type OwnerFormState = {
    reference: string;
    title: string;
    firstName: string;
    surname: string;
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
    bankName?: string,
    accountName: string,
    bsb: string,
    accountNumber: string,
    paymentRef: string,

    // Notes
    notes?: string
};

const emptyForm: OwnerFormState = {
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

export function Owners() {
    const [owners, setOwners] = useState<OwnerRecord[]>([]);
    useEffect(() => {
        ownerService.getAll().then(setOwners);
    })

    return (
        <section className='content-container'>
            <header className='content-header'>
                <h1>Owners</h1>
                <Link to='/owners/new-owner'>New Owner</Link>
            </header>

            {/* query active */}
            <div className="card-active">
                <h2>Active</h2>
                {/* Table. thead heading row, tbody actual content. */}
                <table className='content-table'>
                    <thead>
                        <tr>
                            <th className='content-table-th'>Reference</th>
                            <th className='content-table-th'>Title</th>
                            <th className='content-table-th'>First Name</th>
                            <th className='content-table-th'>Surname</th>
                            <th className='content-table-th'>Email</th>
                            <th className='content-table-th'>Mobile Number</th>
                            <th className='content-table-th'>Postal Address</th>
                            {/* TODO: actions */}
                        </tr>
                    </thead>

                    <tbody>
                        {owners.map(owner => {
                            return (
                                <tr key={owner.id}>
                                    <td>{owner.reference}</td>
                                    <td>{owner.title}</td>
                                    <td>{owner.firstName}</td>
                                    <td>{owner.surname}</td>
                                    <td>{owner.email}</td>
                                    <td>{owner.mobile}</td>
                                    <td>{owner.postalAddress}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            
            {/* query inactive */}
            <div className="card-inactive">

            </div>
        </section>
    );
}


// Combine into a single postal address
function formatPostalAddress(form: OwnerFormState): string {
    if (form.country !== "Australia") {
        return `${form.overseasAddress}, ${form.country}`;
    }

    // For Australian addresses, build the string step-by-step
    const unit = form.unitNumber ? `Unit ${form.unitNumber}, ` : '';
    const street = `${form.streetNumber} ${form.streetName}`.trim();
    const location = `${form.suburb} ${form.state} ${form.postcode}`.trim();

    // Combine them, filtering out any empty parts
    return [unit + street, location, form.country]
        .filter(part => part.trim() !== '')
        .join(', ');
}


export function NewOwner() {
    const [form, setForm] = useState<OwnerFormState>(emptyForm);
    const navigate = useNavigate();


    function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const target = event.target as HTMLInputElement | HTMLSelectElement;
        const { name, value } = target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const combinedAddress = formatPostalAddress(form);
        const payload: CreateOwnerInput = {
            reference: form.reference.trim(),
            title: form.title === '-' ? undefined : form.title,
            firstName: form.firstName.trim(),
            surname: form.surname ? form.surname.trim() : undefined,
            email: form.email ? form.email.trim() : undefined,
            mobile: form.mobile ? form.mobile.trim() : undefined,
            postalAddress: combinedAddress || undefined,
            accountName: form.accountName ? form.accountName.trim() : undefined,
            bankName: form.bankName ? form.bankName.trim() : undefined,
            bsb: form.bsb ? form.bsb.trim() : undefined,
            accountNumber: form.accountNumber ? form.accountNumber.trim() : undefined,
            paymentRef: form.paymentRef ? form.paymentRef.trim() : undefined,
            notes: form.notes ? form.notes.trim() : undefined,
        }
        try {
            const newOwner = await ownerService.create(payload);
            console.log('[Frontend] Database write success: ', newOwner);

            const testQuery = await ownerService.getAll();
            console.log('[Frontend] Current owners in database: ', testQuery);
            setForm(emptyForm);
            navigate('/owners');
        } catch (error) {
            console.error('Failed to create new Owner', error);
        }
    }

    return (
        <div className="content-container">
            <div className="content-header">
                <h1> New Owner</h1>
                <Link to='/owners'>Back</Link>
            </div>

            <form className="content-form" onSubmit={handleSubmit}>
                <div className="content-form-flex">
                    <label>
                        <span>Reference:</span>
                        <input name="reference" onChange={handleChange} placeholder="OWN001" />
                    </label>

                    <label>
                        <span>Title:</span>
                        <select name="title" onChange={handleChange}>
                            <option value="-">-</option>
                            <option value="Mr.">Mr.</option>
                            <option value="Mrs.">Mrs.</option>
                            <option value="Ms.">Ms.</option>
                            <option value="Miss.">Miss.</option>
                            <option value="Dr.">Dr.</option>
                        </select>
                    </label>

                    <label>
                        <span>First Name:</span>
                        <input name="firstName" onChange={handleChange} placeholder="Jane" required />
                    </label>

                    <label>
                        <span>Surname:</span>
                        <input name="surname" onChange={handleChange} placeholder="Doe" />
                    </label>

                    <label>
                        <span>Email:</span>
                        <input name="email" onChange={handleChange} placeholder="jane@example.com" type="email" required />
                    </label>

                    <label>
                        <span>Mobile:</span>
                        <input name="mobile" onChange={handleChange} placeholder="0400 000 000" required />
                    </label>

                    {/* Country Selector */}
                    <label>
                        <span>Country:</span>
                        <select name="country" onChange={handleChange} >
                            <option value="Australia">Australia</option>
                            <option value="New Zealand">New Zealand</option>
                            <option value="United Kingdom">United Kingdom</option>
                            {/* ...other countries */}
                        </select>
                    </label>

                    {/* Overseas Address (Disabled if Country is Australia) */}
                    <label>
                        <span>Overseas Address:</span>
                        <input
                            name="overseasAddress"
                            disabled={form.country === 'Australia'}
                            onChange={handleChange} placeholder="Enter overseas address"
                        />
                    </label>

                    {/* Unit Number (Disabled if Country is NOT Australia) */}
                    <label>
                        <span>Unit Number:</span>
                        <input
                            name="unitNumber"
                            onChange={handleChange}
                            disabled={form.country !== 'Australia'}
                        />
                    </label>

                    {/* Street Number */}
                    <label>
                        <span>Street Number:</span>
                        <input
                            name="streetNumber"
                            onChange={handleChange}
                            disabled={form.country !== 'Australia'}
                        />
                    </label>

                    {/* Street Name / PO Box */}
                    <label>
                        <span>Street Name / PO Box:</span>
                        <input
                            name="streetName"
                            onChange={handleChange}
                            disabled={form.country !== 'Australia'}
                        />
                    </label>

                    {/* Suburb */}
                    <label>
                        <span>Suburb:</span>
                        <input
                            name="suburb"
                            onChange={handleChange}
                            disabled={form.country !== 'Australia'}
                        />
                    </label>

                    {/* State */}
                    <label>
                        <span>State:</span>
                        <input
                            name="state"
                            onChange={handleChange}
                            disabled={form.country !== 'Australia'}
                        />
                    </label>

                    {/* Postcode */}
                    <label>
                        <span>Postcode:</span>
                        <input
                            name="postcode"
                            onChange={handleChange}
                            disabled={form.country !== 'Australia'}
                        />
                    </label>
                </div>

                <div className="content-form-actions">
                    <button type="submit" className='drop-right'>
                        Create Owner
                    </button>
                </div>
            </form>
        </div>

    )
}