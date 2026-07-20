
import { Link, useNavigate } from "react-router"
import '../pages-css/form.css'
import { useEffect, useState, SubmitEvent } from "react"
import { OwnerRecord, PropertyRecord, EmptyPropertyForm, CreatePropertyInput } from "../../lib/datatypes"
import { propertyService } from "../../services/propertyService";
import { ownerService } from "../../services/ownerService";
import { formatPostalAddress, useForm } from "../../services/utils";

// TODO: create the state and forms


export function Properties() {
    const [properties, setProperties] = useState<PropertyRecord[]>([]);
    useEffect(() => {
        propertyService.getAllWithOwners().then(setProperties);
    })
    

    return (
        <section className="content-container">
            <header className="content-header">
                <h1>properties</h1>
                <Link to='/properties/new-property'>New Property</Link>
            </header>

            <div className="card-active">
                <h2>Active</h2>
                {/* Table. thead heading row, tbody actual content. */}
                <table className="content-table">
                    <thead>
                        <tr>
                            <th className="content-table-th">Reference</th>
                            <th className="content-table-th">Type</th>
                            <th className="content-table-th">Address</th>
                            <th className="content-table-th">Commission (%)</th>
                            <th className="content-table-th">Owner</th>
                            <th className="content-table-th">Contract</th>
                            {/* TODO: contract and actions */}
                        </tr>
                    </thead>

                    <tbody>
                        {
                        properties.map(property => (
                            <tr key={property.id}>
                                <td className="content-table-td">{property.reference}</td>
                                <td className="content-table-td">{property.propertyType}</td>
                                <td className="content-table-td">{property.address}</td>
                                <td className="content-table-td">{property.commissionRatePercent}</td>
                                <td className="content-table-td">{(property as any).ownerName}</td>
                            {/* currently casting as any to suppress warning. LATER: extend interface for each new created SQL variable*/}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card-inactive">

            </div>
        </section>

    )
}

export function NewProperty() {
    const { form, setForm, handleChange } = useForm(EmptyPropertyForm);
    const [ownerList, setOwners] = useState<OwnerRecord[]>([]);
    useEffect(() => {
        ownerService.getAll().then(setOwners);
    })

    const navigate = useNavigate();

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const combinedAddress = formatPostalAddress(form);
        let rentFreq = form.propertyType === "Warehouse" ? "monthly" : "weekly";

        const payload: CreatePropertyInput = {
            reference: form.reference.trim(),
            ownerId: form.ownerId.trim(),
            propertyType: form.propertyType.trim(),
            address: combinedAddress.trim(),
            isFurnished: form.isFurnished,
            rentFrequency: rentFreq,
            commissionRatePercent: form.commissionRatePercent,
            adminFeeCents: form.adminFeeCents,
            backyardMaintenanceFeeCents: form.backyardMaintenanceFeeCents ? form.backyardMaintenanceFeeCents : undefined,
            advertisementFeeCents: form.advertisementFeeCents ? form.advertisementFeeCents : undefined,
            agreedSpendingLimitCents: form.agreedSpendingLimitCents ? form.agreedSpendingLimitCents : undefined,
            notes: form.notes ? form.notes.trim() : undefined,
        }
        try {
            const newProperty = await propertyService.create(payload);
            console.log('[Frontend] Database write success: ', newProperty);

            // const testQuery = await propertyService.getAllWithOwners();
            // console.log('[Frontend] Current owners in database: ', testQuery);
            setForm(EmptyPropertyForm);
            navigate('/properties');
        } catch (error) {
            console.error('Failed to create new Property', error);
        }
        
    }

    return (
        <div className="content-container">
            <header className="content-header">
                <h1>New Property</h1>
                <Link to='/properties'>Back</Link>
            </header>

            <form className="content-form" onSubmit={handleSubmit}>
                <div className="content-form-flex">
                    <label>
                        <span>Property Reference:</span>
                        <input name="reference" placeholder="e.g. Room 6 - 7 John Street" onChange={handleChange} required></input>
                    </label>

                    <label>
                        {/* Use joins to identify required information from the user ID */}
                        <span>Owner:</span>
                        <select name="ownerId" value={form.ownerId} onChange={handleChange} required>
                            <option value="">-- Select an Owner --</option>
                            {ownerList.map((owner) => (
                                <option key={owner.id} value={owner.id}>
                                    {owner.title || ''} {owner.firstName} {owner.surname || ''}
                                </option>
                            ))}
                        </select>

                    </label>

                    <label>
                        <span>Property Type:</span>
                        <select name="propertyType" onChange={handleChange} required>
                            <option value="Townhouse">Townhouse</option>
                            <option value="Apartment">Apartment/Unit</option>
                            <option value="House">House</option>
                            <option value="Land">Land</option>
                            <option value="Warehouse">Warehouse</option>
                            {/* TODO: Can easily expand later */}
                        </select>
                    </label>

                    <label>
                        <span>Unit/Room:</span>
                        <input name="unitNumber" onChange={handleChange}></input>
                    </label>

                    <label>
                        <span>Street Number:</span>
                        <input name="streetNumber" onChange={handleChange} required></input>
                    </label>
                    
                    <label>
                        <span>Street Name:</span>
                        <input name="streetName" onChange={handleChange} required></input>
                    </label>

                    <label>
                        <span>Suburb:</span>
                        <input name="suburb" onChange={handleChange} required></input>
                    </label>

                    <label>
                        <span>Postcode:</span>
                        <input name="postcode" onChange={handleChange} required></input>
                    </label>

                    <label>
                        <span>State:</span>
                        <select name="state">
                            <option value="QLD">QLD</option>
                            <option value="NSW">NSW</option>
                            <option value="ACT">ACT</option>
                            <option value="VIC">VIC</option>
                            <option value="SA">SA</option>
                            <option value="TAS">TAS</option>
                            <option value="WA">WA</option>
                            <option value="NT">NT</option>
                        </select>
                    </label>

                    <label>
                        <span>Country:</span>
                        <input name="country" onChange={handleChange} required></input>
                    </label>

                    <label>
                        <span>Furnished:</span>
                        <select name="isFurnished">
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                        </select>
                    </label>

                    <label>
                        <span>Management Commission (%):</span>
                        <input name="commissionRatePercent" onChange={handleChange} required></input>
                    </label>

                    <label>
                        <span>Monthly Administration Fee (excl GST):</span>
                        <input name="adminFeeCents" onChange={handleChange} required></input>
                    </label>

                    <label>
                        <span>Monthly Backyard Maintenance Fee (excl GST):</span>
                        <input name="backyardMaintenanceFeeCents" onChange={handleChange} required></input>
                    </label>

                    <label>
                        <span>Advertisement and Promotion Fee (excl GST):</span>
                        <input name="advertisementFeeCents" onChange={handleChange} required></input>
                    </label>
                    
                    <label>
                        <span>Agreed Spending Limit:</span>
                        <input 
                        type="text" inputMode="numeric" pattern="\d*" 
                        name="agreedSpendingLimitCents" onChange={handleChange} required></input>
                    </label>

                    <label>
                        <span>Notes:</span>
                        <input name="notes" onChange={handleChange}></input>
                    </label>
                </div>

                <div className="content-form-actions">
                    <button type="submit" className="drop-right">
                        Create Property
                    </button>
                </div>
            </form>
        </div>

    )
}