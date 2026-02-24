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
    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Registrar Nueva Entrada</h3>
      {error && <div className="bg-red-100 text-red-600 p-2 rounded mb-3 text-sm font-semibold">{error}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Producto</label>
          <input type="text" name="nombreProducto" required value={formData.nombreProducto} onChange={handleChange} className="w-full rounded-md border-gray-300 border p-2 focus:border-institutional focus:ring focus:ring-institutional focus:ring-opacity-50 transition" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Cantidad</label>
          <input type="number" name="cantidad" min="1" required value={formData.cantidad} onChange={handleChange} className="w-full rounded-md border-gray-300 border p-2 focus:border-institutional focus:ring focus:ring-institutional focus:ring-opacity-50 transition" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Lote</label>
          <input type="text" name="lote" required value={formData.lote} onChange={handleChange} className="w-full rounded-md border-gray-300 border p-2 focus:border-institutional focus:ring focus:ring-institutional focus:ring-opacity-50 transition" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Vencimiento</label>
          <input type="date" name="fechaVencimiento" required value={formData.fechaVencimiento} onChange={handleChange} className="w-full rounded-md border-gray-300 border p-2 focus:border-institutional focus:ring focus:ring-institutional focus:ring-opacity-50 transition" />
        </div>
        <div className="md:col-span-2 flex justify-end mt-2">
          <button type="submit" disabled={loading} className="bg-institutional text-white font-bold px-6 py-2 rounded-md shadow hover:bg-institutional-dark transition disabled:opacity-50">
            {loading ? 'Guardando...' : 'Guardar Entrada'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryEntry;
