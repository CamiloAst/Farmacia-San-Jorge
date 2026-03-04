import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from './Logo';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailError, setEmailError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if(e.target.name === 'email') setEmailError(false);
  };

  const handleBlur = (e) => {
    if (e.target.name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(!emailRegex.test(e.target.value) && e.target.value.length > 0);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if(emailError) return;

    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      setSuccess('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el usuario');
    }
  };

  return (
    <div className="flex items-center justify-center flex-1 h-full py-12">
      <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <h2 className="text-2xl font-bold mb-2 text-center text-slate-900 tracking-tight">Crear Cuenta</h2>
        <p className="text-slate-500 text-center text-sm mb-6">Únete al sistema unificado de SGT</p>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm font-medium border border-green-100">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-800 text-sm font-bold mb-1.5">Nombre Completo</label>
            <input 
              type="text" 
              name="nombre"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              value={formData.nombre}
              onChange={handleChange}
              required 
              placeholder="Ej. Juan Pérez"
            />
          </div>
          <div>
            <label className="block text-slate-800 text-sm font-bold mb-1.5">Correo Electrónico</label>
            <input 
              type="email" 
              name="email"
              className={`w-full px-4 py-2.5 border ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required 
              placeholder="juan@correo.com"
            />
            {emailError && <p className="text-red-500 text-xs mt-1 font-medium">Ingresa un correo válido</p>}
          </div>
          <div>
            <label className="block text-slate-800 text-sm font-bold mb-1.5">Contraseña</label>
            <input 
              type="password" 
              name="password"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              value={formData.password}
              onChange={handleChange}
              required 
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow mt-2"
          >
            Registrar Usuario
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

export default Register;
