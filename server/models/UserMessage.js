const mongoose = require('mongoose');

const userMessageSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    minlength: 10
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied'],
    default: 'unread'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Indexes
userMessageSchema.index({ user_id: 1 });
userMessageSchema.index({ status: 1 });

module.exports = mongoose.model('UserMessage', userMessageSchema);
