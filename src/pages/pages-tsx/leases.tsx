
import { Link } from "react-router"
import '../pages-css/form.css'

type LeaseFormState = {

};

const emptyForm: LeaseFormState = {

};

export function Leases() {

    return (
        <div className="content-container">
            <header className="content-header">
                <h1>leases</h1>
                <Link to='/leases/new-lease'>New Lease</Link>

            </header>
            <div className="card-active">
                <h2>Active</h2>
                {/* Table. thead heading row, tbody actual content. */}
                <table>
                    <thead>
                        <tr>
                            <th>Property Ref</th>
                            <th>Tenant</th>
                            <th>Lease Start</th>
                            <th>Lease End</th>
                            <th>Rent (cents)</th>
                            <th>Tenant Credits</th>
                            {/* TODO: contract and actions */}
                        </tr>
                    </thead>

                    <tbody>
                        {/* {leases.map(lease => (
                            <tr key={lease.id}>
                                <td>{lease.propertyId}</td>
                                <td>{lease.tenantName}</td>
                                <td>{lease.startDate}</td>
                                <td>{lease.endDate}</td>
                                <td>{lease.rentCents}</td>
                                <td>{lease.existingTenantCreditCents}</td>
                            </tr>
                        ))} */}
                    </tbody>
                </table>
            </div>

            <div className="card-inactive">

            </div>
        </div>
    )
}

export function NewLease() {
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
                        <span>Property: [INCOMPLETE]</span>
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
                        <input type="date" name="leaseStart"></input>
                    </label>

                    <label>
                        <span>Lease End Date:</span>
                        <input type="date" name="leaseEnd"></input>
                    </label>

                    <label>
                        <span>Rental Price Per Week:</span>
                        <input name="rentWeekly"></input>
                    </label>

                    <label>
                        <span>Owner Suggested Rental Price: [INCOMPLETE, query from db]</span>
                    </label>

                    <label>
                        <span>Bond Amount: [SHOULD AUTOFILL]</span>
                        <input name="leaseBond"></input>
                    </label>

                    <label>
                        <span>Existing Tenant Credit:</span>
                        <input name="tenantCredit"></input>
                    </label>

                    <br></br>

                    <label>
                        <span>No. of Tenants:</span>
                        <input name="tenantCount"></input>
                    </label>

                    <label>
                        <span>Notes:</span>
                        <input name="notes"></input>
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