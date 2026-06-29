
import { Link } from "react-router-dom"
import '../pages-css/form.css'

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

                </div>

                <div className="content-form-actions">

                </div>
            </form>
        </div>

    )
}