const UserMessage = require('../models/UserMessage');
const User = require('../models/User');

// 1. Submit a Contact/Query Message
exports.submitMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (message.length < 10) {
      return res.status(400).json({ message: 'Message must be at least 10 characters long.' });
    }

    // Capture logged-in user if token is present
    const user_id = req.user ? req.user._id : null;

    const userMessage = await UserMessage.create({
      user_id,
      name,
      email,
      subject,
      message,
      status: 'unread'
    });

    res.status(201).json({
      message: 'Your message has been sent successfully.',
      userMessage
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit message', error: error.message });
  }
};

// 2. Get All Messages (Admin only)
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await UserMessage.find({})
      .populate('user_id', 'full_name email status reports_count')
      .sort({ created_at: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve messages', error: error.message });
  }
};

// 3. Update Message Status (Mark Read/Replied - Admin only)
exports.updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['unread', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const message = await UserMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.status = status;
    await message.save();

    res.status(200).json({ message: `Message marked as ${status}.`, message });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update message status', error: error.message });
  }
};

// 4. Delete Message (Admin only)
exports.deleteMessage = async (req, res) => {
  try {
    const message = await UserMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.status(200).json({ message: 'Message deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete message', error: error.message });
  }
};

// 5. Report User from Message (Admin only)
exports.reportUserFromMessage = async (req, res) => {
  try {
    const message = await UserMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    if (!message.user_id) {
      return res.status(400).json({ message: 'Cannot report an unregistered user/guest.' });
    }

    const user = await User.findById(message.user_id);
    if (!user) {
      return res.status(404).json({ message: 'Associated user account not found.' });
    }

    user.reports_count = (user.reports_count || 0) + 1;
    let autoSuspended = false;
    if (user.reports_count >= 3) {
      user.status = 'suspended';
      user.blocked_until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days suspension
      user.reports_count = 0; // reset reports after suspension
      autoSuspended = true;
    }
    await user.save();

    res.status(200).json({
      message: autoSuspended
        ? `User reported successfully. User has reached 3 reports and has been automatically suspended for 7 days.`
        : `User reported successfully. Report count: ${user.reports_count}/3.`,
      reports_count: user.reports_count,
      status: user.status
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to report user', error: error.message });
  }
};
