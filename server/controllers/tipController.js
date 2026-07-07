const SafetyTip = require('../models/SafetyTip');
const UserTipVote = require('../models/UserTipVote');

// 1. Get All Tips
exports.getAllTips = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
        { short_description: new RegExp(search, 'i') }
      ];
    }

    const tips = await SafetyTip.find(query).sort({ created_at: -1 });

    // If a user is logged in, we can also check their specific votes
    res.status(200).json(tips);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve safety tips', error: error.message });
  }
};

// 2. Get Single Tip & Related Tips
exports.getTipDetails = async (req, res) => {
  try {
    const tip = await SafetyTip.findById(req.params.id);
    if (!tip) {
      return res.status(404).json({ message: 'Safety tip not found' });
    }

    // Fetch related tips (same category, excluding current tip, sorted by likes_count descending)
    const related = await SafetyTip.find({
      category: tip.category,
      _id: { $ne: tip._id }
    })
      .sort({ likes_count: -1 })
      .limit(5);

    res.status(200).json({ tip, related });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve tip details', error: error.message });
  }
};

// 3. Vote on Tip (Like/Dislike)
exports.voteTip = async (req, res) => {
  try {
    const { vote_type } = req.body;
    const tipId = req.params.id;
    const userId = req.user._id;

    if (!['like', 'dislike'].includes(vote_type)) {
      return res.status(400).json({ message: 'Invalid vote type. Must be like or dislike.' });
    }

    const tip = await SafetyTip.findById(tipId);
    if (!tip) {
      return res.status(404).json({ message: 'Safety tip not found' });
    }

    // Check if vote already exists
    const existingVote = await UserTipVote.findOne({ user_id: userId, tip_id: tipId });

    if (existingVote) {
      // If vote type is changing
      if (existingVote.vote_type !== vote_type) {
        existingVote.vote_type = vote_type;
        await existingVote.save();

        // Recalculate likes count
        if (vote_type === 'like') {
          tip.likes_count = (tip.likes_count || 0) + 1;
        } else {
          tip.likes_count = Math.max(0, (tip.likes_count || 0) - 1);
        }
        await tip.save();
      }
    } else {
      // New vote
      await UserTipVote.create({
        user_id: userId,
        tip_id: tipId,
        vote_type
      });

      if (vote_type === 'like') {
        tip.likes_count = (tip.likes_count || 0) + 1;
        await tip.save();
      }
    }

    // Return updated tip details and user's vote status
    res.status(200).json({ message: 'Vote recorded successfully', likes_count: tip.likes_count, vote_type });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record vote', error: error.message });
  }
};

// 4. Create Tip (Admin only)
exports.createTip = async (req, res) => {
  try {
    const { title, category, content, short_description } = req.body;
    if (!title || !category || !content || !short_description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const tip = await SafetyTip.create({
      title,
      category,
      content,
      short_description
    });

    res.status(201).json({ message: 'Safety tip created successfully', tip });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create safety tip', error: error.message });
  }
};

// 5. Edit Tip (Admin only)
exports.updateTip = async (req, res) => {
  try {
    const { title, category, content, short_description } = req.body;
    const tip = await SafetyTip.findById(req.params.id);
    if (!tip) {
      return res.status(404).json({ message: 'Safety tip not found' });
    }

    if (title) tip.title = title;
    if (category) tip.category = category;
    if (content) tip.content = content;
    if (short_description) tip.short_description = short_description;

    await tip.save();
    res.status(200).json({ message: 'Safety tip updated successfully', tip });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update safety tip', error: error.message });
  }
};

// 6. Delete Tip (Admin only)
exports.deleteTip = async (req, res) => {
  try {
    const tip = await SafetyTip.findById(req.params.id);
    if (!tip) {
      return res.status(404).json({ message: 'Safety tip not found' });
    }

    await SafetyTip.deleteOne({ _id: tip._id });
    // Clean up votes
    await UserTipVote.deleteMany({ tip_id: tip._id });

    res.status(200).json({ message: 'Safety tip deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete safety tip', error: error.message });
  }
};

// 7. Get user's vote for specific tip
exports.getVoteStatus = async (req, res) => {
  try {
    const vote = await UserTipVote.findOne({ user_id: req.user._id, tip_id: req.params.id });
    res.status(200).json({ vote_type: vote ? vote.vote_type : null });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get vote status', error: error.message });
  }
};
