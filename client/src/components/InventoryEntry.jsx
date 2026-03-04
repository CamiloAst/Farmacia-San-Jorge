import React, { useState } from 'react';
import axios from 'axios';

const InventoryEntry = ({ token, onEntrySuccess }) => {
  const [formData, setFormData] = useState({
    nombreProducto: '',
    cantidad: '',
    lote: '',
    fechaVencimiento: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/inventory/entry', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onEntrySuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el inventario. Verifique sus permisos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        Registro de Nueva Entrada
      </h3>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-5 text-sm font-medium border border-red-100">{error}</div>}
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">Nombre del Producto</label>
          <input 
            type="text" 
            name="nombreProducto" 
            required 
            value={formData.nombreProducto} 
            onChange={handleChange} 
            className="w-full rounded-lg border-slate-300 border px-4 py-2.5 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all shadow-sm" 
            placeholder="Ej. Paracetamol 500mg"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">Cantidad</label>
          <input 
            type="number" 
            name="cantidad" 
            min="1" 
            required 
            value={formData.cantidad} 
            onChange={handleChange} 
            className="w-full rounded-lg border-slate-300 border px-4 py-2.5 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all shadow-sm" 
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">Número de Lote</label>
          <input 
            type="text" 
            name="lote" 
            required 
            value={formData.lote} 
            onChange={handleChange} 
            className="w-full rounded-lg border-slate-300 border px-4 py-2.5 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all shadow-sm font-mono text-sm" 
            placeholder="LOTE-XXX"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">Fecha de Vencimiento (FEFO)</label>
          <input 
            type="date" 
            name="fechaVencimiento" 
            required 
            value={formData.fechaVencimiento} 
            onChange={handleChange} 
            className="w-full rounded-lg border-slate-300 border px-4 py-2.5 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all shadow-sm text-slate-800" 
          />
        </div>
        <div className="md:col-span-2 flex justify-end mt-4 pt-4 border-t border-slate-200">
          <button 
            type="submit" 
            disabled={loading} 
            className="bg-blue-600 text-white font-bold flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow transition-all disabled:opacity-50"
          >
            {loading ? 'Procesando...' : (
              <>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                Registrar Inventario
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryEntry;
