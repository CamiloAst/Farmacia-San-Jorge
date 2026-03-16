const express = require('express');
const router = express.Router();
const Metric = require('../models/Metric');
const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/roles');

// Get Metrics Dashboard Data - Only Admin
router.get('/dashboard', [auth, authorizeRoles('Administrador')], async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Reception Success Rate
    const receptionMetrics = await Metric.aggregate([
      { $match: { metricType: 'RECEPCION_TECNICA' } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    let totalReceptions = 0;
    let successfulReceptions = 0;
    
    receptionMetrics.forEach(m => {
      totalReceptions += m.count;
      if (m._id === 'Éxito') successfulReceptions += m.count;
    });
    
    const receptionIntegrityScore = totalReceptions > 0 
      ? ((successfulReceptions / totalReceptions) * 100).toFixed(2) 
      : 100;

    // 2. Historical Alerts Over Last 30 Days (Grouped by Date)
    const alertsHistory = await Metric.aggregate([
      { 
        $match: { 
          metricType: 'ALERTA_STOCK',
          timestamp: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          totalAlerts: { $sum: "$numericValue" } // Sum of products under limit for that date
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Format for Recharts
    const chartData = alertsHistory.map(item => ({
      date: item._id,
      alerts: item.totalAlerts
    }));

    // Generate Payload
    res.json({
      kpis: {
        receptionIntegrity: Number(receptionIntegrityScore),
        totalEventsLast30Days: chartData.reduce((acc, curr) => acc + curr.alerts, 0)
      },
      historicalAlerts: chartData
    });

  } catch (err) {
    res.status(500).json({ message: 'Error processing metrics', error: err.message });
  }
});

module.exports = router;
