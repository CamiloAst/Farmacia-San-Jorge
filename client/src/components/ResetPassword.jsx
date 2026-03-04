import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Logo from './Logo';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passMatchError, setPassMatchError] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleConfirmBlur = () => {
    if (confirmPassword.length > 0 && password !== confirmPassword) {
      setPassMatchError(true);
    } else {
      setPassMatchError(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setPassMatchError(true);
      return setError('Las contraseñas no coinciden. Por favor verifica.');
    }

    setLoading(true);
    
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', { 
        token, 
        password 
      });
      setSuccess('Contraseña restablecida exitosamente. Redirigiendo al login central...');
      setTimeout(() => navigate('/login'), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'El enlace de recuperación es inválido o ha expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center flex-1 h-full py-12">
      <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <h2 className="text-2xl font-bold mb-2 text-center text-slate-900 tracking-tight">Nueva Contraseña</h2>
        <p className="text-sm text-slate-500 mb-6 text-center leading-relaxed">
          Digita tu nueva clave de acceso de al menos 6 caracteres.
        </p>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm font-medium border border-green-100">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-800 text-sm font-bold mb-1.5">Nueva Contraseña</label>
            <input 
              type="password" 
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPassMatchError(false);
              }}
              required 
              minLength="6"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-slate-800 text-sm font-bold mb-1.5">Confirmar Contraseña</label>
            <input 
              type="password" 
              className={`w-full px-4 py-2.5 border ${passMatchError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPassMatchError(false);
              }}
              onBlur={handleConfirmBlur}
              required 
              minLength="6"
              placeholder="••••••••"
            />
             {passMatchError && <p className="text-red-500 text-xs mt-1 font-medium">Las contraseñas no coinciden</p>}
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando cambios...' : 'Confirmar y Guardar'}
          </button>
        </form>
        
        <div className="mt-8 flex justify-center text-sm text-slate-500">
          <Link to="/login" className="hover:text-blue-600 font-medium transition-colors">
            Cancelar e ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
