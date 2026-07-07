const mongoose = require('mongoose');

const userTipVoteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tip_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SafetyTip',
    required: true
  },
  vote_type: {
    type: String,
    enum: ['like', 'dislike'],
    required: true
  }
}, {
  timestamps: { createdAt: false, updatedAt: 'updated_at' }
});

// Compound unique index so a user can vote at most once per tip
userTipVoteSchema.index({ user_id: 1, tip_id: 1 }, { unique: true });

module.exports = mongoose.model('UserTipVote', userTipVoteSchema);
