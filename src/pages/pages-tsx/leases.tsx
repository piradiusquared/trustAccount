
import { Link, useNavigate } from "react-router"
import { LeaseRecord, CreateLeaseInput, EmptyLeaseForm, PropertyRecord, EmptyTenantForm, CreateTenantInput } from "../../lib/datatypes"
import { useForm, useFormArray } from "../../services/utils"
import '../pages-css/form.css'
import { useEffect, useState, SubmitEvent } from "react"
import { propertyService } from "../../services/propertyService"
import { leaseService } from "../../services/leaseService"

export function Leases() {
    const [leases, setLeases] = useState<LeaseRecord[]>([]);
    useEffect(() => {
        leaseService.getActive().then(setLeases);
    })
    return (
        <div className="content-container">
            <header className="content-header">
                <h1>leases</h1>
                <Link to='/leases/new-lease'>New Lease</Link>

            </header>
            <div className="card-active">
                <h2>Active</h2>
                {/* Table. thead heading row, tbody actual content. */}
                <table className="content-table">
                    <thead>
                        <tr>
                            <th className="content-table-th">Property Ref</th>
                            <th className="content-table-th">Tenant</th>
                            <th className="content-table-th">Lease Start</th>
                            <th className="content-table-th">Lease End</th>
                            <th className="content-table-th">Rent (cents)</th>
                            <th className="content-table-th">Tenant Credits</th>
                            {/* TODO: contract and actions */}
                        </tr>
                    </thead>

                    <tbody>
                        {leases.map(lease => (
                            <tr key={lease.id}>
                                <td className="content-table-td">{lease.propertyRef}</td>
                                <td className="content-table-td">[PLACEHOLDER]</td>
                                <td className="content-table-td">{lease.startDate}</td>
                                <td className="content-table-td">{lease.endDate}</td>
                                <td className="content-table-td">{lease.rentCents}</td>
                                <td className="content-table-td">{lease.existingTenantCreditCents}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card-inactive">

            </div>
        </div>
    )
}

export function NewLease() {
    const { form, setForm, handleChange } = useForm(EmptyLeaseForm);
    const { formArr, setFormArr, addEntry, removeEntry, handleEntryChange } = useFormArray(EmptyTenantForm, 4); // hardcoded 4 tenant limit
    const [propertyList, setProperties] = useState<PropertyRecord[]>([]);
    useEffect(() => {
        propertyService.getAllWithOwners().then(setProperties);
    })

    // const navigate = useNavigate();

    // async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    //     event.preventDefault();
        
    //     const payload: CreateLeaseInput = {   
    //         propertyRef : form.propertyRef.trim(),
    //         leaseTerm : form.leaseTerm.trim(),
    //         tenantName : 
    //     }
    // }

    return (
        <div className="content-container">
            <header className="content-header">
                <h1>New Property</h1>
                <Link to='/leases'>Back</Link>
            </header>

            <form className="content-form">
                <div className="content-form-flex">
                    <label>
                        {/* TODO: Query from all existing owners and create dropdown */}
                        <span>Property:</span>
                        <select name="propertyRef" value={form.propertyRef} onChange={handleChange} required>
                            <option value="">-- Select a Property--</option>
                            {propertyList.map((property) => (
                                <option key={property.reference} value={property.reference}>
                                    {property.reference} - {(property as any).ownerName}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        <span>Lease Term:</span>
                        <select name="leaseTerm" onChange={handleChange} required>
                            <option value="26week">6 Months (26 weeks)</option>
                            <option value="52week">12 Months (52 weeks)</option>
                            <option value="78week">18 Months (78 weeks)</option>
                            <option value="104week">24 Months (104 weeks)</option>
                            <option value="156week">36 Months (156 weeks)</option>
                            <option value="periodic">No fixed term (periodic)</option>
                        </select>
                    </label>

                    <label>
                        <span>Lease Start Date:</span>
                        <input type="date" name="startDate" onChange={handleChange} required></input>
                    </label>

                    <label>
                        <span>Lease End Date:</span>
                        <input type="date" name="endDate" onChange={handleChange} required></input>
                    </label>

                    <label>
                        <span>Rental Price Per Week:</span>
                        <input name="rentCents" value={form.rentCents} onChange={handleChange} required></input>
                    </label>

                    <label>
                        <span>Bond Amount:</span>
                        <input name="bondCents" value={form.bondCents} onChange={handleChange} required></input>
                    </label>

                    <label>
                        <span>Existing Tenant Credit:</span>
                        <input name="existingTenantCreditCents" onChange={handleChange}></input>
                    </label>

                    <br></br>

                    <label>
                        <span>No. of Tenants:</span>
                        <input name="tenantCount" onChange={handleChange}></input>
                    </label>

                    <br></br>
                    <label> 
                        <span>Pets Allowed:</span>
                        <select name="petsAllowed" onChange={handleChange} required>
                            <option value={0}>No</option>
                            <option value={1}>Yes</option>
                        </select>
                    </label>

                    <label>
                        <span>Pets Count:</span>
                        <input name="petCount" onChange={handleChange} disabled={form.petsAllowed == 0}></input>
                    </label>

                    <label>
                        <span>Actual Move Out Date:</span>
                        <input type="date" name="actualMoveOutDate" onChange={handleChange}></input>
                    </label>

                    <label>
                        <span>Notes:</span>
                        <input name="notes" onChange={handleChange}></input>
                    </label>

                    <label>
                        <span>New Lease Letting Fee:</span>
                        <select name="lettingFee" onChange={handleChange}>
                            <option value="100">100%</option>
                            <option value="50">50%</option>
                            <option value="0">0%, Manual</option>
                        </select>
                    </label>

                    {/* Tenants section */}

                    <h2>Tenant Details</h2>
                    {formArr.map((tenant, index) => (
                        <div key={index}>
                            <div>
                                <h3>Tenant #{index + 1}</h3>
                                {formArr.length > 1 && (
                                    <button type="button" onClick={() => removeEntry(index)}>
                                        Remove Tenant
                                    </button>
                                )}
                            </div>

                            <div>
                                <label>
                                    <span>First Name:</span>
                                    <input type="text" 
                                        value={tenant.firstName}
                                        onChange={(e) => handleEntryChange(index, 'firstName', e.target.value)}
                                        required
                                    />
                                </label>

                                <label>
                                    <span>Surname:</span>
                                    <input type="text"
                                        value={tenant.lastName || ''}
                                        onChange={(e) => handleEntryChange(index, 'lastName', e.target.value)}
                                    />
                                </label>

                                <label>
                                    <span>Email:</span>
                                    <input type="text"
                                        value={tenant.email || ''}
                                        onChange={(e) => handleEntryChange(index, 'email', e.target.value)}
                                    />
                                </label>

                                <label>
                                    <span>Mobile:</span>
                                    <input type="text"
                                        value={tenant.mobile || ''}
                                        onChange={(e) => handleEntryChange(index, 'mobile', e.target.value)}
                                    />
                                </label>

                                <label>
                                    <span>Notes:</span>
                                    <input type="text"
                                        value={tenant.notes || ''}
                                        onChange={(e) => handleEntryChange(index, 'notes', e.target.value)}
                                    />
                                </label>
                            </div>
                        </div>
                    ))}

                    {/* Only show add if under tenant limit, make a constant later */}
                    {formArr.length < 4 && (
                        <button type="button" onClick={addEntry}>
                            + Add another Tenant
                        </button>
                    )}
                </div>

                <div className="content-form-actions">
                    <button type="submit" className="drop-right">
                        Create Lease
                    </button>
                </div>
            </form>
        </div>

    )
}