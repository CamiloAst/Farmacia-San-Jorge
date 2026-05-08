const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Return = require('../models/Return');
const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');
const Metric = require('../models/Metric');
const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/roles');

// POST /api/returns - Procesar una devolución
router.post('/', [auth, authorizeRoles('Regente', 'Administrador')], async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { numeroFactura, productos, motivo } = req.body;

    const invoice = await Sale.findOne({ numeroFactura }).session(session);
    if (!invoice) {
      throw new Error('Factura no encontrada');
    }

    // Crear el registro de la devolución
    const newReturn = new Return({
      facturaOriginal: invoice._id,
      numeroFactura,
      productos,
      motivo,
      usuarioAutoriza: req.user.id
    });

    const savedReturn = await newReturn.save({ session });

    // Lógica de Inventario
    if (motivo === 'Error de despacho') {
      // Retornar al inventario: creamos una nueva entrada en el inventario por cada producto devuelto
      for (const prod of productos) {
        // Encontramos el producto original en la venta para obtener su precio (o usamos 0)
        const saleProduct = invoice.productos.find(p => p.nombreProducto === prod.nombreProducto);
        const precioUnitario = saleProduct ? saleProduct.precioUnitario : 0;

        const newInventoryEntry = new Inventory({
          nombreProducto: prod.nombreProducto,
          cantidad: prod.cantidad,
          lote: 'DEV-' + numeroFactura,
          fechaVencimiento: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year approx
          precio: precioUnitario,
          categoria: 'General', // Default
          estado: 'APPROVED'
        });
        
        await newInventoryEntry.save({ session });
      }
    } else {
      // Motivos: 'Vencimiento', 'Empaque dañado', 'Otro'
      // Registrar obligatoriamente en el dashboard persistente de MongoDB como Métrica
      const totalDevuelto = productos.reduce((acc, curr) => acc + curr.cantidad, 0);
      
      await Metric.create([{
        domain: 'INVENTORY',
        metricType: 'MERMA_DEVOLUCION',
        status: 'Advertencia',
        numericValue: totalDevuelto,
        details: { 
          motivo, 
          factura: numeroFactura, 
          productos: productos, 
          usuarioAutoriza: req.user.email || req.user.id 
        }
      }], { session });
    }

    // Confirmar transacción
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Devolución procesada exitosamente', returnData: savedReturn });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error procesando devolución:', err.message);
    res.status(400).json({ message: 'Error procesando la devolución', error: err.message });
  }
});

module.exports = router;
