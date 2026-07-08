const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  phone_number: {
    type: String,
    required: true
  },
  aadhaar_number: {
    type: String,
    default: ''
  },
  pan_number: {
    type: String,
    default: null
  },
  address: {
    type: String,
    default: ''
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
    enum: ['admin'],
    default: 'admin'
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
  last_login: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Staff', staffSchema);
