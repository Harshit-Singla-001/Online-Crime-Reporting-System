const path = require('path');
const fs = require('fs');
const multer = require('multer');
const FIRRecord = require('../models/FIRRecord');
const FIRPublicRecord = require('../models/FIRPublicRecord');
const Report = require('../models/Report');
const User = require('../models/User');
const { sendEmail } = require('../utils/mailer');

// Configure Multer for evidence upload (max 3 images)
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, JPG, and PNG images are allowed!'));
  }
}).array('images', 3);

// 1. File FIR
exports.fileFIR = (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const {
        title,
        category,
        description,
        incident_date,
        incident_time,
        city,
        full_address,
        current_address,
        suspect_description,
        witness_description,
        declaration
      } = req.body;

      if (!title || !category || !description || !incident_date || !incident_time || !city || !full_address || !current_address) {
        return res.status(400).json({ message: 'All required fields must be filled.' });
      }

      // Silent geolocation verification
      const { geolocation_supported, geolocation_permission } = req.body;
      if (geolocation_supported === 'true' && geolocation_permission === 'denied') {
        return res.status(400).json({ message: 'FIR submission failed. Geolocation permission is required to verify the incident origin.' });
      }

      // Validate Incident Date calendar year
      const year = new Date(incident_date).getFullYear();
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
        return res.status(400).json({ message: 'Please enter a valid calendar year for the incident date.' });
      }

      // Combine incident date & time to compare with current filing time
      const incidentDatetime = new Date(incident_date);
      const [hours, minutes] = incident_time.split(':');
      incidentDatetime.setHours(parseInt(hours) || 0);
      incidentDatetime.setMinutes(parseInt(minutes) || 0);

      const filingTime = new Date();
      if (incidentDatetime >= filingTime) {
        return res.status(400).json({ message: 'Crime incident date and time must be before the FIR filing time.' });
      }

      if (declaration !== 'true' && declaration !== true) {
        return res.status(400).json({ message: 'You must check the declaration box.' });
      }

      // Collect uploaded filenames
      const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

      // Create primary FIR record (priority will auto-calculate)
      const fir = new FIRRecord({
        user_id: req.user._id,
        title,
        category,
        description,
        incident_date: new Date(incident_date),
        incident_time,
        city,
        full_address,
        current_address,
        suspect_description: suspect_description || null,
        witness_description: witness_description || null,
        images,
        status: 'Pending'
      });

      await fir.save();

      // Combine incident date & time for public record
      const datetime = new Date(incident_date);
      datetime.setHours(parseInt(hours) || 0);
      datetime.setMinutes(parseInt(minutes) || 0);

      // Create public record (anonymized)
      const shortSummary = description.length > 150 ? description.substring(0, 147) + '...' : description;
      await FIRPublicRecord.create({
        fir_id: fir._id,
        city,
        category,
        incident_datetime: datetime,
        status: 'Pending',
        description: shortSummary,
        admin_review: null
      });

      // Send email notification to user
      const userEmail = req.user.email;
      const userName = req.user.full_name;
      const emailSubject = `FIR Submission: ${fir.title}`;
      const emailBody = `Dear ${userName},\n\nYour fir ${fir.title} is filed and currently in pending to review.\n\nBest Regards,\nOnline Crime Reporting System Team`;

      try {
        if (userEmail && userEmail.toLowerCase() !== 'harshitsingla72@gmail.com' && userEmail !== process.env.EMAIL_USER) {
          await sendEmail(userEmail, emailSubject, emailBody);
        }
      } catch (emailErr) {
        console.error('Failed to send FIR filing notification email:', emailErr);
      }

      res.status(201).json({
        message: 'FIR filed successfully.',
        fir_id: fir._id
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to file FIR', error: error.message });
    }
  });
};

// 2. Fetch My FIRs
exports.getMyFIRs = async (req, res) => {
  try {
    const firs = await FIRRecord.find({ user_id: req.user._id }).sort({ created_at: -1 });
    res.status(200).json(firs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve FIRs', error: error.message });
  }
};

// 3. Fetch My FIR Details
exports.getMyFIRDetails = async (req, res) => {
  try {
    const fir = await FIRRecord.findById(req.params.id);
    if (!fir) {
      return res.status(404).json({ message: 'FIR record not found.' });
    }

    // Owner check
    if (fir.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access.' });
    }

    res.status(200).json(fir);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve FIR details', error: error.message });
  }
};

// 4. Edit My Pending FIR
exports.editMyFIR = async (req, res) => {
  try {
    const fir = await FIRRecord.findById(req.params.id);
    if (!fir) {
      return res.status(404).json({ message: 'FIR record not found.' });
    }

    // Owner check
    if (fir.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access.' });
    }

    if (fir.status !== 'Pending') {
      return res.status(400).json({ message: 'Only Pending FIRs can be edited.' });
    }

    const { description, suspect_description, witness_description } = req.body;
    if (!description) {
      return res.status(400).json({ message: 'Description is required.' });
    }

    // Edit fields
    fir.description = description;
    fir.suspect_description = suspect_description || null;
    fir.witness_description = witness_description || null;
    await fir.save();

    // Update public record description
    const shortSummary = description.length > 150 ? description.substring(0, 147) + '...' : description;
    await FIRPublicRecord.findOneAndUpdate(
      { fir_id: fir._id },
      { description: shortSummary }
    );

    res.status(200).json({ message: 'FIR updated successfully.', fir });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update FIR', error: error.message });
  }
};

// 5. Fetch Public FIR Records (Approved & Solved only)
exports.getPublicFIRRecords = async (req, res) => {
  try {
    const { category, city, status, page = 1, limit = 10, search } = req.query;

    const query = {
      status: { $in: ['Approved', 'Solved'] }
    };

    if (category) query.category = category;
    if (city) query.city = new RegExp(city, 'i');
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { category: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const count = await FIRPublicRecord.countDocuments(query);
    const records = await FIRPublicRecord.find(query)
      .sort({ incident_datetime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      records,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalRecords: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve public records', error: error.message });
  }
};

// 6. Fetch Public FIR Details
exports.getPublicFIRDetails = async (req, res) => {
  try {
    const publicRecord = await FIRPublicRecord.findById(req.params.id);
    if (!publicRecord) {
      return res.status(404).json({ message: 'Public FIR record not found.' });
    }

    if (!['Approved', 'Solved'].includes(publicRecord.status)) {
      return res.status(403).json({ message: 'Access denied. Record is not approved.' });
    }

    res.status(200).json(publicRecord);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve public details', error: error.message });
  }
};

// 7. Report FIR or User
exports.reportFIR = async (req, res) => {
  try {
    const { fir_id, user_id, reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required.' });
    }

    if (!fir_id && !user_id) {
      return res.status(400).json({ message: 'At least one target (FIR or User) is required.' });
    }

    const reporter_id = req.user._id;

    // Limit check 1: One user can report same FIR once
    if (fir_id) {
      const existingReport = await Report.findOne({ reporter_id, fir_id });
      if (existingReport) {
        return res.status(400).json({ message: 'You have already reported this FIR.' });
      }
    }

    // Limit check 2: Max 3 reports per hour per user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const reportsInLastHour = await Report.countDocuments({
      reporter_id,
      created_at: { $gte: oneHourAgo }
    });

    if (reportsInLastHour >= 3) {
      return res.status(429).json({ message: 'Rate limit exceeded. You can file at most 3 reports per hour.' });
    }

    const report = await Report.create({
      reporter_id,
      user_id: user_id || null,
      fir_id: fir_id || null,
      reason
    });

    res.status(201).json({ message: 'Report submitted successfully.', report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit report', error: error.message });
  }
};
