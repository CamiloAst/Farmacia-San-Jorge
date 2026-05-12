const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { connect, clearDatabase, closeDatabase } = require('./db.setup');

// Models
const Metric = require('../models/Metric');

// Mock Middlewares
jest.mock('../middlewares/auth', () => (req, res, next) => {
  req.user = { id: new mongoose.Types.ObjectId().toString(), email: 'admin@farmacia.com', rol: 'Administrador' };
  next();
});

jest.mock('../middlewares/roles', () => () => (req, res, next) => next());

// Setup Express app with metrics routes
const metricsRouter = require('../routes/metrics');
const app = express();
app.use(express.json());
app.use('/api/metrics', metricsRouter);

describe('Metrics Dashboard API Tests', () => {
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
  // Test A: JSON estructurado con totalVentas y conteoMermas
  // ─────────────────────────────────────────────────────────────────────────────
  it('Debe devolver un JSON estructurado con totalVentas y conteoMermas (GET /api/metrics/dashboard)', async () => {
    // Seed metrics data: simulate 3 completed sales
    await Metric.create([
      {
        domain: 'SALES',
        metricType: 'NUEVA_VENTA',
        status: 'Éxito',
        numericValue: 15000,
        details: { factura: 'FAC-00001', items: 2 }
      },
      {
        domain: 'SALES',
        metricType: 'NUEVA_VENTA',
        status: 'Éxito',
        numericValue: 8500,
        details: { factura: 'FAC-00002', items: 1 }
      },
      {
        domain: 'SALES',
        metricType: 'NUEVA_VENTA',
        status: 'Éxito',
        numericValue: 22000,
        details: { factura: 'FAC-00003', items: 3 }
      }
    ]);

    // Seed metrics data: simulate 2 shrinkage events (mermas)
    await Metric.create([
      {
        domain: 'INVENTORY',
        metricType: 'MERMA_DEVOLUCION',
        status: 'Advertencia',
        numericValue: 5,
        details: { motivo: 'Vencimiento', factura: 'FAC-00010' }
      },
      {
        domain: 'INVENTORY',
        metricType: 'MERMA_DEVOLUCION',
        status: 'Advertencia',
        numericValue: 3,
        details: { motivo: 'Empaque dañado', factura: 'FAC-00011' }
      }
    ]);

    // Seed a reception metric (for receptionIntegrity KPI)
    await Metric.create({
      domain: 'INVENTORY',
      metricType: 'RECEPCION_TECNICA',
      status: 'Éxito',
      numericValue: 100,
      details: { producto: 'Test Product' }
    });

    const res = await request(app).get('/api/metrics/dashboard');

    expect(res.statusCode).toBe(200);

    // Validate structure
    expect(res.body).toHaveProperty('kpis');
    expect(res.body).toHaveProperty('historicalAlerts');
    expect(res.body.kpis).toHaveProperty('receptionIntegrity');
    expect(res.body.kpis).toHaveProperty('totalEventsLast30Days');
    expect(res.body.kpis).toHaveProperty('totalVentas');
    expect(res.body.kpis).toHaveProperty('conteoMermas');

    // Validate values
    // totalVentas = 15000 + 8500 + 22000 = 45500
    expect(res.body.kpis.totalVentas).toBe(45500);

    // conteoMermas = 2 MERMA_DEVOLUCION documents
    expect(res.body.kpis.conteoMermas).toBe(2);

    // receptionIntegrity should be 100% (1 success, 0 failures)
    expect(res.body.kpis.receptionIntegrity).toBe(100);
  });
});
