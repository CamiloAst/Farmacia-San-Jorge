import React, { useState } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Interceptor to add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function Returns({ user }) {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [returnQuantities, setReturnQuantities] = useState({});
  const [returnReason, setReturnReason] = useState('Error de despacho');

  const searchInvoice = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setInvoice(null);
    
    if (!invoiceNumber) {
      setError('Ingrese un número de factura válido.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/invoices/${invoiceNumber}`);
      setInvoice(res.data);
      setReturnQuantities({});
    } catch (err) {
      setError(err.response?.data?.message || 'Error buscando factura. Verifique el número.');
    } finally {
      setLoading(false);
    }
  };

  const processReturn = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const itemsToReturn = Object.entries(returnQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([name, qty]) => ({ nombreProducto: name, cantidad: qty }));

    if (itemsToReturn.length === 0) {
      setError('Especifique al menos un producto a devolver con cantidad mayor a 0.');
      setLoading(false);
      return;
    }

    const payload = {
      numeroFactura: invoice.numeroFactura,
      productos: itemsToReturn,
      motivo: returnReason
    };

    try {
      await api.post('/returns', payload);
      setSuccessMsg(res.data.message);
      setInvoice(null);
      setInvoiceNumber('');
      setReturnQuantities({});
      setReturnReason('Error de despacho');
    } catch (err) {
      setError(err.response?.data?.message || 'Error procesando la devolución.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (nombreProducto, val, max) => {
    let num = Number(val);
    if (num < 0) num = 0;
    if (num > max) num = max;
    setReturnQuantities({ ...returnQuantities, [nombreProducto]: num });
  };

  if (!['Administrador', 'Regente'].includes(user?.rol)) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold text-slate-800">Acceso Denegado</h2>
        <p className="text-slate-500 mt-2">Solo el Regente o el Administrador pueden autorizar devoluciones.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500 mb-6">
          Gestión de Devoluciones
        </h2>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm mb-6 border border-red-200 shadow-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg text-sm mb-6 border border-emerald-200 shadow-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            {successMsg}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-2/3">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Buscar Factura Original</label>
            <div className="relative">
              <input 
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Ej. FAC-00013"
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
          <button 
            onClick={searchInvoice}
            disabled={loading}
            className="w-full md:w-1/3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {loading ? 'Buscando...' : 'Consultar Factura'}
          </button>
        </div>

        {invoice && (
          <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
            <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-orange-800 text-lg">Factura Encontrada: {invoice.numeroFactura}</h3>
                <p className="text-sm text-orange-600 mt-1">Cliente: {invoice.cliente?.nombre} | Vendedor: {invoice.usuarioVendedor?.nombre}</p>
              </div>
              <div className="text-right">
                <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                  Autorización de Regencia
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Artículos a Devolver</label>
                <div className="border rounded-lg overflow-hidden bg-slate-50">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Producto</th>
                        <th className="p-3 text-center">Comprados</th>
                        <th className="p-3 text-center">Devolver</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {invoice.productos.map((prod, idx) => (
                        <tr key={idx} className="bg-white">
                          <td className="p-3 font-medium text-slate-700">{prod.nombreProducto}</td>
                          <td className="p-3 text-center font-bold text-slate-600">{prod.cantidad}</td>
                          <td className="p-3 text-center w-32">
                            <input 
                              type="number" 
                              min="0" 
                              max={prod.cantidad}
                              value={returnQuantities[prod.nombreProducto] || ''}
                              onChange={(e) => handleQuantityChange(prod.nombreProducto, e.target.value, prod.cantidad)}
                              placeholder="0"
                              className="w-full p-2 border rounded-md text-center focus:ring-2 focus:ring-orange-500 outline-none text-slate-800 font-semibold"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Motivo de Devolución</label>
                  <select 
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="Error de despacho">Error de despacho (Retorna a Inventario)</option>
                    <option value="Vencimiento">Vencimiento (Va a Merma)</option>
                    <option value="Empaque dañado">Empaque dañado (Va a Merma)</option>
                    <option value="Otro">Otro (Va a Merma)</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Nota: Los motivos de Merma no aumentan el inventario disponible.
                  </p>
                </div>

              <div className="border-t border-slate-100 pt-6">
                <button 
                  onClick={processReturn}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                      Procesar Devolución
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Returns;
