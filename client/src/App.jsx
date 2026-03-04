import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import Logo from './components/Logo';

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
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <header className="bg-blue-950 text-white px-6 py-4 shadow-md flex justify-between items-center z-10 sticky top-0">
          <Link to="/dashboard" className="hover:opacity-90 transition-opacity">
            <Logo textClassName="text-white" />
          </Link>
          {user && (
            <div className="flex gap-4 items-center">
              <span className="font-semibold bg-white/10 px-3 py-1 rounded-full text-sm backdrop-blur-sm border border-white/20">
                {user.rol}
              </span>
              <span className="font-medium text-white">{user.nombre}</span>
              <button 
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm border border-blue-600/50 text-sm font-semibold"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </header>

        <main className="container mx-auto p-4 md:p-8 flex-1 flex flex-col">
          <Routes>
            <Route 
              path="/login" 
              element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/register" 
              element={!token ? <Register /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/forgot-password" 
              element={!token ? <ForgotPassword /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/reset-password/:token" 
              element={!token ? <ResetPassword /> : <Navigate to="/dashboard" />} 
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
