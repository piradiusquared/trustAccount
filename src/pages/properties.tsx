
import { useAppSelector } from '../core/hooks';

export default function Properties() {
    const properties = useAppSelector(state => state.properties);

    return (
        <>
            <div className="content-container">
                <h1>properties</h1>
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
                            {properties.map(owner => (
                                <tr key={owner.id}>
                                    <td>{owner.reference}</td>
                                    <td>{owner.propertyType}</td>
                                    <td>{owner.address}</td>
                                    <td>{owner.rentCents}</td>
                                    <td>{owner.commissionRatePercent}</td>
                                    <td>{owner.ownerId}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card-inactive">

                </div>
            </div>

        </>
    )
}