
import { Link } from "react-router-dom"
import '../pages-css/form.css'

export function Properties() {

    return (
        <section className="content-container">
            <header className="content-header">
                <h1>properties</h1>
                <Link to='/properties/new-property'>New Property</Link>
            </header>

            <div className="card-active">
                <h2>Active</h2>
                {/* Table. thead heading row, tbody actual content. */}
                <table>
                    <thead>
                        <tr>
                            <th>Reference</th>
                            <th>Type</th>
                            <th>Address</th>
                            <th>Rent</th>
                            <th>Commission (%)</th>
                            <th>Owner</th>
                            <th>Contract</th>
                            {/* TODO: contract and actions */}
                        </tr>
                    </thead>

                    <tbody>
                        {/* {properties.map(owner => (
                            <tr key={owner.id}>
                                <td>{owner.reference}</td>
                                <td>{owner.propertyType}</td>
                                <td>{owner.address}</td>
                                <td>{owner.rentCents}</td>
                                <td>{owner.commissionRatePercent}</td>
                                <td>{owner.ownerId}</td>
                            </tr>
                        ))} */}
                    </tbody>
                </table>
            </div>

            <div className="card-inactive">

            </div>
        </section>

    )
}

export function NewProperty() {
    return (
        <div className="content-container">
            <header className="content-header">
                <h1>New Property</h1>
                <Link to='/properties'>Back</Link>
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