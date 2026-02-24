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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-institutional">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Inventario (FEFO)</h2>
              {canEnterStock && (
                <button 
                  onClick={() => setShowEntryForm(!showEntryForm)}
                  className="bg-institutional text-white px-4 py-2 rounded font-semibold hover:bg-institutional-dark transition shadow"
                >
                  {showEntryForm ? 'Ocultar Formulario' : 'Ingresar Mercancía'}
                </button>
              )}
            </div>

            {showEntryForm && canEnterStock && (
              <div className="mb-6 transform transition-all duration-300 origin-top">
                <InventoryEntry token={token} onEntrySuccess={() => {
                  fetchInventory();
                  fetchAlerts();
                  setShowEntryForm(false);
                }} />
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="p-3 font-semibold border-b">Producto</th>
                    <th className="p-3 font-semibold border-b">Cantidad</th>
                    <th className="p-3 font-semibold border-b">Lote</th>
                    <th className="p-3 font-semibold border-b">Vencimiento</th>
                    <th className="p-3 font-semibold border-b">Ingreso</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-gray-500 italic">No hay inventario disponible.</td>
                    </tr>
                  ) : (
                    inventory.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50 border-b transition">
                        <td className="p-3 font-medium text-gray-800">{item.nombreProducto}</td>
                        <td className="p-3 text-gray-700">{item.cantidad}</td>
                        <td className="p-3 text-sm text-gray-500">{item.lote}</td>
                        <td className="p-3 text-sm text-gray-700">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md whitespace-nowrap">
                            {new Date(item.fechaVencimiento).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
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
