const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  fir_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FIRRecord',
    default: null
  },
  reason: {
    type: String,
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Custom validation to ensure at least one target is defined
reportSchema.pre('validate', function(next) {
  if (!this.user_id && !this.fir_id) {
    next(new Error('At least one of user_id or fir_id must be present'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Report', reportSchema);
