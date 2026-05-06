const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  cliente: {
    nombre: { type: String, default: 'Consumidor Final' },
    identificacion: { type: String, default: 'N/A' },
  },
  productos: [{
    nombreProducto: { type: String, required: true },
    cantidad: { type: Number, required: true },
    precioUnitario: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  impuestos: { type: Number, required: true }, // As requested 19%
  total: { type: Number, required: true },
  metodoPago: { type: String, enum: ['Efectivo', 'Tarjeta', 'Transferencia'], required: true },
  montoEntregado: { type: Number, default: 0 },
  cambio: { type: Number, default: 0 },
  fecha: { type: Date, default: Date.now },
  usuarioVendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  numeroFactura: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Sale', saleSchema);
