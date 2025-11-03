const express = require('express');
const router = express.Router();
const District = require('../models/District');
const Metrics = require('../models/Metrics');
const { fetchDataFromAPI } = require('../utils/fetchData');

router.get('/', async (req, res) => {
  try {
    const { state, search, limit = 50, page = 1 } = req.query;
    
    let query = {};
    
    if (state) {
      query.stateName = new RegExp(state, 'i');
    }
    
    if (search) {
      query.$or = [
        { districtName: new RegExp(search, 'i') },
        { stateName: new RegExp(search, 'i') }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const districts = await District.find(query)
      .select('districtId districtName stateName stateCode coordinates')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ stateName: 1, districtName: 1 });
    
    const total = await District.countDocuments(query);
    
    res.json({
      success: true,
      data: districts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch districts'
    });
  }
});

router.get('/:id/performance', async (req, res) => {
  try {
    const { id } = req.params;
    const { year, month, financialYear } = req.query;
    
    let query = { districtId: id };
    
    if (year) query.year = parseInt(year);
    if (month) query.month = parseInt(month);
    if (financialYear) query.financialYear = financialYear;
    
    const metrics = await Metrics.find(query)
      .sort({ year: -1, month: -1 })
      .limit(12); // Last 12 months of data
    
    if (metrics.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No performance data found for this district'
      });
    }
    
    const summary = {
      totalHouseholds: metrics.reduce((sum, m) => sum + (m.totalHouseholds || 0), 0),
      householdsProvidedWork: metrics.reduce((sum, m) => sum + (m.householdsProvidedWork || 0), 0),
      totalPersons: metrics.reduce((sum, m) => sum + (m.totalPersons || 0), 0),
      personsProvidedWork: metrics.reduce((sum, m) => sum + (m.personsProvidedWork || 0), 0),
      totalWorkdays: metrics.reduce((sum, m) => sum + (m.totalWorkdays || 0), 0),
      workdaysGenerated: metrics.reduce((sum, m) => sum + (m.workdaysGenerated || 0), 0),
      totalWages: metrics.reduce((sum, m) => sum + (m.totalWages || 0), 0),
      wagesPaid: metrics.reduce((sum, m) => sum + (m.wagesPaid || 0), 0),
      averageEmploymentRate: metrics.reduce((sum, m) => sum + (m.employmentRate || 0), 0) / metrics.length,
      averageWorkCompletionRate: metrics.reduce((sum, m) => sum + (m.workCompletionRate || 0), 0) / metrics.length,
      averageWagePaymentRate: metrics.reduce((sum, m) => sum + (m.wagePaymentRate || 0), 0) / metrics.length
    };
    
    res.json({
      success: true,
      data: {
        district: await District.findOne({ districtId: id }).select('districtName stateName'),
        metrics,
        summary,
        lastUpdated: metrics[0].lastUpdated
      }
    });
  } catch (error) {
    console.error('Error fetching district performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch district performance data'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const district = await District.findOne({ districtId: id });
    
    if (!district) {
      return res.status(404).json({
        success: false,
        error: 'District not found'
      });
    }
    
    res.json({
      success: true,
      data: district
    });
  } catch (error) {
    console.error('Error fetching district:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch district details'
    });
  }
});

router.post('/sync', async (req, res) => {
  try {
    const { force = false } = req.body;
    
    if (!force) {
      const recentData = await Metrics.findOne({
        lastUpdated: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      
      if (recentData) {
        return res.json({
          success: true,
          message: 'Data is already up to date',
          lastUpdated: recentData.lastUpdated
        });
      }
    }
    
    const apiData = await fetchDataFromAPI();
    
    if (!apiData || apiData.length === 0) {
      return res.status(503).json({
        success: false,
        error: 'No data available from API'
      });
    }
    
    let processedCount = 0;
    let errorCount = 0;
    
    for (const record of apiData) {
      try {
        await Metrics.findOneAndUpdate(
          {
            districtId: record.districtId,
            year: record.year,
            month: record.month
          },
          record,
          { upsert: true, new: true }
        );
        processedCount++;
      } catch (error) {
        console.error('Error processing record:', error);
        errorCount++;
      }
    }
    
    res.json({
      success: true,
      message: 'Data synchronization completed',
      processed: processedCount,
      errors: errorCount,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error syncing data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync data from API'
    });
  }
});

module.exports = router;
