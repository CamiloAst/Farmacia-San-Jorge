const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { connect, clearDatabase, closeDatabase } = require('./db.setup');

// Models
const Inventory = require('../models/Inventory');
const Metric = require('../models/Metric');

// Mock Middlewares (auth and roles) — bypass authentication for testing
jest.mock('../middlewares/auth', () => (req, res, next) => {
  req.user = { id: new mongoose.Types.ObjectId().toString(), email: 'test@farmacia.com', rol: 'Administrador' };
  next();
});

jest.mock('../middlewares/roles', () => () => (req, res, next) => next());

// Setup Express app with inventory routes
const inventoryRouter = require('../routes/inventory');
const app = express();
app.use(express.json());
app.use('/api/inventory', inventoryRouter);

describe('Inventory API Tests', () => {
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
  // Test A: Crear producto con lote y fecha de vencimiento
  // ─────────────────────────────────────────────────────────────────────────────
  it('Debe crear un producto correctamente con lote y fecha de vencimiento (POST /api/inventory/entry)', async () => {
    const fechaVencimiento = new Date('2027-06-15').toISOString();

    const payload = {
      nombreProducto: 'Ibuprofeno 400mg',
      cantidad: 50,
      lote: 'LOTE-IBU-001',
      fechaVencimiento,
      precio: 3500,
      categoria: 'Analgésicos'
    };

    const res = await request(app)
      .post('/api/inventory/entry')
      .send(payload);

    // Verify HTTP response
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.nombreProducto).toBe('Ibuprofeno 400mg');
    expect(res.body.cantidad).toBe(50);
    expect(res.body.lote).toBe('LOTE-IBU-001');
    expect(res.body.fechaVencimiento).toBeDefined();
    expect(res.body.precio).toBe(3500);
    expect(res.body.categoria).toBe('Analgésicos');

    // Verify product persisted in DB
    const productInDb = await Inventory.findById(res.body._id);
    expect(productInDb).not.toBeNull();
    expect(productInDb.lote).toBe('LOTE-IBU-001');
    expect(new Date(productInDb.fechaVencimiento).toISOString()).toBe(fechaVencimiento);

    // Verify a success metric was recorded
    const metric = await Metric.findOne({ metricType: 'RECEPCION_TECNICA', status: 'Éxito' });
    expect(metric).not.toBeNull();
    expect(metric.numericValue).toBe(50);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Test B: Alerta de stock bajo
  // ─────────────────────────────────────────────────────────────────────────────
  it('Debe devolver alerta de stock bajo cuando el stock de un producto está por debajo del umbral mínimo (GET /api/inventory/alerts)', async () => {
    // Create a product with stock BELOW the minimum threshold (MINIMUM_STOCK = 10)
    await Inventory.create({
      nombreProducto: 'Amoxicilina 500mg',
      cantidad: 5, // Below the threshold of 10
      lote: 'LOTE-AMX-001',
      fechaVencimiento: new Date('2027-12-01'),
      precio: 8000,
      categoria: 'Antibióticos'
    });

    // Create another product with stock ABOVE the threshold (should NOT appear in alerts)
    await Inventory.create({
      nombreProducto: 'Acetaminofén 500mg',
      cantidad: 100, // Well above threshold
      lote: 'LOTE-ACE-001',
      fechaVencimiento: new Date('2028-01-15'),
      precio: 2000,
      categoria: 'Analgésicos'
    });

    const res = await request(app)
      .get('/api/inventory/alerts');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // Only Amoxicilina should appear (stock 5 < 10)
    expect(res.body.length).toBe(1);
    expect(res.body[0]._id).toBe('Amoxicilina 500mg');
    expect(res.body[0].totalStock).toBe(5);

    // Verify that a stock alert metric was recorded
    const alertMetric = await Metric.findOne({ metricType: 'ALERTA_STOCK' });
    expect(alertMetric).not.toBeNull();
    expect(alertMetric.status).toBe('Advertencia');
    expect(alertMetric.numericValue).toBe(1); // 1 product under threshold
  });
});
