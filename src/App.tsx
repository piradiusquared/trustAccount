// Package imports
import { Routes, Route, Link } from 'react-router-dom'

// CSS imports
import './App.css'

function App() {
  
  return (
    <>
      <nav style={{ padding: '20px', borderBottom: '1px solid #ccc' }}> {/* Remove inline styling */}
        <Link to="/" style={{ marginRight: '10px' }}>Overview</Link>
        <Link to="/owners">Owners</Link>
      </nav>

      {/* Routing */}
      <Routes>
        {/* Actual routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/owners" element={<Owners />} />
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

export default App
