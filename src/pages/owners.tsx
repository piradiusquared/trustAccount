import { useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import { useAppSelector } from '../core/hooks';
import { service } from '../core/services';

import '../pages/owners.css'

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
};

const emptyForm: OwnerFormState = {
    reference: '',
    title: '',
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
};

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

export default function Owners() {
    const owners = useAppSelector(state => state.owners);
    const [form, setForm] = useState<OwnerFormState>(emptyForm);

    function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const target = event.target as HTMLInputElement | HTMLSelectElement;
        const { name, value } = target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const combinedAddress = formatPostalAddress(form);

        service.createOwner({
            reference: form.reference,
            title: form.title,
            firstName: form.firstName,
            surname: form.surname,
            email: form.email,
            mobile: form.mobile,
            postalAddress: combinedAddress,
        });

        setForm(emptyForm);
    }

    return (
    <div className='owners-container'>

        <header className='owners-header'>
            <h1>Owners</h1>
        </header>

        <form className="owners-form" onSubmit={handleSubmit}>
            <div className="owners-form-flex">
                <label>
                    <span>Reference</span>
                    <input name="reference" value={form.reference} onChange={handleChange} placeholder="OWN001" required />
                </label>

                <label>
                    <span>Title</span>
                    <input name="title" value={form.title} onChange={handleChange} placeholder="Mr, Mrs, Dr" />
                </label>

                <label>
                    <span>First Name</span>
                    <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Jane" required />
                </label>

                <label>
                    <span>Surname</span>
                    <input name="surname" value={form.surname} onChange={handleChange} placeholder="Doe" />
                </label>

                <label>
                    <span>Email</span>
                    <input name="email" value={form.email} onChange={handleChange} placeholder="jane@example.com" type="email" />
                </label>

                <label>
                    <span>Mobile</span>
                    <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="0400 000 000" />
                </label>

                {/* Country Selector */}
                <label>
                    <span>Country:</span>
                    <select name="country" value={form.country} onChange={handleChange}>
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
                        value={form.overseasAddress} 
                        onChange={handleChange} 
                        disabled={form.country === 'Australia'} 
                        placeholder="Enter overseas address"
                    />
                </label>

                {/* Unit Number (Disabled if Country is NOT Australia) */}
                <label>
                    <span>Unit Number:</span>
                    <input 
                        name="unitNumber" 
                        value={form.unitNumber} 
                        onChange={handleChange} 
                        disabled={form.country !== 'Australia'}
                    />
                </label>

                {/* Street Number */}
                <label>
                    <span>Street Number:</span>
                    <input 
                        name="streetNumber" 
                        value={form.streetNumber} 
                        onChange={handleChange} 
                        disabled={form.country !== 'Australia'}
                    />
                </label>

                {/* Street Name / PO Box */}
                <label>
                    <span>Street Name / PO Box:</span>
                    <input 
                        name="streetName" 
                        value={form.streetName} 
                        onChange={handleChange} 
                        disabled={form.country !== 'Australia'} 
                    />
                </label>

                {/* Suburb */}
                <label>
                    <span>Suburb:</span>
                    <input 
                        name="suburb" 
                        value={form.suburb} 
                        onChange={handleChange} 
                        disabled={form.country !== 'Australia'} 
                    />
                </label>

                {/* State */}
                <label>
                    <span>State:</span>
                    <input 
                        name="state" 
                        value={form.state} 
                        onChange={handleChange} 
                        disabled={form.country !== 'Australia'} 
                    />
                </label>

                {/* Postcode */}
                <label>
                    <span>Postcode:</span>
                    <input 
                        name="postcode" 
                        value={form.postcode} 
                        onChange={handleChange} 
                        disabled={form.country !== 'Australia'} 
                    />
                </label>
            </div>

            <div className="owners-form-actions drop-right">
                <button type="submit">
                    Create Owner
                </button>
            </div>
        </form>
        
        <div className="card-active">
            <h2>Active</h2>
            {/* Table. thead heading row, tbody actual content. */}
            <table>
                <thead>
                    <tr>
                        <th>Reference</th>
                        <th>Title</th>
                        <th>First Name</th>
                        <th>Surname</th>
                        <th>Email</th>
                        <th>Mobile Number</th>
                        <th>Postal Address</th>
                        {/* TODO: actions */}
                    </tr>
                </thead>

                <tbody>
                    {owners.map(owner => (
                        <tr key={owner.id}>
                            <td>{owner.reference}</td>
                            <td>{owner.title}</td>
                            <td>{owner.firstName}</td>
                            <td>{owner.surname}</td>
                            <td>{owner.email}</td>
                            <td>{owner.mobile}</td>
                            <td>{owner.postalAddress}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="card-inactive">

        </div>



    </div>
    );
}
