const User = require('../models/User');

const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

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

    const { full_name, phone_number, address, dob, aadhaar_number, pan_number } = req.body;

    if (!full_name || !phone_number || !address || !dob || !aadhaar_number) {
      return res.status(400).json({ message: 'Name, phone number, address, Date of Birth, and Aadhaar number are required.' });
    }

    // Name validation: Only alphabetic characters and spaces
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(full_name)) {
      return res.status(400).json({ message: 'Name must contain only alphabetic characters and spaces.' });
    }

    // Phone validation: Exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 numeric digits.' });
    }

    // Age validation: Must be at least 13
    const age = calculateAge(dob);
    if (age < 13) {
      return res.status(400).json({ message: 'You must be at least 13 years old.' });
    }

    // Aadhaar validation: Exactly 12 numeric digits
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(aadhaar_number)) {
      return res.status(400).json({ message: 'Aadhaar number must be exactly 12 numeric digits.' });
    }

    // Check if Aadhaar is already registered by another citizen
    const existingAadhaarUser = await User.findOne({ 
      aadhaar_number, 
      _id: { $ne: req.user._id } 
    });
    if (existingAadhaarUser) {
      return res.status(400).json({ message: 'This Aadhaar number is already registered by another citizen.' });
    }

    // PAN validation
    if (pan_number) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(pan_number.toUpperCase())) {
        return res.status(400).json({ message: 'PAN Card number must be in a valid format (e.g. ABCDE1234F).' });
      }
    }

    // Compare with current data to check if actually changed
    const originalDob = user.dob ? new Date(user.dob).toISOString().split('T')[0] : '';
    const formDob = new Date(dob).toISOString().split('T')[0];
    const isChanged =
      full_name !== user.full_name ||
      phone_number !== user.phone_number ||
      address !== user.address ||
      formDob !== originalDob ||
      aadhaar_number !== user.aadhaar_number ||
      (pan_number || null) !== (user.pan_number || null);

    if (!isChanged) {
      return res.status(200).json({
        message: 'No changes were made. Profile remains editable.',
        user: {
          full_name: user.full_name,
          phone_number: user.phone_number,
          address: user.address,
          dob: user.dob,
          aadhaar_number: user.aadhaar_number,
          pan_number: user.pan_number,
          profile_edited: user.profile_edited,
          updated_at: user.updated_at
        }
      });
    }

    // Update allowed fields
    user.full_name = full_name;
    user.phone_number = phone_number;
    user.address = address;
    user.dob = new Date(dob);
    user.aadhaar_number = aadhaar_number;
    user.pan_number = pan_number || null;
    user.profile_edited = true;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully. Note: Profile editing is now locked.',
      user: {
        full_name: user.full_name,
        phone_number: user.phone_number,
        address: user.address,
        dob: user.dob,
        aadhaar_number: user.aadhaar_number,
        pan_number: user.pan_number,
        profile_edited: user.profile_edited,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};
