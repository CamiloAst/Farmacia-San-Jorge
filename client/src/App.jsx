import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const handleLogin = (jwt, userData) => {
    setToken(jwt);
    setUser(userData);
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <div className="min-h-screen bg-institutional-light flex flex-col">
        <header className="bg-institutional text-white p-4 shadow-md flex justify-between items-center z-10">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🌿 Farmacia San Jorge
          </h1>
          {user && (
            <div className="flex gap-4 items-center">
              <span className="font-medium bg-institutional-dark px-3 py-1 rounded-full text-sm">
                {user.rol}
              </span>
              <span className="font-semibold">{user.nombre}</span>
              <button 
                onClick={handleLogout}
                className="bg-white text-institutional px-4 py-2 rounded-md hover:bg-gray-100 transition font-bold"
              >
                Salir
              </button>
            </div>
          )}
        </header>

        <main className="container mx-auto p-4 flex-1 flex flex-col">
          <Routes>
            <Route 
              path="/login" 
              element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/dashboard" 
              element={token ? <Dashboard user={user} token={token} /> : <Navigate to="/login" />} 
            />
            <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
