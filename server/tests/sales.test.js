const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { connect, clearDatabase, closeDatabase } = require('./db.setup');

// Models
const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');
const Metric = require('../models/Metric');

// Mock Middlewares (auth and roles)
jest.mock('../middlewares/auth', () => (req, res, next) => {
  req.user = { id: new mongoose.Types.ObjectId().toString(), email: 'vendedor@farmacia.com', rol: 'Vendedor' };
  next();
});

jest.mock('../middlewares/roles', () => () => (req, res, next) => next());

// Setup Express app with sales routes
const salesRouter = require('../routes/sales');
const app = express();
app.use(express.json());
app.use('/api/sales', salesRouter);

describe('Sales API Tests', () => {
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
  // Test existente: Venta exitosa con Tarjeta y descuento de stock
  // ─────────────────────────────────────────────────────────────────────────────
  it('Debe procesar una venta exitosa con método Tarjeta y descontar stock', async () => {
    const productId = new mongoose.Types.ObjectId();
    await Inventory.create({
      _id: productId,
      nombreProducto: 'Paracetamol',
      cantidad: 100,
      precio: 500,
      fechaVencimiento: new Date(Date.now() + 86400000 * 30),
      lote: 'LOTE1',
      categoria: 'General'
    });

    const payload = {
      cliente: { nombre: 'Juan Perez', identificacion: '123456' },
      productos: [{ nombreProducto: 'Paracetamol', cantidad: 5 }],
      metodoPago: 'Tarjeta'
    };

    const res = await request(app).post('/api/sales').send(payload);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('numeroFactura');
    expect(res.body.metodoPago).toBe('Tarjeta');

    const updatedInventory = await Inventory.findById(productId);
    expect(updatedInventory.cantidad).toBe(95);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Test existente: Rollback por stock insuficiente
  // ─────────────────────────────────────────────────────────────────────────────
  it('Debe fallar y abortar transacción (rollback) si el stock es insuficiente', async () => {
    const productId = new mongoose.Types.ObjectId();
    await Inventory.create({
      _id: productId,
      nombreProducto: 'Amoxicilina',
      cantidad: 2,
      precio: 1000,
      fechaVencimiento: new Date(Date.now() + 86400000 * 30),
      lote: 'LOTE2',
      categoria: 'Antibiotico'
    });

    const payload = {
      cliente: { nombre: 'Maria Gomez', identificacion: '654321' },
      productos: [{ nombreProducto: 'Amoxicilina', cantidad: 5 }],
      metodoPago: 'Efectivo'
    };

    const res = await request(app).post('/api/sales').send(payload);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toMatch(/Error procesando la venta/);

    const unchangedInventory = await Inventory.findById(productId);
    expect(unchangedInventory.cantidad).toBe(2);

    const salesCount = await Sale.countDocuments();
    expect(salesCount).toBe(0);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Test A (nuevo): Cálculo de cambio exacto en Efectivo
  // ─────────────────────────────────────────────────────────────────────────────
  it('Debe calcular el cambio correctamente al pagar en Efectivo con monto mayor al total', async () => {
    // Create inventory
    await Inventory.create({
      nombreProducto: 'Loratadina 10mg',
      cantidad: 50,
      precio: 2000,
      fechaVencimiento: new Date(Date.now() + 86400000 * 60),
      lote: 'LOTE-LOR-001',
      categoria: 'Antialérgicos'
    });

    // subtotal = 3 * 2000 = 6000
    // impuestos (19%) = 6000 * 0.19 = 1140
    // total = 6000 + 1140 = 7140
    const montoEntregado = 10000;
    const cambioEsperado = montoEntregado - 7140; // 2860

    const payload = {
      cliente: { nombre: 'Carlos López', identificacion: '789012' },
      productos: [{ nombreProducto: 'Loratadina 10mg', cantidad: 3 }],
      metodoPago: 'Efectivo',
      montoEntregado,
      cambio: cambioEsperado
    };

    const res = await request(app).post('/api/sales').send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.metodoPago).toBe('Efectivo');
    expect(res.body.montoEntregado).toBe(montoEntregado);
    expect(res.body.cambio).toBe(cambioEsperado);

    // Verify the math: cambio = montoEntregado - total
    expect(res.body.cambio).toBe(res.body.montoEntregado - res.body.total);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Test B (nuevo): Verificación de descuento exacto de inventario post-venta
  // ─────────────────────────────────────────────────────────────────────────────
  it('Debe descontar del inventario la cantidad exacta vendida tras procesar una venta', async () => {
    const stockInicial = 80;
    const cantidadVendida = 12;

    const productId = new mongoose.Types.ObjectId();
    await Inventory.create({
      _id: productId,
      nombreProducto: 'Omeprazol 20mg',
      cantidad: stockInicial,
      precio: 4500,
      fechaVencimiento: new Date(Date.now() + 86400000 * 90),
      lote: 'LOTE-OME-001',
      categoria: 'Gastrointestinal'
    });

    const payload = {
      cliente: { nombre: 'Ana Martínez', identificacion: '345678' },
      productos: [{ nombreProducto: 'Omeprazol 20mg', cantidad: cantidadVendida }],
      metodoPago: 'Transferencia'
    };

    const res = await request(app).post('/api/sales').send(payload);
    expect(res.statusCode).toBe(201);

    // Verify stock decreased by the exact quantity sold
    const updatedInventory = await Inventory.findById(productId);
    expect(updatedInventory.cantidad).toBe(stockInicial - cantidadVendida);

    // Verify a NUEVA_VENTA metric was created
    const ventaMetric = await Metric.findOne({ metricType: 'NUEVA_VENTA' });
    expect(ventaMetric).not.toBeNull();
    expect(ventaMetric.status).toBe('Éxito');
  });
});
