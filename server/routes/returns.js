const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Return = require('../models/Return');
const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');
const Metric = require('../models/Metric');
const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/roles');
const { generateInvoiceNumber } = require('../utils/invoice');

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
    
    if (invoice.estado === 'Devuelta') {
      throw new Error('Esta factura ya fue invalidada por una devolución previa.');
    }

    // Invalidar factura original
    invoice.estado = 'Devuelta';
    await invoice.save({ session });

    // Calcular productos restantes
    let remainingProducts = [];
    let returnedProductsLog = [];
    
    for (const orig of invoice.productos) {
      const returnedItem = productos.find(p => p.nombreProducto === orig.nombreProducto);
      if (returnedItem) {
        if (returnedItem.cantidad > orig.cantidad) {
          throw new Error(`Cantidad a devolver supera la vendida para ${orig.nombreProducto}`);
        }
        const remainingQty = orig.cantidad - returnedItem.cantidad;
        if (remainingQty > 0) {
          remainingProducts.push({
            nombreProducto: orig.nombreProducto,
            cantidad: remainingQty,
            precioUnitario: orig.precioUnitario,
            subtotal: orig.precioUnitario * remainingQty
          });
        }
        if (returnedItem.cantidad > 0) {
          returnedProductsLog.push(`${returnedItem.cantidad}x ${orig.nombreProducto}`);
        }
      } else {
        remainingProducts.push({
          nombreProducto: orig.nombreProducto,
          cantidad: orig.cantidad,
          precioUnitario: orig.precioUnitario,
          subtotal: orig.subtotal
        });
      }
    }

    let newInvoice = null;

    if (remainingProducts.length > 0 && returnedProductsLog.length > 0) {
      // Devolución Parcial: Generar nueva factura
      const IMPUESTO_PORCENTAJE = 0.19;
      const newSubtotal = remainingProducts.reduce((acc, curr) => acc + curr.subtotal, 0);
      const newTaxes = Math.round(newSubtotal * IMPUESTO_PORCENTAJE);
      const newTotal = newSubtotal + newTaxes;

      const newInvoiceNumber = await generateInvoiceNumber();

      newInvoice = new Sale({
        cliente: invoice.cliente,
        productos: remainingProducts,
        subtotal: newSubtotal,
        impuestos: newTaxes,
        total: newTotal,
        metodoPago: invoice.metodoPago,
        montoEntregado: invoice.montoEntregado,
        cambio: invoice.montoEntregado - newTotal,
        usuarioVendedor: invoice.usuarioVendedor,
        numeroFactura: newInvoiceNumber,
        notas: `Factura de reemplazo por devolución parcial de ${invoice.numeroFactura}. Artículos restados: ${returnedProductsLog.join(', ')}.`
      });

      await newInvoice.save({ session });
    }

    // Filtrar productos realmente devueltos (cantidad > 0)
    const filteredProductos = productos.filter(p => p.cantidad > 0);
    if (filteredProductos.length === 0) {
      throw new Error('Debe devolver al menos un producto.');
    }

    // Crear el registro de la devolución
    const newReturn = new Return({
      facturaOriginal: invoice._id,
      numeroFactura,
      productos: filteredProductos,
      motivo,
      usuarioAutoriza: req.user.id
    });

    const savedReturn = await newReturn.save({ session });

    // Lógica de Inventario
    if (motivo === 'Error de despacho') {
      // Retornar al inventario: creamos una nueva entrada en el inventario por cada producto devuelto
      for (const prod of filteredProductos) {
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
      const totalDevuelto = filteredProductos.reduce((acc, curr) => acc + curr.cantidad, 0);
      
      await Metric.create([{
        domain: 'INVENTORY',
        metricType: 'MERMA_DEVOLUCION',
        status: 'Advertencia',
        numericValue: totalDevuelto,
        details: { 
          motivo, 
          factura: numeroFactura, 
          productos: filteredProductos, 
          usuarioAutoriza: req.user.email || req.user.id 
        }
      }], { session });
    }

    // Confirmar transacción
    await session.commitTransaction();
    session.endSession();

    let message = 'Devolución procesada exitosamente.';
    if (newInvoice) {
      message += ` Se ha generado la nueva factura ${newInvoice.numeroFactura} por los artículos no devueltos.`;
    } else {
      message += ` La factura ${numeroFactura} ha sido anulada completamente.`;
    }

    res.status(201).json({ message, returnData: savedReturn, newInvoice });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error procesando devolución:', err.message);
    res.status(400).json({ message: 'Error procesando la devolución', error: err.message });
  }
});

module.exports = router;
