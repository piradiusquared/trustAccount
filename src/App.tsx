// Package imports
import { Routes, Route, Link } from 'react-router-dom'

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
    <div>
      <h1>Dashboard oh yeah</h1>
    </div>
  )
}

function Owners() {
  return (
    <div>
      <h1>Owners page and stuff</h1>
    </div>
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
