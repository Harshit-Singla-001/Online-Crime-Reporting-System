const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Staff = require('../models/Staff');
const { generateCaptcha, validateCaptcha } = require('../utils/captcha');
const { sendEmail } = require('../utils/mailer');
const { generateRecoveryWords, WORDS_POOL } = require('../utils/recovery');

// Helper to encrypt recovery key (since we need to retrieve it for the drag-and-drop word pool)
const ENCRYPTION_KEY = process.env.JWT_SECRET.padEnd(32, '0').substring(0, 32);
const IV_LENGTH = 16;

const encryptKey = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decryptKey = (text) => {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return null;
  }
};

// Calculate age from DOB
const calculateAge = (dobString) => {
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Password validator helper
const isStrongPassword = (password) => {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
};

// 1. Get Captcha
exports.getCaptcha = (req, res) => {
  try {
    const { captchaSvg, captchaToken } = generateCaptcha();
    res.status(200).json({ captchaSvg, captchaToken });
  } catch (error) {
    res.status(500).json({ message: 'Error generating CAPTCHA', error: error.message });
  }
};

// 2. Signup Step 1
exports.signupStep1 = async (req, res) => {
  try {
    const { full_name, dob, address, phone_number, email } = req.body;

    if (!full_name || !dob || !address || !phone_number || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    const age = calculateAge(dob);
    let aadhaar_number = req.body.aadhaar_number;
    let pan_number = req.body.pan_number;

    if (!aadhaar_number) {
      return res.status(400).json({ message: 'Aadhaar number is required.' });
    }



    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send OTP via mail
    await sendEmail(
      email,
      'Email Verification Code - Online Crime Reporting System',
      `Your verification code is: ${otp}\nThis code is valid for 10 minutes.`
    );

    // Sign a temporary token containing step 1 data and the otp
    const signupData = {
      full_name,
      dob,
      address,
      phone_number,
      email,
      aadhaar_number,
      pan_number: age >= 18 ? (pan_number || null) : null,
      otp,
      age
    };

    const signupToken = jwt.sign(signupData, process.env.JWT_SECRET, { expiresIn: '10m' });

    res.status(200).json({
      message: 'OTP sent to email. Please verify.',
      signupToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Signup Step 1 failed', error: error.message });
  }
};

// 3. Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { otp, signupToken } = req.body;

    if (!otp || !signupToken) {
      return res.status(400).json({ message: 'OTP and token are required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(signupToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Signup session expired. Please sign up again.' });
    }

    if (decoded.otp !== otp) {
      return res.status(400).json({ message: 'Incorrect OTP. Verification failed.' });
    }

    // Generate a verified token (expires in 10 minutes)
    const verifiedData = { ...decoded, otp_verified: true };
    delete verifiedData.otp; // remove OTP from payload
    delete verifiedData.exp;
    delete verifiedData.iat;

    const verifiedToken = jwt.sign(verifiedData, process.env.JWT_SECRET, { expiresIn: '10m' });

    res.status(200).json({
      message: 'OTP verified successfully.',
      verifiedToken
    });
  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
};

// 4. Complete Signup
exports.completeSignup = async (req, res) => {
  try {
    const { password, confirmPassword, verifiedToken } = req.body;

    if (!password || !confirmPassword || !verifiedToken) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and contain 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(verifiedToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Verification session expired. Please verify OTP again.' });
    }

    if (!decoded.otp_verified) {
      return res.status(400).json({ message: 'Email has not been verified.' });
    }

    // Check if email was registered in the meantime
    const checkUser = await User.findOne({ email: decoded.email });
    if (checkUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Generate Recovery Words
    const recoveryWords = generateRecoveryWords();
    const recoveryKeyString = recoveryWords.join(' ');
    
    // Hash password & Encrypt recovery key
    const password_hash = await bcrypt.hash(password, 12);
    const recovery_key_hash = encryptKey(recoveryKeyString);

    // Create User
    const newUser = await User.create({
      full_name: decoded.full_name,
      dob: new Date(decoded.dob),
      aadhaar_number: decoded.aadhaar_number,
      pan_number: decoded.pan_number,
      address: decoded.address,
      phone_number: decoded.phone_number,
      email: decoded.email,
      password_hash,
      recovery_key_hash,
      role: 'user',
      status: 'active'
    });

    // Generate login token
    const token = jwt.sign(
      { user_id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({
      message: 'Signup completed successfully.',
      recoveryWords, // Send to client for displaying once
      user: {
        _id: newUser._id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete signup', error: error.message });
  }
};

// 5. Login
exports.login = async (req, res) => {
  try {
    const { email, password, captchaAnswer, captchaToken } = req.body;

    if (!email || !password || !captchaAnswer || !captchaToken) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Validate CAPTCHA
    if (!validateCaptcha(captchaAnswer, captchaToken)) {
      return res.status(400).json({ message: 'Incorrect or expired CAPTCHA code.' });
    }

    // Look for user in Users first, then Staff
    let account = await User.findOne({ email });
    let isStaff = false;

    if (!account) {
      account = await Staff.findOne({ email });
      if (account) {
        isStaff = true;
      }
    }

    if (!account) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check block status
    if (account.status === 'blocked' || account.status === 'suspended') {
      if (account.blocked_until && new Date() > account.blocked_until) {
        // Auto-unblock after 1 week
        account.status = 'active';
        account.failed_attempts = 0;
        account.blocked_until = null;
        await account.save();
      } else {
        const timeMessage = account.blocked_until 
          ? `Try again after ${account.blocked_until.toLocaleString()}`
          : 'Please contact support.';
        return res.status(403).json({ 
          message: `Account is ${account.status}. ${timeMessage}` 
        });
      }
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, account.password_hash);
    if (!isMatch) {
      // Increment failed attempts
      account.failed_attempts = (account.failed_attempts || 0) + 1;
      if (account.failed_attempts >= 5) {
        account.status = 'blocked';
        account.blocked_until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days block
        await account.save();
        return res.status(403).json({ 
          message: 'Account blocked due to 5 failed login attempts. Try again after 1 week.' 
        });
      }
      await account.save();
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Successful Login
    account.failed_attempts = 0;
    account.blocked_until = null;
    account.last_login = new Date();
    await account.save();

    // Generate JWT
    const token = jwt.sign(
      { user_id: account._id, email: account.email, role: account.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: account._id,
        full_name: account.full_name,
        email: account.email,
        role: account.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// 6. Forgot Password (Initiate)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'This email is not registered.' });
    }

    res.status(200).json({
      message: 'Email registered.',
      email
    });
  } catch (error) {
    res.status(500).json({ message: 'Forgot password lookup failed', error: error.message });
  }
};

// 7. Forgot Password - OTP Request
exports.forgotOtpRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'This email is not registered.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await sendEmail(
      email,
      'Password Reset Code - Online Crime Reporting System',
      `Your verification code is: ${otp}\nThis code is valid for 5 minutes.`
    );

    const token = jwt.sign({ email, otp }, process.env.JWT_SECRET, { expiresIn: '5m' });
    res.status(200).json({ message: 'OTP sent.', resetToken: token });
  } catch (error) {
    res.status(500).json({ message: 'OTP request failed', error: error.message });
  }
};

// 8. Forgot Password - OTP Verify
exports.forgotOtpVerify = async (req, res) => {
  try {
    const { otp, resetToken } = req.body;
    if (!otp || !resetToken) {
      return res.status(400).json({ message: 'OTP and token are required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Session expired. Try again.' });
    }

    if (decoded.otp !== otp) {
      return res.status(400).json({ message: 'Incorrect OTP.' });
    }

    const verifiedToken = jwt.sign({ email: decoded.email, verified: true }, process.env.JWT_SECRET, { expiresIn: '5m' });
    res.status(200).json({ message: 'OTP verified successfully.', verifiedToken });
  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
};

// 9. Forgot Password - Recovery Key Request (Get word pool)
exports.forgotKeyRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'This email is not registered.' });
    }

    const decrypted = decryptKey(user.recovery_key_hash);
    if (!decrypted) {
      return res.status(500).json({ message: 'Failed to retrieve recovery key.' });
    }

    const originalWords = decrypted.split(' ');
    
    // Pick 5 decoy words from WORDS_POOL that are not in originalWords
    const decoys = [];
    const poolFiltered = WORDS_POOL.filter(w => !originalWords.includes(w));
    const poolCopy = [...poolFiltered];
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(Math.random() * poolCopy.length);
      decoys.push(poolCopy.splice(idx, 1)[0]);
    }

    // Combine and shuffle
    const pool = [...originalWords, ...decoys].sort(() => Math.random() - 0.5);

    // Return pool. We sign the email in a temporary recovery token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '5m' });

    res.status(200).json({
      wordPool: pool,
      recoveryToken: token
    });
  } catch (error) {
    res.status(500).json({ message: 'Recovery key request failed', error: error.message });
  }
};

// 10. Forgot Password - Recovery Key Verify
exports.forgotKeyVerify = async (req, res) => {
  try {
    const { wordsArray, recoveryToken } = req.body;
    if (!wordsArray || !recoveryToken) {
      return res.status(400).json({ message: 'Submitted values are incomplete' });
    }

    let decoded;
    try {
      decoded = jwt.verify(recoveryToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Session expired. Try again.' });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    const decrypted = decryptKey(user.recovery_key_hash);
    if (!decrypted) {
      return res.status(500).json({ message: 'Failed to retrieve recovery key.' });
    }

    const submittedKey = wordsArray.join(' ').toLowerCase().trim();
    const correctKey = decrypted.toLowerCase().trim();

    if (submittedKey !== correctKey) {
      return res.status(400).json({ message: 'Invalid credentials or recovery key' });
    }

    // Success! Generate reset token
    const verifiedToken = jwt.sign({ email: decoded.email, verified: true }, process.env.JWT_SECRET, { expiresIn: '5m' });
    res.status(200).json({ message: 'Recovery key verified.', verifiedToken });
  } catch (error) {
    res.status(500).json({ message: 'Key verification failed', error: error.message });
  }
};

// 11. Reset Password (Final)
exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, verifiedToken } = req.body;

    if (!password || !confirmPassword || !verifiedToken) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'New password is not strong enough.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(verifiedToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Verification token expired. Please restart process.' });
    }

    if (!decoded.verified) {
      return res.status(400).json({ message: 'Verification not authenticated' });
    }

    // Find account in User or Staff
    let account = await User.findOne({ email: decoded.email });
    if (!account) {
      account = await Staff.findOne({ email: decoded.email });
    }

    if (!account) {
      return res.status(400).json({ message: 'Account not found.' });
    }

    account.password_hash = await bcrypt.hash(password, 12);
    account.status = 'active';
    account.failed_attempts = 0;
    account.blocked_until = null;
    await account.save();

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
};

// 12. Logout
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
};

// 13. Get Current User Details
exports.me = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Me lookup failed', error: error.message });
  }
};
