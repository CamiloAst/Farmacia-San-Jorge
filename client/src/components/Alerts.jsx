import React from 'react';

const Alerts = ({ alerts }) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-rose-500 sticky top-24">
      <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2 tracking-tight">
        <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        Alertas Críticas
      </h2>
      <p className="text-xs text-slate-500 mb-6 font-medium uppercase tracking-wider">
        Umbral: menor a 10 uds
      </p>
      
      {alerts.length === 0 ? (
        <div className="bg-emerald-50/80 text-emerald-700 p-6 rounded-lg border border-emerald-100/50 flex flex-col items-center justify-center text-center">
          <svg className="w-10 h-10 text-emerald-500 mb-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="font-bold">Niveles Saludables</span>
          <span className="text-xs mt-1 text-emerald-600/80">El stock está abastecido correctamente.</span>
        </div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li key={alert._id} className="bg-rose-50/50 p-4 rounded-lg border border-rose-100 flex justify-between items-center transition-all hover:bg-rose-50">
              <span className="font-semibold text-rose-900 text-sm">{alert._id}</span>
              <span className="bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full border border-rose-200 shadow-sm flex items-center gap-1">
                <span>Qt:</span> {alert.totalStock}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Alerts;
