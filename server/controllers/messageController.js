const UserMessage = require('../models/UserMessage');

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
    const messages = await UserMessage.find({}).sort({ created_at: -1 });
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
