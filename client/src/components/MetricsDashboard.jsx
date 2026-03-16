import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MetricsDashboard = ({ token, user }) => {
  const [data, setData] = useState({ kpis: { receptionIntegrity: 0, totalEventsLast30Days: 0 }, historicalAlerts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      if (user?.rol !== 'Administrador') {
        setError('Acceso denegado. Se requiere nivel de Administrador.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get('/api/metrics/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar las métricas');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [token, user]);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Cargando motor analítico...</div>;
  if (error) return <div className="p-8 text-center text-rose-600 font-bold bg-rose-50 border border-rose-200 rounded-xl max-w-lg mx-auto mt-10 shadow-sm">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        <h2 className="text-2xl font-bold text-slate-800">Analítica Avanzada y NFRs</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between items-start hover:shadow-md transition-shadow">
          <p className="text-slate-500 font-bold uppercase tracking-wide text-xs mb-2">Integridad de Recepción Técnica</p>
          <div className="flex items-end gap-3">
             <span className="text-4xl font-extrabold text-blue-950">{data.kpis.receptionIntegrity.toFixed(1)}%</span>
             <span className="text-sm font-medium text-emerald-600 mb-1 bg-emerald-50 px-2 py-0.5 rounded">Éxito Histórico</span>
          </div>
          <p className="text-slate-400 text-xs mt-4">Porcentaje de ingresos sin errores capturados por el pipeline de eventos.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between items-start hover:shadow-md transition-shadow">
          <p className="text-slate-500 font-bold uppercase tracking-wide text-xs mb-2">Alertas de Stock Disparadas (30 Días)</p>
          <div className="flex items-end gap-3">
             <span className="text-4xl font-extrabold text-amber-600">{data.kpis.totalEventsLast30Days}</span>
             <span className="text-sm font-medium text-rose-600 mb-1 bg-rose-50 px-2 py-0.5 rounded">Faltantes Críticos</span>
          </div>
          <p className="text-slate-400 text-xs mt-4">Total de coincidencias bajo parámetro {`< 10 U`} detectadas en la cronología.</p>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-600 mb-6 uppercase tracking-wider">Cronología de Faltantes (Volumen por Día)</h3>
        {data.historicalAlerts.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 font-medium bg-slate-50 rounded-lg border border-dashed border-slate-200">
            No hay registros de anomalías en los últimos 30 días.
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.historicalAlerts} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}} 
                  contentStyle={{borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" />
                <Bar dataKey="alerts" name="Productos detectados bajo Mínimo" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsDashboard
