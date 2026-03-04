import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InventoryEntry from './InventoryEntry';
import Alerts from './Alerts';

const Dashboard = ({ user, token }) => {
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showEntryForm, setShowEntryForm] = useState(false);

  const fetchInventory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/inventory/dispatch', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/inventory/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchAlerts();
  }, [token]);

  const canEnterStock = user.rol === 'Regente' || user.rol === 'Administrador';

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Control</h1>
          <p className="text-slate-600 mt-1">Gestión integral de abastecimiento y alertas FEFO.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                Inventario Disponible (FEFO)
              </h2>
              {canEnterStock && (
                <button 
                  onClick={() => setShowEntryForm(!showEntryForm)}
                  className={`px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm flex items-center gap-2 text-sm ${showEntryForm ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {showEntryForm ? (
                    <>
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                       Cancelar Ingreso
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      Ingresar Mercancía
                    </>
                  )}
                </button>
              )}
            </div>

            {showEntryForm && canEnterStock && (
              <div className="mb-8 transform transition-all duration-300 origin-top bg-slate-50 p-6 rounded-xl border border-slate-200">
                <InventoryEntry token={token} onEntrySuccess={() => {
                  fetchInventory();
                  fetchAlerts();
                  setShowEntryForm(false);
                }} />
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
              <table className="w-full text-left bg-white text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase tracking-wide text-xs">
                    <th className="p-4 font-semibold border-b border-slate-200">Producto</th>
                    <th className="p-4 font-semibold border-b border-slate-200 text-right">Cantidad</th>
                    <th className="p-4 font-semibold border-b border-slate-200">Lote</th>
                    <th className="p-4 font-semibold border-b border-slate-200">Vencimiento</th>
                    <th className="p-4 font-semibold border-b border-slate-200">Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400 italic bg-gray-50/50">
                        No hay inventario registrado en el sistema.
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item) => (
                      <tr key={item._id} className="hover:bg-blue-50/50 transition-colors even:bg-slate-50/50">
                        <td className="p-4 font-medium text-slate-900">{item.nombreProducto}</td>
                        <td className="p-4 text-right font-medium">
                          {item.cantidad} <span className="text-slate-400 text-xs font-normal">uds</span>
                        </td>
                        <td className="p-4 text-slate-500 font-mono text-xs bg-slate-100/50 rounded inline-block mt-3 mb-2 ml-4 px-2 py-1">{item.lote}</td>
                        <td className="p-4">
                          <span className="bg-blue-100/80 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-blue-200">
                            {new Date(item.fechaVencimiento).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-slate-400">
                          {new Date(item.fechaIngreso).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Alerts alerts={alerts} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
