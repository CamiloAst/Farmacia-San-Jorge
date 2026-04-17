const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const metricsRoutes = require('./routes/metrics');
const salesRoutes = require('./routes/sales');

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

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@farmacia.g5cdshf.mongodb.net/?appName=Farmacia';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    app.use(express.static('dist'));

    app.use(function(req, res) {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
  
