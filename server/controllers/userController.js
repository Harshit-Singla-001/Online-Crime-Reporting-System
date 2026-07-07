const User = require('../models/User');

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password_hash -recovery_key_hash');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve profile', error: error.message });
  }
};

// Edit Profile (One-time only)
exports.editProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if profile was already edited
    if (user.profile_edited) {
      return res.status(400).json({ message: 'You have already edited your profile. It can only be updated once.' });
    }

    const { full_name, phone_number, address } = req.body;

    if (!full_name || !phone_number || !address) {
      return res.status(400).json({ message: 'Full name, phone number, and address are required.' });
    }

    // Update allowed fields
    user.full_name = full_name;
    user.phone_number = phone_number;
    user.address = address;
    user.profile_edited = true;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully. Note: Profile editing is now locked.',
      user: {
        full_name: user.full_name,
        phone_number: user.phone_number,
        address: user.address,
        profile_edited: user.profile_edited
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};
