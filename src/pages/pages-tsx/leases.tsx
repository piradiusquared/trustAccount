
import { Link, useNavigate } from "react-router"
import { LeaseRecord, CreateLeaseInput, EmptyLeaseForm, PropertyRecord } from "../../lib/datatypes"
import { useForm } from "../../services/utils"
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
                                <td className="content-table-td">{lease.tenantName}</td>
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
    const [propertyList, setProperties] = useState<PropertyRecord[]>([]);
    useEffect(() => {
        propertyService.getAllWithOwners().then(setProperties);
    })
    // const navigate = useNavigate();

    // async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    //     event.preventDefault();
        
    //     const payload: CreateLeaseInput = {   
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
                                    {property.reference} - {property.ownerId} For testing

                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        <span>Lease Term:</span>
                        <select name="leaseTerm">
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
                        <input type="date" name="startDate"></input>
                    </label>

                    <label>
                        <span>Lease End Date:</span>
                        <input type="date" name="endDate"></input>
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
                        <input name="existingTenantCreditCents"></input>
                    </label>

                    <br></br>

                    <label>
                        <span>No. of Tenants:</span>
                        <input name="tenantCount"></input>
                    </label>

                    <br></br>
                    <label> 
                        <span>Pets Allowed:</span>
                        <select name="petAllowed">
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </label>

                    <label>
                        <span>Pets Count:</span>
                        <input name="petCount"></input>
                    </label>

                    <label>
                        <span>Actual Move Out Date:</span>
                        <input type="date" name="actualMoveOutDate"></input>
                    </label>

                    <label>
                        <span>Notes:</span>
                        <input name="notes"></input>
                    </label>

                    <label>
                        <span>New Lease Letting Fee:</span>
                        <select name="lettingFee">
                            <option value="100">100%</option>
                            <option value="50">50%</option>
                            <option value="0">0%, Manual</option>
                        </select>
                    </label>
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