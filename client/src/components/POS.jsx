import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import InvoiceTicket from './InvoiceTicket';

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

function POS({ user, token }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Consumidor Final');
  const [customerID, setCustomerID] = useState('N/A');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [completedSale, setCompletedSale] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [cashReceived, setCashReceived] = useState('');
  const [checkoutStatus, setCheckoutStatus] = useState('idle'); // idle, processing, approved
  const printRef = useRef();
  
  const IMPUESTO_PORCENTAJE = 0.19;

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(searchTerm);
    }, 300); // 300ms delay to satisfy sub 2 seconds requirement while protecting API

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchProducts = async (term) => {
    try {
      const res = await api.get(`/sales/search?q=${term}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error('Fetch products error:', err);
    }
  };

  const addToCart = (product) => {
    setError(null);
    setSuccessMsg(null);
    const existingEntry = cart.find(item => item.nombreProducto === product.nombreProducto);
    
    if (existingEntry) {
      if (existingEntry.cantidad + 1 > product.stockDisponible) {
        setError(`Stock Insuficiente. Solo hay ${product.stockDisponible} uds de ${product.nombreProducto}.`);
        return;
      }
      setCart(cart.map(item => 
        item.nombreProducto === product.nombreProducto 
          ? { 
              ...item, 
              cantidad: item.cantidad + 1, 
              subtotal: (item.cantidad + 1) * product.precio 
            } 
          : item
      ));
    } else {
      if (product.stockDisponible < 1) {
        setError('Producto sin stock global.');
        return;
      }
      setCart([...cart, {
        nombreProducto: product.nombreProducto,
        precioUnitario: product.precio,
        cantidad: 1,
        subtotal: product.precio,
        stockMaximo: product.stockDisponible
      }]);
    }
  };

  const updateQuantity = (nombreProducto, delta) => {
    const productInCart = cart.find(p => p.nombreProducto === nombreProducto);
    if (!productInCart) return;

    const newQuantity = productInCart.cantidad + delta;
    
    if (newQuantity <= 0) {
      // Remove from cart
      setCart(cart.filter(p => p.nombreProducto !== nombreProducto));
      return;
    }

    if (newQuantity > productInCart.stockMaximo) {
      setError(`Límite alcanzado: solo ${productInCart.stockMaximo} disponibles de ${nombreProducto}.`);
      return;
    }

    setCart(cart.map(item =>
      item.nombreProducto === nombreProducto
        ? { ...item, cantidad: newQuantity, subtotal: newQuantity * item.precioUnitario }
        : item
    ));
    setError(null);
  };

  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      setError('El carrito está vacío.');
      return;
    }
    setShowCheckout(true);
    setPaymentMethod('Efectivo');
    setCashReceived('');
    setCheckoutStatus('idle');
  };

  const handleSimulatedPayment = async () => {
    setCheckoutStatus('processing');
    
    if (paymentMethod === 'Tarjeta') {
      // Simulate 3 seconds payment gateway processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      setCheckoutStatus('approved');
    } else if (paymentMethod === 'Transferencia') {
      // Static validation simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCheckoutStatus('approved');
    }
  };

  const procesarVenta = async () => {
    setLoading(true);
    setError(null);

    const payload = {
      cliente: { nombre: customerName, identificacion: customerID },
      productos: cart.map(item => ({
        nombreProducto: item.nombreProducto,
        cantidad: item.cantidad
      })),
      metodoPago: paymentMethod,
      montoEntregado: paymentMethod === 'Efectivo' ? Number(cashReceived) : 0,
      cambio: paymentMethod === 'Efectivo' ? Number(cashReceived) - grandTotal : 0
    };

    try {
      const res = await api.post('/sales', payload);
      setShowCheckout(false);
      setCompletedSale(res.data); // Muestra el ticket 
      setSuccessMsg(`Factura generada exitosamente: ${res.data.numeroFactura}`);
      setCart([]); // Clean cart
      setCustomerName('Consumidor Final');
      setCustomerID('N/A');
      setSearchTerm('');
      fetchProducts(''); // refresh stocks
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error procesando venta.');
      setShowCheckout(false);
    } finally {
      setLoading(false);
      setCheckoutStatus('idle');
    }
  };

  // Cálculos de Total Dinámico
  const globalSubtotal = cart.reduce((acc, curr) => acc + curr.subtotal, 0);
  const taxes = Math.round(globalSubtotal * IMPUESTO_PORCENTAJE);
  const grandTotal = globalSubtotal + taxes;

  const handlePrint = () => {
    if (printRef.current) {
      printRef.current.classList.add('custom-print-container');
      window.print();
      setTimeout(() => {
        if(printRef.current) printRef.current.classList.remove('custom-print-container');
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 h-full bg-slate-50 relative">
      
      {/* Panel Izquierdo: Buscador de Productos */}
      <div className="w-full md:w-7/12 flex flex-col bg-white p-6 rounded-xl shadow-lg border border-slate-100">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-500 mb-6">
          Terminal de Ventas (POS)
        </h2>

        <div className="mb-4 relative">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-200 transition-shadow outline-none text-gray-700"
            placeholder="Buscar medicamentos (ej: Aspirina) o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {searchResults.length === 0 ? (
            <div className="text-center text-slate-400 mt-10">
              <p>No se encontraron productos en bodega.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {searchResults.map((prod) => (
                <div 
                  key={prod.nombreProducto} 
                  className="bg-white border rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group"
                  onClick={() => addToCart(prod)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
                      {prod.nombreProducto}
                    </h3>
                    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {prod.categoria}
                    </span>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Stock Total</p>
                      <p className={`font-medium ${prod.stockDisponible > 10 ? 'text-emerald-600' : 'text-orange-500'}`}>
                        {prod.stockDisponible} <span translate="no">uds</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-slate-800">
                        $ {prod.precio.toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Panel Derecho: Carrito y Facturación */}
      <div className="w-full md:w-5/12 flex flex-col bg-white p-6 rounded-xl shadow-lg border border-slate-100 relative overflow-hidden">
        
        {/* Alerts */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 border border-red-200 animate-pulse">
            🚨 {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-sm mb-4 border border-emerald-200 shadow-sm font-medium">
            ✅ {successMsg}
          </div>
        )}

        <div className="mb-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest border-b pb-2">Información del Cliente</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nombre" 
              className="w-1/2 p-2 text-sm border rounded bg-slate-50 focus:bg-white transition-colors outline-none focus:ring-1 focus:ring-blue-400"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Identificación" 
              className="w-1/2 p-2 text-sm border rounded bg-slate-50 focus:bg-white transition-colors outline-none focus:ring-1 focus:ring-blue-400"
              value={customerID}
              onChange={(e) => setCustomerID(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 border border-slate-100 rounded-lg bg-slate-50/50 p-2 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              <p>Añada productos desde el buscador.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.nombreProducto} className="bg-white p-3 rounded shadow-sm border border-slate-200 flex justify-between items-center group">
                  <div className="w-1/2">
                    <p className="font-semibold text-slate-800 line-clamp-1" title={item.nombreProducto}>{item.nombreProducto}</p>
                    <p className="text-xs text-slate-500">$ {item.precioUnitario.toLocaleString('es-CO')} c/u</p>
                  </div>
                  
                  <div className="flex items-center bg-slate-100 rounded-md p-1">
                    <button onClick={() => updateQuantity(item.nombreProducto, -1)} className="w-7 h-7 text-slate-600 hover:bg-white rounded transition-colors">-</button>
                    <span className="w-8 text-center font-medium text-sm">{item.cantidad}</span>
                    <button onClick={() => updateQuantity(item.nombreProducto, 1)} className="w-7 h-7 text-slate-600 hover:bg-white rounded transition-colors">+</button>
                  </div>
                  
                  <div className="w-1/4 text-right font-bold text-slate-700">
                    $ {item.subtotal.toLocaleString('es-CO')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen Final */}
        <div className="bg-slate-800 text-white p-5 rounded-xl mt-auto shadow-inner">
          <div className="flex justify-between mb-2 text-slate-300 text-sm">
            <span>Subtotal</span>
            <span>$ {globalSubtotal.toLocaleString('es-CO')}</span>
          </div>
          <div className="flex justify-between mb-3 text-slate-300 text-sm pb-3 border-b border-slate-600">
            <span>IVA (19%)</span>
            <span>$ {taxes.toLocaleString('es-CO')}</span>
          </div>
          <div className="flex justify-between items-center mb-5">
            <span className="font-semibold text-lg text-slate-200">Total a Pagar</span>
            <span className="font-bold text-3xl tracking-tight">$ {grandTotal.toLocaleString('es-CO')}</span>
          </div>

          <button 
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all focus:ring-4 ${
              loading || cart.length === 0 
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg focus:ring-emerald-500/50 hover:-translate-y-0.5'
            }`}
            onClick={handleProceedToPayment}
            disabled={loading || cart.length === 0}
          >
            {loading ? 'Procesando...' : 'Proceder al Pago'}
          </button>
        </div>

      </div>

      {/* Modal de Checkout */}
      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Completar Pago</h3>
              <button onClick={() => setShowCheckout(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Total a Cobrar</p>
                <p className="text-4xl font-extrabold text-emerald-600">$ {grandTotal.toLocaleString('es-CO')}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Método de Pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Efectivo', 'Tarjeta', 'Transferencia'].map(method => (
                    <button
                      key={method}
                      onClick={() => { setPaymentMethod(method); setCheckoutStatus('idle'); setCashReceived(''); }}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        paymentMethod === method 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' 
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lógica Específica por Método */}
              <div className="min-h-[120px] bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 flex flex-col justify-center">
                
                {paymentMethod === 'Efectivo' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Dinero Recibido</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-medium">$</span>
                        <input 
                          type="number" 
                          className="w-full pl-8 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 bg-white border-slate-200 outline-none text-slate-800 font-semibold"
                          placeholder="0"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                        />
                      </div>
                    </div>
                    {cashReceived && Number(cashReceived) >= grandTotal && (
                      <div className="flex justify-between items-center bg-emerald-100 text-emerald-800 p-3 rounded-lg border border-emerald-200">
                        <span className="text-sm font-semibold">Cambio a devolver:</span>
                        <span className="font-bold text-lg">$ {(Number(cashReceived) - grandTotal).toLocaleString('es-CO')}</span>
                      </div>
                    )}
                    {cashReceived && Number(cashReceived) < grandTotal && (
                      <div className="text-red-500 text-sm font-medium text-center">
                        Monto insuficiente
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === 'Tarjeta' && (
                  <div className="text-center flex flex-col items-center">
                    {checkoutStatus === 'idle' && (
                      <>
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">Haga clic abajo para simular inserción en el datáfono.</p>
                      </>
                    )}
                    {checkoutStatus === 'processing' && (
                      <>
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mb-3"></div>
                        <p className="text-sm text-slate-600 font-medium animate-pulse">Procesando con el banco...</p>
                      </>
                    )}
                    {checkoutStatus === 'approved' && (
                      <>
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <p className="text-sm font-bold text-emerald-700">Pago Aprobado</p>
                      </>
                    )}
                  </div>
                )}

                {paymentMethod === 'Transferencia' && (
                  <div className="text-center flex flex-col items-center">
                     {checkoutStatus === 'idle' && (
                       <>
                         <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                         </div>
                         <p className="text-sm text-slate-600 font-medium mb-1">Verifique el ingreso de la transferencia.</p>
                       </>
                     )}
                     {checkoutStatus === 'processing' && (
                        <>
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-3"></div>
                          <p className="text-sm text-slate-600 font-medium animate-pulse">Verificando comprobante...</p>
                        </>
                      )}
                     {checkoutStatus === 'approved' && (
                        <>
                          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          </div>
                          <p className="text-sm font-bold text-emerald-700">Transferencia Confirmada</p>
                        </>
                      )}
                  </div>
                )}

              </div>

              {/* Botón de Confirmación */}
              {paymentMethod === 'Efectivo' && (
                <button 
                  onClick={procesarVenta}
                  disabled={!cashReceived || Number(cashReceived) < grandTotal || loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all"
                >
                  {loading ? 'Guardando Venta...' : 'Confirmar Pago y Facturar'}
                </button>
              )}

              {(paymentMethod === 'Tarjeta' || paymentMethod === 'Transferencia') && checkoutStatus !== 'approved' && (
                <button 
                  onClick={handleSimulatedPayment}
                  disabled={checkoutStatus === 'processing'}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all"
                >
                  {checkoutStatus === 'processing' ? 'Procesando...' : (paymentMethod === 'Tarjeta' ? 'Insertar Tarjeta' : 'Verificar Comprobante')}
                </button>
              )}

              {(paymentMethod === 'Tarjeta' || paymentMethod === 'Transferencia') && checkoutStatus === 'approved' && (
                <button 
                  onClick={procesarVenta}
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  {loading ? 'Guardando Venta...' : 'Confirmar Pago y Facturar'}
                </button>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Modal Visor de Ticket HTML */}
      {completedSale && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:bg-white print:p-0">
          <div className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:w-full print:h-auto">
            {/* Modal Header */}
            <div className="p-4 bg-emerald-500 border-b border-emerald-600 flex justify-between items-center print:hidden">
              <h3 className="font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                ¡Venta Exitosa! Factura HTML
              </h3>
            </div>
            
            {/* Ticket Scrollable View */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar flex justify-center print:p-0 print:overflow-visible">
              <InvoiceTicket ref={printRef} sale={completedSale} />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 print:hidden">
              <button 
                onClick={() => setCompletedSale(null)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              >
                Cerrar e Iniciar Nueva Venta
              </button>
              <button 
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm shadow-blue-200 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir Factura
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default POS;
