const mongoose = require('mongoose');

const firPublicRecordSchema = new mongoose.Schema({
  fir_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FIRRecord',
    required: true
  },
  city: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  incident_datetime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Solved', 'Rejected'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  admin_review: {
    type: String,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false } // Only track created_at
});

// Indexes
firPublicRecordSchema.index({ fir_id: 1 });
firPublicRecordSchema.index({ category: 1 });
firPublicRecordSchema.index({ city: 1 });
firPublicRecordSchema.index({ status: 1 });

module.exports = mongoose.model('FIRPublicRecord', firPublicRecordSchema);
