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

  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setError('');
    setLoading(true);
    setShowConfirm(false);
    try {
      await axios.post('/api/inventory/entry', formData, {
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
      
      <form onSubmit={handlePreSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Continuar
              </>
            )}
          </button>
        </div>
      </form>

      {/* RNF-04 / RNF-06: Interactive Summary Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 shadow-2xl transition-opacity">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              <h3 className="font-bold text-slate-800 text-lg">Resumen de Recepción Técnica</h3>
            </div>
            
            <div className="p-6">
              <p className="text-slate-600 text-sm mb-4">Por favor, verifique la exactitud del lote antes de ingresarlo permanentemente a la bóveda de inventario FEFO:</p>
              
              <ul className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                <li className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 font-medium">Producto:</span> <span className="font-bold text-slate-900">{formData.nombreProducto}</span></li>
                <li className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 font-medium">Lote Físico:</span> <span className="font-bold font-mono text-slate-900">{formData.lote}</span></li>
                <li className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 font-medium">Unidades a ingresar:</span> <span className="font-bold text-slate-900">{formData.cantidad} u.</span></li>
                <li className="flex justify-between"><span className="text-slate-500 font-medium">Fecha Caducidad:</span> <span className="font-bold text-slate-900">{new Date(formData.fechaVencimiento).toLocaleDateString()}</span></li>
              </ul>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="w-full bg-white text-slate-700 font-bold py-2.5 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                >
                  Regresar
                </button>
                <button 
                  onClick={confirmSubmit}
                  className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow transition-all"
                >
                  Confirmar Autorización
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryEntry;
