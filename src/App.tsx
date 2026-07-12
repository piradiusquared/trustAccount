// Package imports
import { Routes, Route, Link } from 'react-router'

// Modular tsx files
import { Owners, NewOwner } from './pages/pages-tsx/owners'
import Dashboard from './pages/pages-tsx/dashboard'
import { Properties, NewProperty} from './pages/pages-tsx/properties'
import { Leases, NewLease } from './pages/pages-tsx/leases'

// CSS imports
import './app.css'

function App() {
  return (
    <>
      <nav className='topnav'> {/* Remove inline styling */}
        <Link className='toplink' to='/'>Overview</Link>
        <Link className='toplink' to='/owners'>Owners</Link>
        <Link className='toplink' to='/properties'>Properties</Link>
        <Link className='toplink' to='/leases'>Leases</Link>
      </nav>


      {/* Routing */}
      <Routes>
        {/* Actual routes */}
        {/* Root */}
        <Route path='/' element={<Dashboard />} />

        {/* Owners */}
        <Route path='/owners' element={<Owners />} />
        <Route path='/owners/new-owner' element={<NewOwner />} />

        {/* Properties */}
        <Route path='/properties' element={<Properties />} />
        <Route path='/properties/new-property' element={<NewProperty />} />

        {/* Leases */}
        <Route path='/leases' element={<Leases />} />
        <Route path='/leases/new-lease' element={<NewLease />} />

      </Routes>
    </>
  )
}

export default App