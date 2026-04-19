import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, FileText, Printer, X } from 'lucide-react';
import InvoiceTicket from './InvoiceTicket';

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal Preview Estado
  const [selectedSale, setSelectedSale] = useState(null);
  const printRef = useRef();

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredSales(sales);
    } else {
      const lower = searchTerm.toLowerCase();
      const filtered = sales.filter(s => 
        s.numeroFactura.toLowerCase().includes(lower) || 
        (s.cliente?.nombre && s.cliente.nombre.toLowerCase().includes(lower)) ||
        (s.usuarioVendedor?.nombre && s.usuarioVendedor.nombre.toLowerCase().includes(lower))
      );
      setFilteredSales(filtered);
    }
  }, [searchTerm, sales]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sales');
      setSales(res.data);
      setFilteredSales(res.data);
      setError('');
    } catch (err) {
      setError('Error al conectar con el servidor para obtener el historial.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      // Usar la API nativa de impresión del navegador enfocado en el ref
      // Para aislar el DOM, añadimos clases condicionales via CSS (en Custom CSS de InvoiceTicket)
      printRef.current.classList.add('custom-print-container');
      window.print();
      setTimeout(() => {
        if(printRef.current) printRef.current.classList.remove('custom-print-container');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Historial de Facturas</h1>
            <p className="text-slate-500 mt-1">Consulta y reimprime todas las ventas registradas en el sistema.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Buscar por factura, cliente o vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                  <th className="p-4 font-semibold">Factura</th>
                  <th className="p-4 font-semibold">Fecha y Hora</th>
                  <th className="p-4 font-semibold">Vendedor Resp.</th>
                  <th className="p-4 font-semibold">Cliente</th>
                  <th className="p-4 font-semibold text-right">Total Pagado</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">Cargando métricas de facturación...</td>
                  </tr>
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">No hay facturas que coincidan con la búsqueda.</td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-800 font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-500" />
                          {sale.numeroFactura}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 text-sm">
                        {new Date(sale.fecha).toLocaleString()}
                      </td>
                      <td className="p-4 text-slate-700">
                        {sale.usuarioVendedor?.nombre || 'N/D'}
                        <span className="block text-xs text-slate-400">{sale.usuarioVendedor?.rol}</span>
                      </td>
                      <td className="p-4 text-slate-700">
                        {sale.cliente?.nombre || 'Consumidor Final'}
                      </td>
                      <td className="p-4 text-right font-bold text-slate-800">
                        $ {sale.total.toLocaleString('es-CO')}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => setSelectedSale(sale)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors border border-blue-200"
                        >
                          Ver Ticket
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Visor de Ticket */}
      {selectedSale && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:bg-white print:p-0">
          <div className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:w-full print:h-auto">
            {/* Modal Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center print:hidden">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Visor HTML
              </h3>
              <button 
                onClick={() => setSelectedSale(null)} 
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Ticket Scrollable View */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar flex justify-center print:p-0 print:overflow-visible">
              <InvoiceTicket ref={printRef} sale={selectedSale} />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 print:hidden">
              <button 
                onClick={() => setSelectedSale(null)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              >
                Cerrar
              </button>
              <button 
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm shadow-blue-200 transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir Factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
