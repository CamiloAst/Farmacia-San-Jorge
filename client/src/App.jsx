import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import MetricsDashboard from './components/MetricsDashboard';
import POS from './components/POS';
import SalesHistory from './components/SalesHistory';
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

  const handleLogout = useCallback(() => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  // RNF-15: Caducidad de Sesión por Inactividad (10 minutos)
  const INACTIVITY_LIMIT_MS = 10 * 1000; // 10 minutos
  const WARNING_BEFORE_MS = 5 * 1000; // Advertencia 30s antes
  const inactivityTimer = useRef(null);
  const warningTimer = useRef(null);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

  const resetInactivityTimer = useCallback(() => {
    // Limpiar timers anteriores
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    setShowInactivityWarning(false);

    if (!token) return; // Solo activar si hay sesión

    // Timer de advertencia (se activa 30s antes del cierre)
    warningTimer.current = setTimeout(() => {
      setShowInactivityWarning(true);
    }, INACTIVITY_LIMIT_MS - WARNING_BEFORE_MS);

    // Timer de cierre de sesión
    inactivityTimer.current = setTimeout(() => {
      console.log('Sesión cerrada automáticamente por inactividad de 10 minutos.');
      setShowInactivityWarning(false);
      handleLogout();
    }, INACTIVITY_LIMIT_MS);
  }, [token, handleLogout]);

  useEffect(() => {
    if (!token) {
      // Sin sesión activa, limpiar todo
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      setShowInactivityWarning(false);
      return;
    }

    // Eventos que indican actividad del usuario
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach(event => window.addEventListener(event, resetInactivityTimer));

    // Iniciar el primer timer
    resetInactivityTimer();

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
  }, [token, resetInactivityTimer]);

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

        {/* RNF-15: Banner de advertencia de cierre de sesión por inactividad */}
        {showInactivityWarning && (
          <div className="bg-amber-500 text-white text-center py-2 px-4 text-sm font-semibold animate-pulse shadow-md">
            Tu sesión se cerrará en 30 segundos por inactividad. Mueve el mouse o presiona una tecla para continuar.
          </div>
        )}

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
            <Route 
              path="/metrics" 
              element={token && user?.rol === 'Administrador' ? <MetricsDashboard user={user} token={token} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/pos" 
              element={token && ['Administrador', 'Regente', 'Vendedor'].includes(user?.rol) ? <POS user={user} token={token} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/invoices" 
              element={token && ['Administrador', 'Regente', 'Vendedor'].includes(user?.rol) ? <SalesHistory user={user} token={token} /> : <Navigate to="/dashboard" />} 
            />
            <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
