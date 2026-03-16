import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import InventoryEntry from './InventoryEntry';
import Alerts from './Alerts';

const Dashboard = ({ user, token }) => {
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showEntryForm, setShowEntryForm] = useState(false);
  
  // Edit State
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({ cantidad: '', fechaVencimiento: '' });

  const fetchInventory = async () => {
    try {
      const res = await axios.get('/api/inventory/dispatch', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('/api/inventory/alerts', {
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
  const isAdmin = user.rol === 'Administrador';

  // RNF-14: MFA state for Deletions
  const [mfaData, setMfaData] = useState({ show: false, itemId: null, itemName: '', password: '', error: '', loading: false });

  const triggerDelete = (id, nombreProducto) => {
    setMfaData({ show: true, itemId: id, itemName: nombreProducto, password: '', error: '', loading: false });
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setMfaData({ ...mfaData, loading: true, error: '' });
    try {
      // 1. Verify Authentication Password (MFA)
      await axios.post('/api/auth/verify-password', { password: mfaData.password }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 2. If Auth succeeds, proceed to Detele
      await axios.delete(`/api/inventory/${mfaData.itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMfaData({ show: false, itemId: null, itemName: '', password: '', error: '', loading: false });
      fetchInventory();
      fetchAlerts();
    } catch (err) {
      setMfaData({ 
        ...mfaData, 
        loading: false, 
        error: err.response?.data?.message || 'Error de validación o eliminación.' 
      });
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item._id);
    // Format date properly for the input type="date"
    const formattedDate = new Date(item.fechaVencimiento).toISOString().split('T')[0];
    setEditFormData({ 
      cantidad: item.cantidad,
      fechaVencimiento: formattedDate
    });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/inventory/${editingItem}`, {
        cantidad: Number(editFormData.cantidad),
        fechaVencimiento: editFormData.fechaVencimiento
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingItem(null);
      fetchInventory();
      fetchAlerts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al editar');
    }
  };

  return (
    <div className="space-y-8 pb-12 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Control</h1>
          <p className="text-slate-600 mt-1">Gestión integral de abastecimiento y alertas FEFO.</p>
        </div>
        
        {isAdmin && (
          <Link 
            to="/metrics"
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Analítica NFRs
          </Link>
        )}
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
                    {isAdmin && <th className="p-4 font-semibold border-b border-slate-200 text-center">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? "5" : "4"} className="p-8 text-center text-slate-400 italic bg-gray-50/50">
                        No hay inventario registrado en el sistema.
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item) => (
                      <tr key={item._id} className="hover:bg-blue-50/50 transition-colors even:bg-slate-50/50 relative">
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
                        {isAdmin && (
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* Edit Button */}
                              <button 
                                onClick={() => openEditModal(item)}
                                className="p-1.5 text-blue-600 bg-blue-50 border border-transparent hover:border-blue-200 hover:bg-blue-100 rounded-md transition-all shadow-sm"
                                title="Editar Stock"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                              </button>
                              
                              {/* Delete Button */}
                              <button 
                                onClick={() => triggerDelete(item._id, item.nombreProducto)}
                                className="p-1.5 text-rose-600 bg-rose-50 border border-transparent hover:border-rose-200 hover:bg-rose-100 rounded-md transition-all shadow-sm"
                                title="Eliminar Medicamento"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                            </div>
                          </td>
                        )}
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

      {/* Edit Form Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 shadow-2xl transition-opacity">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Modificar Stock</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={submitEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Cantidad Físicamente en Bodega</label>
                  <input 
                    type="number" 
                    min="0"
                    required
                    value={editFormData.cantidad}
                    onChange={(e) => setEditFormData({ ...editFormData, cantidad: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Fecha Vencimiento Registrada</label>
                  <input 
                    type="date" 
                    required
                    value={editFormData.fechaVencimiento}
                    onChange={(e) => setEditFormData({ ...editFormData, fechaVencimiento: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                   <button 
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="w-full bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-200 transition-all shadow-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                  >
                    Guardar Edición
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* RNF-14: MFA Validation Modal for Deletion */}
      {mfaData.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 shadow-2xl transition-opacity">
          <div className="bg-white rounded-xl shadow-lg border border-rose-200 w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className="bg-rose-50 px-6 py-4 border-b border-rose-200 flex items-center gap-2">
              <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              <h3 className="font-bold text-rose-800 text-lg">Validación de Seguridad</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Estás a punto de eliminar permanentemente: <strong className="text-slate-900">{mfaData.itemName}</strong>. 
                Por motivos de seguridad, por favor digita tu contraseña para autorizar esta acción crítica.
              </p>
              
              {mfaData.error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-xs font-medium border border-red-100">{mfaData.error}</div>}

              <form onSubmit={handleMfaSubmit} className="space-y-4">
                <div>
                  <input 
                    type="password" 
                    required
                    placeholder="Contraseña de Administrador"
                    value={mfaData.password}
                    onChange={(e) => setMfaData({ ...mfaData, password: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all shadow-sm"
                  />
                </div>
                <div className="pt-2 flex gap-3">
                   <button 
                    type="button"
                    onClick={() => setMfaData({ show: false, itemId: null, itemName: '', password: '', error: '', loading: false })}
                    className="w-full bg-slate-100 text-slate-700 font-bold py-2.5 px-4 rounded-lg hover:bg-slate-200 transition-all shadow-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={mfaData.loading}
                    className="w-full bg-rose-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-rose-700 transition-all shadow-sm disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {mfaData.loading ? 'Verificando...' : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Eliminar Registro
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
