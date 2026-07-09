const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  aadhaar_number: {
    type: String,
    required: true,
    unique: true
  },
  pan_number: {
    type: String,
    default: null
  },
  address: {
    type: String,
    required: true
  },
  phone_number: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password_hash: {
    type: String,
    required: true
  },
  recovery_key_hash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'blocked'],
    default: 'active'
  },
  failed_attempts: {
    type: Number,
    default: 0
  },
  blocked_until: {
    type: Date,
    default: null
  },
  last_login: {
    type: Date,
    default: null
  },
  profile_edited: {
    type: Boolean,
    default: false
  },
  reports_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes
userSchema.index({ phone_number: 1 });

module.exports = mongoose.model('User', userSchema);
