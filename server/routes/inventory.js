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

module.exports = router;
