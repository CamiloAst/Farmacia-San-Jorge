const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  nombreProducto: { type: String, required: true },
  cantidad: { type: Number, required: true, min: 0 },
  lote: { type: String, required: true },
  fechaVencimiento: { type: Date, required: true },
  precio: { type: Number, required: true, min: 0, default: 0 },
  categoria: { type: String, required: true, default: 'General' },
  fechaIngreso: { type: Date, default: Date.now },
  estado: { 
    type: String, 
    enum: ['PENDING', 'APPROVED'],
    default: 'PENDING'
  }
});

module.exports = mongoose.model('Inventory', inventorySchema);
