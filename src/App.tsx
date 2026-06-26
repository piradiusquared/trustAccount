import React, { useEffect, useState } from 'react';
import { getDatabase } from './database';

interface User {
  id: number;
  name: string;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch all users from the SQLite DB
  const fetchUsers = async () => {
    try {
      const db = await getDatabase();
      const result = await db.select<User[]>('SELECT id, name FROM users');
      setUsers(result);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add a new user to the SQLite DB
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    try {
      const db = await getDatabase();
      // Uses positional placeholder ($1) for security
      await db.execute('INSERT INTO users (name) VALUES ($1)', [nameInput]);
      setNameInput('');
      await fetchUsers();
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading database...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>SQLite + React + Tauri Demo</h1>
      
      <form onSubmit={handleAddUser} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Enter user name"
          style={{ padding: '8px', marginRight: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Add User</button>
      </form>

      <h2>Database Records</h2>
      {users.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name} (ID: {user.id})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;