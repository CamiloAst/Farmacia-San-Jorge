const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const Sale = require('../models/Sale');
const Metric = require('../models/Metric');
const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/roles');
const { sortFEFO } = require('../utils/fefo');

// Helper to generate Invoice Number
const generateInvoiceNumber = async () => {
  const count = await Sale.countDocuments();
  return `FAC-${String(count + 1).padStart(5, '0')}`;
};

// GET /api/sales/search - Obtener productos agrupados para el panel rápido de venta
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    let matchQuery = { cantidad: { $gt: 0 } };
    if (q) {
      matchQuery.nombreProducto = { $regex: q, $options: 'i' };
    }

    const aggregatedInventory = await Inventory.aggregate([
      { $match: matchQuery },
      { 
        $group: { 
          _id: "$nombreProducto", 
          stockGlobal: { $sum: "$cantidad" },
          precio: { $first: "$precio" }, // Tomamos el primer precio (asumiendo que es el mismo para todos los lotes del mismo producto)
          categoria: { $first: "$categoria" }
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    const mappedResult = aggregatedInventory.map(item => ({
      nombreProducto: item._id,
      stockDisponible: item.stockGlobal,
      precio: item.precio,
      categoria: item.categoria
    }));

    res.json(mappedResult);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/sales - Realizar una venta con Transacciones Mongo y FEFO
router.post('/', [auth, authorizeRoles('Vendedor', 'Regente', 'Administrador')], async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cliente, productos } = req.body;
    let subtotalCálculo = 0;
    const finalProductos = [];

    // Validar productos y aplicar FEFO para descontar el stock
    for (const prod of productos) {
      const { nombreProducto, cantidad } = prod;
      
      // Buscar lotes del producto y ordenar con FEFO (el que vence primero va primero)
      const lotesDisponibles = await Inventory.find({ nombreProducto, cantidad: { $gt: 0 } })
                                             .lean()
                                             .session(session);
      
      // Utilizamos la función de utilidad fefo existente o un sort básico
      // (sortFEFO en utilidades probablemente es pura, pero como lo tenemos en objetos plano de mongoose):
      const lotesOrdenadosFEFO = sortFEFO(lotesDisponibles); // Asume que retorna el array ordenado

      // Verificar stock global
      const totalStockAvailable = lotesOrdenadosFEFO.reduce((sum, item) => sum + item.cantidad, 0);
      if (totalStockAvailable < cantidad) {
        throw new Error(`Stock Insuficiente para el producto: ${nombreProducto}. Disponible: ${totalStockAvailable}`);
      }

      let cantidadRestanteDescontar = cantidad;
      let precioUnitarioFijado = lotesOrdenadosFEFO[0].precio || 0;
      let subtotalProducto = cantidad * precioUnitarioFijado;

      for (const lote of lotesOrdenadosFEFO) {
        if (cantidadRestanteDescontar <= 0) break;

        const cantidadADescontar = Math.min(lote.cantidad, cantidadRestanteDescontar);
        
        // Actualizar en base de datos
        await Inventory.findByIdAndUpdate(
          lote._id,
          { $inc: { cantidad: -cantidadADescontar } },
          { session, new: true }
        );

        cantidadRestanteDescontar -= cantidadADescontar;
      }

      subtotalCálculo += subtotalProducto;
      finalProductos.push({
        nombreProducto,
        cantidad,
        precioUnitario: precioUnitarioFijado,
        subtotal: subtotalProducto
      });
    }

    // Calcular totales
    const IMPUESTO_PORCENTAJE = 0.19; // IVA 19%
    const impuestosCálculo = subtotalCálculo * IMPUESTO_PORCENTAJE;
    const totalCálculo = subtotalCálculo + impuestosCálculo;

    const numeroFacturaNuevo = await generateInvoiceNumber();

    // Crear Venta
    const nuevaVenta = new Sale({
      cliente: cliente || { nombre: 'Consumidor Final', identificacion: 'N/A' },
      productos: finalProductos,
      subtotal: subtotalCálculo,
      impuestos: impuestosCálculo,
      total: totalCálculo,
      usuarioVendedor: req.user.id,
      numeroFactura: numeroFacturaNuevo
    });

    const savedSale = await nuevaVenta.save({ session });

    // Registrar en Métricas (opcional pero muy recomendado por la arquitectura)
    await Metric.create([{
      domain: 'SALES',
      metricType: 'NUEVA_VENTA',
      status: 'Éxito',
      numericValue: totalCálculo,
      details: { factura: numeroFacturaNuevo, items: finalProductos.length }
    }], { session });

    // Confirmar Transacción
    await session.commitTransaction();
    session.endSession();

    res.status(201).json(savedSale);
  } catch (err) {
    // Si cualquier error ocurrió (ej., stock insuficiente), deshacer todos los cambios en la DB
    await session.abortTransaction();
    session.endSession();
    console.error('Error en Transacción de Venta:', err.message);
    res.status(400).json({ message: 'Error procesando la venta (Transacción Abortada)', error: err.message });
  }
});

module.exports = router;
