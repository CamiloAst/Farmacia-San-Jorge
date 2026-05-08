const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  facturaOriginal: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  numeroFactura: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  productos: [{
    nombreProducto: { type: String, required: true },
    cantidad: { type: Number, required: true }
  }],
  motivo: { type: String, enum: ['Vencimiento', 'Empaque dañado', 'Error de despacho', 'Otro'], required: true },
  estado: { type: String, default: 'Aprobada' },
  usuarioAutoriza: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Return', returnSchema);
