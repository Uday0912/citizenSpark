const express = require('express');
const router = express.Router();
const Metrics = require('../models/Metrics');
const District = require('../models/District');

router.get('/status', async (req, res) => {
  try {
    const totalDistricts = await District.countDocuments();
    const totalMetrics = await Metrics.countDocuments();
    
    const latestUpdate = await Metrics.findOne()
      .sort({ lastUpdated: -1 })
      .select('lastUpdated');
    
    const dataByState = await Metrics.aggregate([
      {
        $group: {
          _id: '$stateName',
          count: { $sum: 1 },
          lastUpdated: { $max: '$lastUpdated' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalDistricts,
        totalMetrics,
        latestUpdate: latestUpdate?.lastUpdated,
        dataByState,
        cacheHealth: {
          districts: totalDistricts > 0,
          metrics: totalMetrics > 0,
          recent: latestUpdate ? 
            (Date.now() - latestUpdate.lastUpdated.getTime()) < (24 * 60 * 60 * 1000) : false
        }
      }
    });
  } catch (error) {
    console.error('Error fetching cache status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cache status'
    });
  }
});

router.get('/export', async (req, res) => {
  try {
    const { format = 'json', state, year, month } = req.query;
    
    let query = {};
    if (state) query.stateName = new RegExp(state, 'i');
    if (year) query.year = parseInt(year);
    if (month) query.month = parseInt(month);
    
    const data = await Metrics.find(query)
      .populate('districtId', 'districtName stateName coordinates')
      .sort({ stateName: 1, districtName: 1, year: -1, month: -1 })
      .limit(1000); // Limit for performance
    
    if (format === 'csv') {
      const csvHeaders = [
        'District ID', 'District Name', 'State Name', 'Year', 'Month',
        'Total Households', 'Households Provided Work', 'Total Persons',
        'Persons Provided Work', 'Total Workdays', 'Workdays Generated',
        'Total Wages', 'Wages Paid', 'Employment Rate', 'Work Completion Rate',
        'Wage Payment Rate', 'Last Updated'
      ];
      
      const csvRows = data.map(record => [
        record.districtId,
        record.districtName,
        record.stateName,
        record.year,
        record.month,
        record.totalHouseholds,
        record.householdsProvidedWork,
        record.totalPersons,
        record.personsProvidedWork,
        record.totalWorkdays,
        record.workdaysGenerated,
        record.totalWages,
        record.wagesPaid,
        record.employmentRate,
        record.workCompletionRate,
        record.wagePaymentRate,
        record.lastUpdated.toISOString()
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="mgnrega_data.csv"');
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        data: {
          records: data,
          count: data.length,
          exportedAt: new Date().toISOString(),
          criteria: { state, year, month }
        }
      });
    }
  } catch (error) {
    console.error('Error exporting cached data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export cached data'
    });
  }
});

router.delete('/clear', async (req, res) => {
  try {
    const { confirm } = req.body;
    
    if (confirm !== 'CLEAR_CACHE') {
      return res.status(400).json({
        success: false,
        error: 'Confirmation required. Send { "confirm": "CLEAR_CACHE" }'
      });
    }
    
    const metricsResult = await Metrics.deleteMany({});
    const districtsResult = await District.deleteMany({});
    
    res.json({
      success: true,
      message: 'Cache cleared successfully',
      deleted: {
        metrics: metricsResult.deletedCount,
        districts: districtsResult.deletedCount
      }
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

router.get('/freshness', async (req, res) => {
  try {
    const freshness = await Metrics.aggregate([
      {
        $group: {
          _id: null,
          oldest: { $min: '$lastUpdated' },
          newest: { $max: '$lastUpdated' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const stateFreshness = await Metrics.aggregate([
      {
        $group: {
          _id: '$stateName',
          oldest: { $min: '$lastUpdated' },
          newest: { $max: '$lastUpdated' },
          count: { $sum: 1 }
        }
      },
      { $sort: { newest: -1 } }
    ]);
    
    const now = new Date();
    const dataAge = freshness[0] ? 
      Math.floor((now - freshness[0].newest.getTime()) / (1000 * 60 * 60)) : null;
    
    res.json({
      success: true,
      data: {
        overall: {
          oldest: freshness[0]?.oldest,
          newest: freshness[0]?.newest,
          count: freshness[0]?.count,
          ageInHours: dataAge,
          isStale: dataAge > 24
        },
        byState: stateFreshness
      }
    });
  } catch (error) {
    console.error('Error fetching freshness info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch freshness information'
    });
  }
});

module.exports = router;
