const express = require('express');
const router = express.Router();
const Metrics = require('../models/Metrics');
const District = require('../models/District');

router.post('/', async (req, res) => {
  try {
    const { districtIds, year, month, financialYear, metrics } = req.body;
    
    if (!districtIds || !Array.isArray(districtIds) || districtIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 district IDs are required for comparison'
      });
    }
    
    let query = { districtId: { $in: districtIds } };
    
    if (year) query.year = parseInt(year);
    if (month) query.month = parseInt(month);
    if (financialYear) query.financialYear = financialYear;
    
    const comparisonData = await Metrics.find(query)
      .populate('districtId', 'districtName stateName')
      .sort({ districtId: 1, year: -1, month: -1 });
    
    if (comparisonData.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No data found for the specified districts and criteria'
      });
    }
    
    const groupedData = {};
    comparisonData.forEach(record => {
      const key = record.districtId;
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(record);
    });
    
    const comparison = Object.keys(groupedData).map(districtId => {
      const records = groupedData[districtId];
      const latest = records[0]; // Most recent record
      
      const avgEmploymentRate = records.reduce((sum, r) => sum + (r.employmentRate || 0), 0) / records.length;
      const avgWorkCompletionRate = records.reduce((sum, r) => sum + (r.workCompletionRate || 0), 0) / records.length;
      const avgWagePaymentRate = records.reduce((sum, r) => sum + (r.wagePaymentRate || 0), 0) / records.length;
      
      const totalHouseholds = records.reduce((sum, r) => sum + (r.totalHouseholds || 0), 0);
      const totalPersons = records.reduce((sum, r) => sum + (r.totalPersons || 0), 0);
      const totalWorkdays = records.reduce((sum, r) => sum + (r.totalWorkdays || 0), 0);
      const totalWages = records.reduce((sum, r) => sum + (r.totalWages || 0), 0);
      
      return {
        districtId,
        districtName: latest.districtName,
        stateName: latest.stateName,
        latest: {
          year: latest.year,
          month: latest.month,
          employmentRate: latest.employmentRate,
          workCompletionRate: latest.workCompletionRate,
          wagePaymentRate: latest.wagePaymentRate,
          totalHouseholds: latest.totalHouseholds,
          totalPersons: latest.totalPersons,
          totalWorkdays: latest.totalWorkdays,
          totalWages: latest.totalWages
        },
        averages: {
          employmentRate: Math.round(avgEmploymentRate * 100) / 100,
          workCompletionRate: Math.round(avgWorkCompletionRate * 100) / 100,
          wagePaymentRate: Math.round(avgWagePaymentRate * 100) / 100
        },
        totals: {
          totalHouseholds,
          totalPersons,
          totalWorkdays,
          totalWages
        },
        performanceScore: Math.round(
          (avgEmploymentRate * 0.4) + 
          (avgWorkCompletionRate * 0.3) + 
          (avgWagePaymentRate * 0.3)
        )
      };
    });
    
    comparison.sort((a, b) => b.performanceScore - a.performanceScore);
    
    res.json({
      success: true,
      data: {
        comparison,
        criteria: {
          year,
          month,
          financialYear,
          metrics: metrics || ['employmentRate', 'workCompletionRate', 'wagePaymentRate']
        },
        lastUpdated: comparisonData[0].lastUpdated
      }
    });
  } catch (error) {
    console.error('Error comparing districts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare districts'
    });
  }
});

router.get('/states', async (req, res) => {
  try {
    const { year, month, financialYear } = req.query;
    
    let query = {};
    if (year) query.year = parseInt(year);
    if (month) query.month = parseInt(month);
    if (financialYear) query.financialYear = financialYear;
    
    const stateData = await Metrics.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$stateName',
          totalDistricts: { $sum: 1 },
          avgEmploymentRate: { $avg: '$employmentRate' },
          avgWorkCompletionRate: { $avg: '$workCompletionRate' },
          avgWagePaymentRate: { $avg: '$wagePaymentRate' },
          totalHouseholds: { $sum: '$totalHouseholds' },
          totalPersons: { $sum: '$totalPersons' },
          totalWorkdays: { $sum: '$totalWorkdays' },
          totalWages: { $sum: '$totalWages' },
          lastUpdated: { $max: '$lastUpdated' }
        }
      },
      {
        $addFields: {
          performanceScore: {
            $round: [
              {
                $add: [
                  { $multiply: ['$avgEmploymentRate', 0.4] },
                  { $multiply: ['$avgWorkCompletionRate', 0.3] },
                  { $multiply: ['$avgWagePaymentRate', 0.3] }
                ]
              },
              2
            ]
          }
        }
      },
      { $sort: { performanceScore: -1 } }
    ]);
    
    res.json({
      success: true,
      data: stateData,
      criteria: { year, month, financialYear }
    });
  } catch (error) {
    console.error('Error fetching state comparison:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch state comparison data'
    });
  }
});

router.get('/trends/:districtId', async (req, res) => {
  try {
    const { districtId } = req.params;
    const { months = 12 } = req.query;
    
    const trends = await Metrics.find({ districtId })
      .sort({ year: -1, month: -1 })
      .limit(parseInt(months));
    
    if (trends.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No trend data found for this district'
      });
    }
    
    const chartData = trends.reverse().map(record => ({
      period: `${record.year}-${String(record.month).padStart(2, '0')}`,
      employmentRate: record.employmentRate,
      workCompletionRate: record.workCompletionRate,
      wagePaymentRate: record.wagePaymentRate,
      totalHouseholds: record.totalHouseholds,
      totalPersons: record.totalPersons,
      totalWorkdays: record.totalWorkdays,
      totalWages: record.totalWages
    }));
    
    res.json({
      success: true,
      data: {
        districtId,
        trends: chartData,
        period: `${months} months`
      }
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trend data'
    });
  }
});

module.exports = router;
