import React from 'react';

const Alerts = ({ alerts }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 sticky top-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">⚠️</span> Alertas de Stock
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Productos con stock total menor a 10 unidades.
      </p>
      {alerts.length === 0 ? (
        <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
          <p className="font-semibold text-center flex flex-col items-center">
            <span className="text-3xl mb-2">✅</span>
            Niveles Saludables
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li key={alert._id} className="bg-red-50 p-3 rounded-md border border-red-200 flex justify-between items-center shadow-sm hover:shadow transition">
              <span className="font-semibold text-red-900">{alert._id}</span>
              <span className="bg-red-200 text-red-800 text-xs font-bold px-3 py-1 rounded-full border border-red-300">
                Qt: {alert.totalStock}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Alerts;
