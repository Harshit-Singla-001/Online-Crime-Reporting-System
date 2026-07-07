const mongoose = require('mongoose');

const safetyTipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['cyber safety', 'women safety', 'traffic safety', 'general awareness']
  },
  content: {
    type: String,
    required: true
  },
  short_description: {
    type: String,
    required: true
  },
  likes_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

safetyTipSchema.index({ category: 1 });

module.exports = mongoose.model('SafetyTip', safetyTipSchema);
