const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  districtId: {
    type: String,
    required: true,
    unique: true,
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
  stateCode: {
    type: String,
    required: true
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  population: Number,
  area: Number,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

districtSchema.index({ stateName: 1, districtName: 1 });
districtSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('District', districtSchema);
