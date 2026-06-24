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
    postalAddress: string;
};

const emptyForm: OwnerFormState = {
    reference: '',
    title: '',
    firstName: '',
    surname: '',
    email: '',
    mobile: '',
    postalAddress: '',
};

export default function Owners() {
    const owners = useAppSelector(state => state.owners);
    const [form, setForm] = useState<OwnerFormState>(emptyForm);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        service.createOwner({
            reference: form.reference,
            title: form.title,
            firstName: form.firstName,
            surname: form.surname,
            email: form.email,
            mobile: form.mobile,
            postalAddress: form.postalAddress,
        });

        setForm(emptyForm);
    }

    return (
    <div className='owners-container'>

        <header className='owners-header'>
            <h1>Owners</h1>
        </header>

        <form className="owners-form" onSubmit={handleSubmit}>
            <div className="owners-form-grid">
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

                <label className="owners-form-span-2">
                    <span>Postal Address</span>
                    <input name="postalAddress" value={form.postalAddress} onChange={handleChange} placeholder="123 Example St, Brisbane" />
                </label>
            </div>

            <div className="owners-form-actions">
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
