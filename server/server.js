const express = require('express');
// Trigger nodemon reload for .env
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

// Trust proxy for rate limiting behind reverse proxies (like Render)
app.set('trust proxy', 1);

// Connect to Database
connectDB().then(() => {
  // Seed initial Admin accounts if empty
  seedAdmin().then(() => {
    // Seed initial sample data if empty
    const { seedSampleData } = require('./utils/seedData');
    seedSampleData();
  });
});

// CORS middleware configurations
const frontendOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow any origin dynamically to make integration smooth
    callback(null, true);
  },
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static files for evidence images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// Test SMTP route for diagnosing email connection issues
app.get('/api/test-smtp', async (req, res) => {
  const nodemailer = require('nodemailer');
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    await transporter.verify();
    res.json({ status: "success", message: "SMTP connection verified successfully!" });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message, user: process.env.EMAIL_USER });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: "Online Crime Reporting System API is running successfully.", 
    status: "active" 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Seed default Admin user and staff if database is fresh
async function seedAdmin() {
  try {
    const User = require('./models/User');
    const Staff = require('./models/Staff');
    const SafetyTip = require('./models/SafetyTip');
    const bcrypt = require('bcryptjs');
    const crypto = require('crypto');

    // 1. Check Staff Admin
    const staffCount = await Staff.countDocuments({});
    if (staffCount === 0) {
      const password_hash = await bcrypt.hash('AdminPassword123!', 12);
      
      // Encrypt default key: 'apple tiger moon glass river stone light paper green chair'
      const keyString = 'apple tiger moon glass river stone light paper green chair';
      const ENCRYPTION_KEY = process.env.JWT_SECRET.padEnd(32, '0').substring(0, 32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
      let encrypted = cipher.update(keyString);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      const recovery_key_hash = iv.toString('hex') + ':' + encrypted.toString('hex');

      await Staff.create({
        full_name: 'Administrator',
        dob: new Date('1990-01-01'),
        phone_number: '9876543210',
        email: 'admin@crs.com',
        password_hash,
        recovery_key_hash,
        role: 'admin',
        status: 'active'
      });
      console.log('Seeded default admin staff: admin@crs.com / AdminPassword123!');
    }

    // 2. Seed some default safety tips if empty
    const tipsCount = await SafetyTip.countDocuments({});
    if (tipsCount === 0) {
      await SafetyTip.create([
        {
          title: 'Securing Your Social Media Profiles',
          category: 'cyber safety',
          short_description: 'Learn how to prevent identity theft and keep your accounts secure.',
          content: '1. Use a unique strong password for every account.\n2. Enable Two-Factor Authentication (2FA).\n3. Set privacy settings to "Friends Only".\n4. Never click on unsolicited links or input login details on unverified pages.'
        },
        {
          title: 'Women Night Travel Safety Tips',
          category: 'women safety',
          short_description: 'Crucial steps to stay safe when traveling late at night.',
          content: '1. Share live location with a trusted friend or family member.\n2. Keep emergency speed-dial keys ready on your mobile.\n3. Avoid poorly lit streets and choose authorized public transit.\n4. Trust your instincts—if a situation feels wrong, move to a crowded public space immediately.'
        },
        {
          title: 'Navigating Traffic Signals Safely',
          category: 'traffic safety',
          short_description: 'Basic driving rules and pedestrian safety precautions.',
          content: '1. Always wear a seatbelt or helmet.\n2. Maintain speed limits and respect zebra crossings.\n3. Never use a mobile phone while driving.\n4. Avoid aggressive lane switching.'
        }
      ]);
      console.log('Seeded initial safety tips.');
    }
  } catch (err) {
    console.error('Error seeding admin credentials:', err.message);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
