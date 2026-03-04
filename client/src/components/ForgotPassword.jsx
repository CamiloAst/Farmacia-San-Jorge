import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Logo from './Logo';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const handleBlur = (e) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(!emailRegex.test(e.target.value) && e.target.value.length > 0);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(emailError) return;
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage('Te hemos enviado un correo electrónico con las instrucciones para restablecer tu contraseña. Revisa tu buzón o carpeta de spam.');
    } catch (err) {
      setError(err.response?.data?.message || 'Hubo un error al procesar la solicitud.');
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

        <h2 className="text-2xl font-bold mb-2 text-center text-slate-900 tracking-tight">Recuperar Contraseña</h2>
        <p className="text-sm text-slate-500 mb-6 text-center leading-relaxed">
          Ingresa tu correo asociado y te enviaremos un enlace seguro para que crees una nueva clave.
        </p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">{error}</div>}
        {message && <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 text-sm font-medium border border-blue-100 leading-relaxed">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-800 text-sm font-bold mb-1.5">Correo Electrónico</label>
            <input 
              type="email" 
              className={`w-full px-4 py-2.5 border ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(false);
              }}
              onBlur={handleBlur}
              required 
              placeholder="juan@correo.com"
            />
            {emailError && <p className="text-red-500 text-xs mt-1 font-medium">Ingresa un correo válido</p>}
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando Envío...' : 'Enviar Enlace de Recuperación'}
          </button>
        </form>

        <div className="mt-8 flex justify-center text-sm text-slate-500">
          <Link to="/login" className="hover:text-blue-600 font-medium transition-colors">
            Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
