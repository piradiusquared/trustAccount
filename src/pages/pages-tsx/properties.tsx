
import { Link } from "react-router"
import '../pages-css/form.css'
import { useEffect, useState } from "react"
import { PropertyRecord } from "../../lib/datatypes"
import { propertyService } from "../../services/propertyService";


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
                            <th className="content-table-th">Rent</th>
                            <th className="content-table-th">Commission (%)</th>
                            <th className="content-table-th">Owner</th>
                            <th className="content-table-th">Contract</th>
                            {/* TODO: contract and actions */}
                        </tr>
                    </thead>

                    <tbody>
                        {properties.map(property => (
                            <tr key={property.id}>
                                <td>{property.reference}</td>
                                <td>{property.propertyType}</td>
                                <td>{property.address}</td>
                                <td>{property.rentCents}</td>
                                <td>{property.commissionRatePercent}</td>
                                <td>{property.ownerId}</td>
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
    return (
        <div className="content-container">
            <header className="content-header">
                <h1>New Property</h1>
                <Link to='/properties'>Back</Link>
            </header>

            <form className="content-form">
                <div className="content-form-flex">
                    <label>
                        <span>Property Reference:</span>
                        <input name="reference" placeholder="e.g. Room 6 - 7 John Street"></input>
                    </label>

                    <label>
                        {/* TODO: Query from all existing owners and create dropdown */}
                        <span>Owner: [INCOMPLETE]</span>
                    </label>

                    <label>
                        <span>Property Type:</span>
                        <select name="property-type">
                            <option value="Townhouse">Townhouse</option>
                            <option value="ApartmentUnit">Apartment/Unit</option>
                            <option value="House">House</option>
                            <option value="Land">Land</option>
                            {/* TODO: Can easily expand later */}
                        </select>
                    </label>

                    <label>
                        <span>Room Number:</span>
                        <input name="room-num"></input>
                    </label>

                    <label>
                        <span>Unit:</span>
                        <input name="unit"></input>
                    </label>

                    <label>
                        <span>Street Number:</span>
                        <input name="street-num"></input>
                    </label>

                    <label>
                        <span>Suburb:</span>
                        <input name="suburb"></input>
                    </label>

                    <label>
                        <span>Postcode:</span>
                        <input name="postcode"></input>
                    </label>

                    <label>
                        <span>State:</span>
                        <select name="state">
                            <option value="qld">QLD</option>
                            <option value="nsw">NSW</option>
                            <option value="act">ACT</option>
                            <option value="vic">VIC</option>
                            <option value="sa">SA</option>
                            <option value="tas">TAS</option>
                            <option value="wa">WA</option>
                            <option value="nt">NT</option>
                        </select>
                    </label>

                    <label>
                        <span>Country:</span>
                        <input name="country"></input>
                    </label>

                    <label>
                        <span>Furnished:</span>
                        <select name="furnished">
                            <option value="furnished-y">Yes</option>
                            <option value="furnished-n">No</option>
                        </select>
                    </label>

                    <label>
                        <span>Owner Suggested Rental Price:</span>
                        <input name="suggest-rent"></input>
                    </label>

                    <label>
                        <span>Management Commission (%):</span>
                        <input name="management-commission"></input>
                    </label>

                    <label>
                        <span>Monthly Administration Fee (excl GST):</span>
                        <input name="month-admin-fee"></input>
                    </label>

                    <label>
                        <span>Monthly Backyard Maintenance Fee (excl GST):</span>
                        <input name="month-backyard-fee"></input>
                    </label>

                    <label>
                        <span>Advertisement and Promotion Fee (excl GST):</span>
                        <input name="ad-promo-fee"></input>
                    </label>

                    <label>
                        <span>Notes:</span>
                        <input name="notes"></input>
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