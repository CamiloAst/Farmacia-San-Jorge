const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema({
  domain: { 
    type: String, 
    required: true,
    enum: ['INVENTORY', 'AUTH', 'SYSTEM', 'SALES']
  },
  metricType: { 
    type: String, 
    required: true,
    enum: ['RECEPCION_TECNICA', 'ALERTA_STOCK', 'ELIMINACION_MFA', 'NUEVA_VENTA', 'MERMA_DEVOLUCION']
  },
  status: { 
    type: String, 
    required: true,
    enum: ['Éxito', 'Fallo', 'Advertencia', 'Informativo']
  },
  numericValue: { 
    type: Number, 
    default: 0 
  },
  details: { 
    type: mongoose.Schema.Types.Mixed 
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Metric', metricSchema);
