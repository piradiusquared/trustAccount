import { useAppSelector } from '../core/hooks';
import { service } from '../core/services';

export default function Owners() {
  const owners = useAppSelector(state => state.owners);

  function handleCreate() {
    service.createOwner({
      reference: 'OWN001',
      firstName: 'Gandalf',
      surname: 'The Grey',
    });
  }

  return (
    <div>
      <h1>Owners</h1>

      <button onClick={handleCreate}>
        Add Owner
      </button>

      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>

        <tbody>
          {owners.map(owner => (
            <tr key={owner.id}>
              <td>{owner.reference}</td>
              <td>
                {owner.firstName} {owner.surname}
              </td>
              <td>{owner.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}