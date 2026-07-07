const mongoose = require('mongoose');

const firRecordSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Theft', 'Assault', 'Missing Person', 'Cyber Crime', 'Other']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  incident_date: {
    type: Date,
    required: true
  },
  incident_time: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  full_address: {
    type: String,
    required: true
  },
  current_address: {
    type: String,
    required: true
  },
  suspect_description: {
    type: String,
    default: null
  },
  witness_description: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Solved', 'Rejected'],
    default: 'Pending'
  },
  admin_review: {
    type: String,
    default: null
  },
  images: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 3 images'],
    default: []
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

function arrayLimit(val) {
  return val.length <= 3;
}

// Pre-validate hook to calculate priority dynamically based on category
firRecordSchema.pre('validate', function(next) {
  if (this.category) {
    if (this.category === 'Missing Person' || this.category === 'Assault') {
      this.priority = 'High';
    } else if (this.category === 'Theft') {
      this.priority = 'Medium';
    } else {
      this.priority = 'Low';
    }
  }
  if (typeof next === 'function') {
    next();
  }
});

// Indexes
firRecordSchema.index({ user_id: 1 });
firRecordSchema.index({ category: 1 });
firRecordSchema.index({ city: 1 });
firRecordSchema.index({ status: 1 });

module.exports = mongoose.model('FIRRecord', firRecordSchema);
