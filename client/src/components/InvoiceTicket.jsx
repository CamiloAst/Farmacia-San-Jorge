import React, { forwardRef } from 'react';

const InvoiceTicket = forwardRef(({ sale }, ref) => {
  if (!sale) return null;

  return (
    <div ref={ref} className="bg-white p-8 w-full max-w-sm mx-auto text-sm text-slate-800 font-sans print:m-0 print:p-4 print:shadow-none shadow-lg border border-slate-200">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase tracking-widest mb-1">SGT San Jorge</h2>
        <p className="text-xs text-slate-500">Farmacia y Suministros</p>
        <p className="text-xs text-slate-500">NIT: 800.123.456-7</p>
        <p className="text-xs text-slate-500">Tel: +57 300 000 0000</p>
      </div>

      <div className="border-b border-dashed border-slate-300 pb-3 mb-3">
        <div className="flex justify-between mb-1">
          <span className="font-semibold">Factura:</span>
          <span>{sale.numeroFactura}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="font-semibold">Fecha:</span>
          <span>{new Date(sale.fecha).toLocaleString()}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="font-semibold">Vendedor:</span>
          <span>{sale.usuarioVendedor?.nombre || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Cliente:</span>
          <span>{sale.cliente?.nombre || 'Consumidor Final'}</span>
        </div>
      </div>

      <div className="mb-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-300">
              <th className="pb-1 w-1/2">Producto</th>
              <th className="pb-1 text-center">Cant</th>
              <th className="pb-1 text-right">SubT</th>
            </tr>
          </thead>
          <tbody>
            {sale.productos?.map((item, idx) => (
              <tr key={idx} className="border-b border-dashed border-slate-200">
                <td className="py-2 pr-1 truncate max-w-[120px]">{item.nombreProducto}</td>
                <td className="py-2 text-center">{item.cantidad}</td>
                <td className="py-2 text-right">$ {item.subtotal.toLocaleString('es-CO')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-800 pt-3">
        <div className="flex justify-between text-xs mb-1">
          <span>Subtotal:</span>
          <span>$ {sale.subtotal.toLocaleString('es-CO')}</span>
        </div>
        <div className="flex justify-between text-xs mb-1">
          <span>IVA (19%):</span>
          <span>$ {sale.impuestos.toLocaleString('es-CO')}</span>
        </div>
        <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-dashed border-slate-300">
          <span>TOTAL:</span>
          <span>$ {sale.total.toLocaleString('es-CO')}</span>
        </div>
      </div>

      <div className="text-center mt-8 text-xs text-slate-500">
        <p>¡Gracias por su compra!</p>
        <p className="mt-1">Conserve su ticket para cualquier reclamo.</p>
        <p className="mt-2" style={{ fontFamily: 'monospace' }}>*** COPIA CLIENTE ***</p>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .custom-print-container, .custom-print-container * {
            visibility: visible;
          }
          .custom-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
});

InvoiceTicket.displayName = 'InvoiceTicket';

export default InvoiceTicket;
