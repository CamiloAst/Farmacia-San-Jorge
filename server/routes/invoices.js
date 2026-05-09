const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/roles');

// GET /api/invoices/:id - Buscar factura por número (ej. FAC-00013)
router.get('/:id', [auth, authorizeRoles('Regente', 'Administrador', 'Vendedor')], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Asumimos que id es el numeroFactura
    const invoice = await Sale.findOne({ numeroFactura: id }).populate('usuarioVendedor', 'nombre rol');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }

    if (invoice.estado === 'Devuelta') {
      return res.status(400).json({ message: 'Esta factura ya fue invalidada por una devolución previa y no puede procesarse nuevamente.' });
    }

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Error al buscar la factura', error: err.message });
  }
});

module.exports = router;
