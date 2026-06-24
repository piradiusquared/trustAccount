// Package imports
import { Routes, Route, Link } from 'react-router-dom'
import { useAppSelector } from './core/hooks'
import { service } from './core/services'

// CSS imports
import './app.css'

function App() {
  return (
    <>
      <nav id="topnav"> {/* Remove inline styling */}
        <Link className='toplink' to="/">Overview</Link>
        <Link className='toplink' to="/owners">Owners</Link>
        <Link className='toplink' to="/properties">Properties</Link>
        <Link className='toplink' to="/leases">Leases</Link>
      </nav>

      {/* Routing */}
      <Routes>
        {/* Actual routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/owners" element={<Owners />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/leases" element={<Leases />} />
      </Routes>
    </>
  )
}

// Routing Functions
function Dashboard() {
  return (
      <h1>Dashboard oh yeah</h1>
  )
}

function Owners() {
  // Testing
  const owners = useAppSelector(state => state.owners);
  function addGandalfOwner() {
    service.createOwner({
      reference: 'own1',
      firstName: 'Gandalf',
      surname: 'The Grey',
      email: 'you.shall.not.pass@middleearth.com'
    });
  }
  
  return (
    <>
      <h1>Owners page and stuff</h1>
      {/* Testing owners */}
      <button onClick={addGandalfOwner}>
        Add Gandalf
      </button>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {owners.map((o) => (
            <tr key={o.id}>
              <td>{o.firstName} {o.surname}</td>
              <td>{o.email}</td>
            </tr>
          ))}
        </tbody>
      </table>  
    
    </>
  )
}

function Properties() {
  return (
    <h1>properties</h1>
  )
}

function Leases() {
  return (
    <h1>leases</h1>
  )
}

export default App
