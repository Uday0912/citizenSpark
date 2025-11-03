const mongoose = require('mongoose');

const metricsSchema = new mongoose.Schema({
  districtId: {
    type: String,
    required: true,
    index: true
  },
  districtName: {
    type: String,
    required: true,
    index: true
  },
  stateName: {
    type: String,
    required: true,
    index: true
  },
  year: {
    type: Number,
    required: true,
    index: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
    index: true
  },
  financialYear: {
    type: String,
    required: true,
    index: true
  },
  totalHouseholds: {
    type: Number,
    default: 0
  },
  householdsDemandedWork: {
    type: Number,
    default: 0
  },
  householdsProvidedWork: {
    type: Number,
    default: 0
  },
  totalPersons: {
    type: Number,
    default: 0
  },
  personsDemandedWork: {
    type: Number,
    default: 0
  },
  personsProvidedWork: {
    type: Number,
    default: 0
  },
  totalWorkdays: {
    type: Number,
    default: 0
  },
  workdaysGenerated: {
    type: Number,
    default: 0
  },
  totalWages: {
    type: Number,
    default: 0
  },
  wagesPaid: {
    type: Number,
    default: 0
  },
  materialCost: {
    type: Number,
    default: 0
  },
  administrativeCost: {
    type: Number,
    default: 0
  },
  employmentRate: {
    type: Number,
    default: 0
  },
  workCompletionRate: {
    type: Number,
    default: 0
  },
  wagePaymentRate: {
    type: Number,
    default: 0
  },
  dataSource: {
    type: String,
    default: 'data.gov.in'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

metricsSchema.index({ districtId: 1, year: 1, month: 1 });
metricsSchema.index({ stateName: 1, year: 1, month: 1 });
metricsSchema.index({ financialYear: 1, districtId: 1 });
metricsSchema.index({ lastUpdated: -1 });

metricsSchema.virtual('performanceScore').get(function() {
  const employmentWeight = 0.4;
  const workWeight = 0.3;
  const wageWeight = 0.3;
  
  return Math.round(
    (this.employmentRate * employmentWeight) +
    (this.workCompletionRate * workWeight) +
    (this.wagePaymentRate * wageWeight)
  );
});

metricsSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Metrics', metricsSchema);
