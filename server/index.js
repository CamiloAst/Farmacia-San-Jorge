const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const metricsRoutes = require('./routes/metrics');
const salesRoutes = require('./routes/sales');
const invoiceRoutes = require('./routes/invoices');
const returnRoutes = require('./routes/returns');

const app = express();

const path = require('path');


app.use(cors({
  origin: [
    'http://farmaciasanjorge.ddns.net',
    'https://farmaciasanjorge.ddns.net',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/returns', returnRoutes);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@farmacia.g5cdshf.mongodb.net/?appName=Farmacia';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    // Prometheus metrics endpoint
    app.get('/metrics', async (req, res) => {
      res.set('Content-Type', client.register.contentType);
      res.end(await client.register.metrics());
    });

    app.use(express.static('dist'));

    app.use(function(req, res) {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

