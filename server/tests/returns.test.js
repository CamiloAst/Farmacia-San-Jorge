const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { connect, clearDatabase, closeDatabase } = require('./db.setup');

// Models
const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');
const Return = require('../models/Return');
const Metric = require('../models/Metric');

// Mock Middlewares
jest.mock('../middlewares/auth', () => (req, res, next) => {
  req.user = { id: '60d21b4667d0d8992e610c85', email: 'regente@farmacia.com', rol: 'Administrador' };
  next();
});

jest.mock('../middlewares/roles', () => () => (req, res, next) => next());

// Setup Express app with returns and sales routes
const returnsRouter = require('../routes/returns');
const salesRouter = require('../routes/sales');
const app = express();
app.use(express.json());
app.use('/api/returns', returnsRouter);
app.use('/api/sales', salesRouter);

/**
 * Helper: Create a complete sale with inventory so we have a valid invoice to return against.
 * Returns the sale document and the inventory product id.
 */
const createSaleWithInventory = async (productName, stockQty, soldQty, price) => {
  const productId = new mongoose.Types.ObjectId();
  await Inventory.create({
    _id: productId,
    nombreProducto: productName,
    cantidad: stockQty,
    precio: price,
    fechaVencimiento: new Date(Date.now() + 86400000 * 180),
    lote: 'LOTE-TEST-001',
    categoria: 'General'
  });

  // Create the sale via the endpoint (this also decrements stock)
  const saleRes = await request(app).post('/api/sales').send({
    cliente: { nombre: 'Test Client', identificacion: '000000' },
    productos: [{ nombreProducto: productName, cantidad: soldQty }],
    metodoPago: 'Efectivo',
    montoEntregado: price * soldQty * 1.19 + 1000,
    cambio: 1000
  });

  return { sale: saleRes.body, productId };
};

describe('Returns API Tests', () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Test A: Reingreso a Stock (Error de despacho)
  // ─────────────────────────────────────────────────────────────────────────────
  it('Debe reingresar productos al inventario cuando el motivo es "Error de despacho"', async () => {
    const productName = 'Metformina 850mg';
    const stockInicial = 100;
    const cantidadVendida = 10;
    const precio = 5000;

    const { sale, productId } = await createSaleWithInventory(productName, stockInicial, cantidadVendida, precio);
    expect(sale.numeroFactura).toBeDefined();

    // Verify stock was decremented by the sale
    const inventoryAfterSale = await Inventory.findById(productId);
    expect(inventoryAfterSale.cantidad).toBe(stockInicial - cantidadVendida);

    // Process return with "Error de despacho" — should restock
    const returnPayload = {
      numeroFactura: sale.numeroFactura,
      productos: [{ nombreProducto: productName, cantidad: cantidadVendida }],
      motivo: 'Error de despacho'
    };

    const returnRes = await request(app).post('/api/returns').send(returnPayload);

    expect(returnRes.statusCode).toBe(201);
    expect(returnRes.body.returnData.estado).toBe('Aprobada');
    expect(returnRes.body.returnData.motivo).toBe('Error de despacho');

    // Verify inventory INCREASED: a new inventory entry should exist with the returned quantity
    const allInventory = await Inventory.find({ nombreProducto: productName });
    const totalStock = allInventory.reduce((sum, item) => sum + item.cantidad, 0);
    expect(totalStock).toBe(stockInicial); // Should be back to original stock

    // Verify no MERMA_DEVOLUCION metric was created (error de despacho restocks, doesn't count as shrinkage)
    const mermaMetric = await Metric.findOne({ metricType: 'MERMA_DEVOLUCION' });
    expect(mermaMetric).toBeNull();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Test B: Merma (Empaque dañado — NO reingresar a inventario)
  // ─────────────────────────────────────────────────────────────────────────────
  it('Debe NO reingresar productos al inventario y registrar métrica de merma cuando el motivo es "Empaque dañado"', async () => {
    const productName = 'Losartán 50mg';
    const stockInicial = 60;
    const cantidadVendida = 8;
    const precio = 7000;

    const { sale, productId } = await createSaleWithInventory(productName, stockInicial, cantidadVendida, precio);
    expect(sale.numeroFactura).toBeDefined();

    // Stock after sale
    const inventoryAfterSale = await Inventory.findById(productId);
    const stockDespuesVenta = inventoryAfterSale.cantidad;
    expect(stockDespuesVenta).toBe(stockInicial - cantidadVendida);

    // Process return with "Empaque dañado" — should NOT restock
    const returnPayload = {
      numeroFactura: sale.numeroFactura,
      productos: [{ nombreProducto: productName, cantidad: cantidadVendida }],
      motivo: 'Empaque dañado'
    };

    const returnRes = await request(app).post('/api/returns').send(returnPayload);

    expect(returnRes.statusCode).toBe(201);
    expect(returnRes.body.returnData.estado).toBe('Aprobada');

    // Verify stock did NOT increase — only the original inventory entry should exist
    const allInventory = await Inventory.find({ nombreProducto: productName });
    const totalStock = allInventory.reduce((sum, item) => sum + item.cantidad, 0);
    expect(totalStock).toBe(stockDespuesVenta); // Stock remains the same as after the sale

    // Verify a MERMA_DEVOLUCION metric WAS created
    const mermaMetric = await Metric.findOne({ metricType: 'MERMA_DEVOLUCION' });
    expect(mermaMetric).not.toBeNull();
    expect(mermaMetric.domain).toBe('INVENTORY');
    expect(mermaMetric.status).toBe('Advertencia');
    expect(mermaMetric.numericValue).toBe(cantidadVendida);
    expect(mermaMetric.details.motivo).toBe('Empaque dañado');
  });
});
