// Package imports
import { Routes, Route, Link } from 'react-router-dom'

// Modular tsx files
import Owners from './pages/owners'
import Dashboard from './pages/dashboard'
import Properties from './pages/properties'
import Leases from './pages/leases'

// CSS imports
import './app.css'

function App() {
  return (
    <>
      <div className="topnav-container">
        <nav className="topnav"> {/* Remove inline styling */}
          <Link className='toplink' to="/">Overview</Link>
          <Link className='toplink' to="/owners">Owners</Link>
          <Link className='toplink' to="/properties">Properties</Link>
          <Link className='toplink' to="/leases">Leases</Link>
        </nav>
      </div>


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

export default App
