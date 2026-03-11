const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/roles');

// Create new inventory batch - only Regente or Administrador
router.post('/entry', [auth, authorizeRoles('Regente', 'Administrador')], async (req, res) => {
  try {
    const { nombreProducto, cantidad, lote, fechaVencimiento } = req.body;
    
    const newEntry = new Inventory({
      nombreProducto,
      cantidad,
      lote,
      fechaVencimiento
    });

    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Dispatch inventory FEFO logic
router.get('/dispatch', auth, async (req, res) => {
  try {
    // FEFO: Order by Expiration Date Ascending
    const items = await Inventory.find({ cantidad: { $gt: 0 } })
                                 .sort({ fechaVencimiento: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Minimum Stock Alerts
router.get('/alerts', auth, async (req, res) => {
  try {
    const MINIMUM_STOCK = 10;
    // Aggregate to fetch total quantity per product
    const alerts = await Inventory.aggregate([
      { $group: { _id: "$nombreProducto", totalStock: { $sum: "$cantidad" } } },
      { $match: { totalStock: { $lt: MINIMUM_STOCK } } }
    ]);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update inventory item
router.put('/:id', [auth, authorizeRoles('Administrador')], async (req, res) => {
  try {
    const { cantidad } = req.body;
    
    // Numeric Validation
    if (cantidad !== undefined && (typeof cantidad !== 'number' || cantidad < 0)) {
      return res.status(400).json({ message: 'La cantidad debe ser un número positivo' });
    }

    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedItem) return res.status(404).json({ message: 'Medicamento no encontrado' });

    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete inventory item
router.delete('/:id', [auth, authorizeRoles('Administrador')], async (req, res) => {
  try {
    const deletedItem = await Inventory.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) return res.status(404).json({ message: 'Medicamento no encontrado' });

    // Console Logging for Auditability
    console.log(`[AUDIT] Administrador ${req.user.email} (ID: ${req.user.id}) ha eliminado el ítem: ${deletedItem.nombreProducto} (Lote: ${deletedItem.lote})`);

    res.json({ message: 'Medicamento eliminado exitosamente', item: deletedItem });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
