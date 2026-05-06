const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const salesRouter = require('../routes/sales');
const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');

// Mock Middlewares (auth and roles)
jest.mock('../middlewares/auth', () => (req, res, next) => {
  req.user = { id: new mongoose.Types.ObjectId().toString(), rol: 'Vendedor' };
  next();
});

jest.mock('../middlewares/roles', () => () => (req, res, next) => next());

const app = express();
app.use(express.json());
app.use('/api/sales', salesRouter);

describe('Sales API Tests', () => {
  beforeAll(async () => {
    // Start an in-memory Mongo server or simply mock mongoose if desired.
    // For this example, we'll assume a connection to a test database.
    // Replace the URI with your test DB URI or setup mongodb-memory-server
    const testDbUri = process.env.TEST_DB_URI || 'mongodb://127.0.0.1:27017/farmacia_test';
    await mongoose.connect(testDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Sale.deleteMany({});
    await Inventory.deleteMany({});
  });

  it('Debe procesar una venta exitosa con método Tarjeta y descontar stock', async () => {
    // Setup initial stock
    const productId = new mongoose.Types.ObjectId();
    await Inventory.create({
      _id: productId,
      nombreProducto: 'Paracetamol',
      cantidad: 100,
      precio: 500,
      fechaVencimiento: new Date(Date.now() + 86400000 * 30), // 30 days
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

    // Verificamos que el stock se haya descontado
    const updatedInventory = await Inventory.findById(productId);
    expect(updatedInventory.cantidad).toBe(95);
  });

  it('Debe fallar y abortar transacción (rollback) si el stock es insuficiente', async () => {
    // Setup initial stock
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
      productos: [{ nombreProducto: 'Amoxicilina', cantidad: 5 }], // Stock insuficiente
      metodoPago: 'Efectivo'
    };

    const res = await request(app).post('/api/sales').send(payload);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toMatch(/Error procesando la venta/);

    // Verificamos el rollback: El stock debe permanecer intacto
    const unchangedInventory = await Inventory.findById(productId);
    expect(unchangedInventory.cantidad).toBe(2);

    // Verificamos que no se haya guardado ninguna venta
    const salesCount = await Sale.countDocuments();
    expect(salesCount).toBe(0);
  });
});
