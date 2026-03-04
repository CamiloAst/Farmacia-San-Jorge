import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Logo from './Logo';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="flex items-center justify-center flex-1 h-full py-12">
      <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        
        <h2 className="text-2xl font-bold mb-2 text-center text-slate-900 tracking-tight">Iniciar Sesión</h2>
        <p className="text-slate-500 text-center text-sm mb-6">Ingresa tus credenciales para continuar</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-800 text-sm font-bold mb-1.5">Correo Electrónico</label>
            <input 
              type="email" 
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="admin@sanjorge.com"
            />
          </div>
          <div>
            <label className="block text-slate-800 text-sm font-bold mb-1.5">Contraseña</label>
            <input 
              type="password" 
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow mt-2"
          >
            Ingresar al Sistema
          </button>
        </form>
        
        <div className="mt-8 flex flex-col items-center gap-3 text-sm text-slate-500">
          <Link to="/register" className="hover:text-blue-600 font-medium transition-colors">
            ¿No tienes cuenta? Regístrate aquí
          </Link>
          <Link to="/forgot-password" className="hover:text-blue-600 transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
