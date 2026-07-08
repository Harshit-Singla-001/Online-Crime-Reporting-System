const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Staff = require('../models/Staff');
const FIRRecord = require('../models/FIRRecord');
const FIRPublicRecord = require('../models/FIRPublicRecord');
const { sendEmail } = require('../utils/mailer');

const settingsFilePath = path.join(__dirname, '../config/settings.json');

// Initialize settings file if it doesn't exist
const initSettings = () => {
  const defaultSettings = {
    maintenanceMode: false,
    firSubmission: true,
    userRegistration: true,
    captchaEnabled: true
  };
  const dir = path.dirname(settingsFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(settingsFilePath)) {
    fs.writeFileSync(settingsFilePath, JSON.stringify(defaultSettings, null, 2));
  }
};

const readSettings = () => {
  initSettings();
  try {
    const data = fs.readFileSync(settingsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read settings:', error.message);
    return {
      maintenanceMode: false,
      firSubmission: true,
      userRegistration: true,
      captchaEnabled: true
    };
  }
};

const writeSettings = (settings) => {
  initSettings();
  try {
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to write settings:', error.message);
    return false;
  }
};

// 1. Get Admin Stats
exports.getStats = async (req, res) => {
  try {
    const totalFIRs = await FIRRecord.countDocuments({});
    const pendingFIRs = await FIRRecord.countDocuments({ status: 'Pending' });
    const approvedFIRs = await FIRRecord.countDocuments({ status: 'Approved' });
    const solvedFIRs = await FIRRecord.countDocuments({ status: 'Solved' });
    const rejectedFIRs = await FIRRecord.countDocuments({ status: 'Rejected' });
    const totalUsers = await User.countDocuments({ role: 'user' });

    res.status(200).json({
      totalFIRs,
      pendingFIRs,
      approvedFIRs,
      solvedFIRs,
      rejectedFIRs,
      totalUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve stats', error: error.message });
  }
};

// 2. Manage FIRs (List all)
exports.getAllFIRs = async (req, res) => {
  try {
    const { status, category, city } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (city) query.city = new RegExp(city, 'i');

    const firs = await FIRRecord.find(query)
      .populate('user_id', 'full_name email phone_number')
      .sort({ created_at: -1 });

    res.status(200).json(firs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve FIRs', error: error.message });
  }
};

// 3. Get FIR Details (Admin view)
exports.getAdminFIRDetails = async (req, res) => {
  try {
    const fir = await FIRRecord.findById(req.params.id).populate('user_id', 'full_name email phone_number dob aadhaar_number pan_number address');
    if (!fir) {
      return res.status(404).json({ message: 'FIR not found' });
    }
    res.status(200).json(fir);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve FIR details', error: error.message });
  }
};

// 4. Update FIR (Status & Review)
exports.updateFIRStatus = async (req, res) => {
  try {
    const { status, admin_review } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const fir = await FIRRecord.findById(req.params.id).populate('user_id', 'email full_name');
    if (!fir) {
      return res.status(404).json({ message: 'FIR not found' });
    }

    fir.status = status;
    if (admin_review !== undefined) {
      fir.admin_review = admin_review;
    }
    await fir.save();

    // Sync public record status and review
    await FIRPublicRecord.findOneAndUpdate(
      { fir_id: fir._id },
      { 
        status: status,
        admin_review: admin_review || null
      }
    );

    // Send email notification via nodemailer
    const userEmail = fir.user_id.email;
    const userName = fir.user_id.full_name;
    const emailSubject = `FIR Status Update: ${fir.title}`;
    const emailBody = `Dear ${userName},\n\nThe status of your FIR titled "${fir.title}" has been updated to "${status}".\n\nAdmin Review Comment:\n"${admin_review || 'No review comments provided.'}"\n\nBest Regards,\nOnline Crime Reporting System Team`;
    
    if (userEmail.toLowerCase() !== 'harshitsingla72@gmail.com' && userEmail !== process.env.EMAIL_USER) {
      sendEmail(userEmail, emailSubject, emailBody).catch(err => {
        console.error('Failed to send status update email:', err.message);
      });
    }

    res.status(200).json({ message: 'FIR status updated successfully and user notified.', fir });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update FIR status', error: error.message });
  }
};

// 5. Manage Users (List all)
exports.getAllUsers = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = { role: 'user' };

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { full_name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    // Retrieve users and append FIR count
    const users = await User.find(query).select('-password_hash -recovery_key_hash').sort({ created_at: -1 });
    
    const usersWithCounts = await Promise.all(users.map(async (u) => {
      const firCount = await FIRRecord.countDocuments({ user_id: u._id });
      return {
        ...u.toObject(),
        firCount
      };
    }));

    res.status(200).json(usersWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve users', error: error.message });
  }
};

// 6. Block/Unblock User
exports.toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status === 'blocked') {
      user.status = 'active';
      user.blocked_until = null;
      user.failed_attempts = 0;

      // Notify the user via email that account is active again
      const emailSubject = 'Account Reactivated - Online Crime Reporting System';
      const emailBody = `Dear ${user.full_name},\n\nYour account has been reactivated by the administrator.\nYou can now log in to the portal.\n\nBest Regards,\nOnline Crime Reporting System Team`;
      
      if (user.email.toLowerCase() !== 'harshitsingla72@gmail.com' && user.email !== process.env.EMAIL_USER) {
        sendEmail(user.email, emailSubject, emailBody).catch(emailErr => {
          console.error('Failed to send reactivation notification email:', emailErr);
        });
      }
    } else {
      user.status = 'blocked';
      user.blocked_until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
      
      // Notify the user via email
      const emailSubject = 'Account Blocked - Online Crime Reporting System';
      const emailBody = `Dear ${user.full_name},\n\nYour account has been blocked by the administrator.\nIt will be automatically active again in 7 days.\n\nBest Regards,\nOnline Crime Reporting System Team`;
      
      if (user.email.toLowerCase() !== 'harshitsingla72@gmail.com' && user.email !== process.env.EMAIL_USER) {
        sendEmail(user.email, emailSubject, emailBody).catch(emailErr => {
          console.error('Failed to send block notification email:', emailErr);
        });
      }
    }

    await user.save();
    res.status(200).json({ message: `User status changed to ${user.status}.`, user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user block status', error: error.message });
  }
};

// 7. Get Site Settings
exports.getSettings = (req, res) => {
  try {
    const settings = readSettings();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settings', error: error.message });
  }
};

// 8. Update Site Settings
exports.updateSettings = (req, res) => {
  try {
    const { maintenanceMode, firSubmission, userRegistration, captchaEnabled } = req.body;
    const settings = {
      maintenanceMode: !!maintenanceMode,
      firSubmission: !!firSubmission,
      userRegistration: !!userRegistration,
      captchaEnabled: !!captchaEnabled
    };

    const success = writeSettings(settings);
    if (!success) {
      return res.status(500).json({ message: 'Failed to write settings' });
    }
    res.status(200).json({ message: 'Settings saved successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save settings', error: error.message });
  }
};

// 9. Admin Profile (Get)
exports.getAdminProfile = async (req, res) => {
  try {
    // Check if the current user is a User or Staff
    let account = await Staff.findById(req.user._id).select('-password_hash -recovery_key_hash');
    if (!account) {
      account = await User.findById(req.user._id).select('-password_hash -recovery_key_hash');
    }

    if (!account) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin profile', error: error.message });
  }
};

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

// 10. Update Admin Profile (Unlimited edit)
exports.updateAdminProfile = async (req, res) => {
  try {
    const { full_name, phone_number, dob, address, aadhaar_number, pan_number } = req.body;
    if (!full_name || !phone_number || !dob || !address || !aadhaar_number) {
      return res.status(400).json({ message: 'Name, phone number, date of birth, address, and Aadhaar number are required.' });
    }

    // Name validation
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(full_name)) {
      return res.status(400).json({ message: 'Name must contain only alphabetic characters and spaces.' });
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 numeric digits.' });
    }

    // Age validation
    const age = calculateAge(dob);
    if (age < 13) {
      return res.status(400).json({ message: 'You must be at least 13 years old.' });
    }

    // Aadhaar validation
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(aadhaar_number)) {
      return res.status(400).json({ message: 'Aadhaar number must be exactly 12 numeric digits.' });
    }

    // PAN validation
    if (pan_number) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(pan_number.toUpperCase())) {
        return res.status(400).json({ message: 'PAN Card number must be in a valid format (e.g. ABCDE1234F).' });
      }
    }

    let account = await Staff.findById(req.user._id);
    if (!account) {
      account = await User.findById(req.user._id);
    }

    if (!account) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    // Compare with current data to check if actually changed
    const originalDob = account.dob ? new Date(account.dob).toISOString().split('T')[0] : '';
    const formDob = new Date(dob).toISOString().split('T')[0];
    const isChanged =
      full_name !== account.full_name ||
      phone_number !== account.phone_number ||
      address !== (account.address || '') ||
      formDob !== originalDob ||
      aadhaar_number !== (account.aadhaar_number || '') ||
      (pan_number || null) !== (account.pan_number || null);

    if (!isChanged) {
      return res.status(200).json({
        message: 'No changes were made.',
        user: {
          full_name: account.full_name,
          phone_number: account.phone_number,
          email: account.email,
          role: account.role,
          dob: account.dob,
          address: account.address,
          aadhaar_number: account.aadhaar_number,
          pan_number: account.pan_number,
          updated_at: account.updated_at
        }
      });
    }

    account.full_name = full_name;
    account.phone_number = phone_number;
    account.dob = new Date(dob);
    account.address = address;
    account.aadhaar_number = aadhaar_number;
    account.pan_number = pan_number || null;

    await account.save();

    res.status(200).json({
      message: 'Admin profile updated successfully.',
      user: {
        full_name: account.full_name,
        phone_number: account.phone_number,
        email: account.email,
        role: account.role,
        dob: account.dob,
        address: account.address,
        aadhaar_number: account.aadhaar_number,
        pan_number: account.pan_number,
        updated_at: account.updated_at
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update admin profile', error: error.message });
  }
};

// 11. Delete User Account (Admin only, only if user is blocked)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.status !== 'blocked') {
      return res.status(400).json({ message: 'Only blocked user accounts can be deleted.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User account permanently deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user account', error: error.message });
  }
};
