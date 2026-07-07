const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const FIRRecord = require('../models/FIRRecord');
const FIRPublicRecord = require('../models/FIRPublicRecord');

const seedSampleData = async () => {
  try {
    const userCount = await User.countDocuments({ role: 'user' });
    if (userCount > 0) {
      console.log('User collection already seeded or populated. Skipping sample seeding.');
      return;
    }

    console.log('Seeding sample users and FIR records...');

    // Generate password hash
    const passwordHash = await bcrypt.hash('Password123!', 12);

    // Generate recovery key hash helper
    const getRecoveryKeyHash = () => {
      const keyString = 'apple tiger moon glass river stone light paper green chair';
      const ENCRYPTION_KEY = process.env.JWT_SECRET.padEnd(32, '0').substring(0, 32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
      let encrypted = cipher.update(keyString);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return iv.toString('hex') + ':' + encrypted.toString('hex');
    };

    // 1. Create sample users
    const user1 = await User.create({
      full_name: 'John Doe',
      dob: new Date('1995-05-15'),
      aadhaar_number: '123456789012',
      pan_number: 'ABCDE1234F',
      address: 'Block C, Sector 5, Dwarka, New Delhi',
      phone_number: '9988776655',
      email: 'john.doe@example.com',
      password_hash: passwordHash,
      recovery_key_hash: getRecoveryKeyHash(),
      role: 'user',
      status: 'active'
    });

    const user2 = await User.create({
      full_name: 'Jane Smith',
      dob: new Date('1988-11-23'),
      aadhaar_number: '987654321098',
      pan_number: 'XYZWV9876U',
      address: 'Model Town Extension, Ludhiana',
      phone_number: '9876543211',
      email: 'jane.smith@example.com',
      password_hash: passwordHash,
      recovery_key_hash: getRecoveryKeyHash(),
      role: 'user',
      status: 'active'
    });

    const user3 = await User.create({
      full_name: 'Bob Johnson',
      dob: new Date('2001-02-10'),
      aadhaar_number: '111122223333',
      pan_number: 'PQRST5678W',
      address: '5th Block, Koramangala, Bangalore',
      phone_number: '9000011111',
      email: 'bob.johnson@example.com',
      password_hash: passwordHash,
      recovery_key_hash: getRecoveryKeyHash(),
      role: 'user',
      status: 'active'
    });

    console.log('Sample users seeded.');

    // 2. Create sample FIR records
    
    // John Doe FIR 1 (Pending Theft)
    const fir1 = await FIRRecord.create({
      user_id: user1._id,
      title: 'Bicycle stolen from apartment garage',
      category: 'Theft',
      description: 'My silver Trek mountain bicycle was stolen from the shared apartment garage overnight between 10 PM and 6 AM. The lock was cut and left on the ground.',
      incident_date: new Date('2026-07-01'),
      incident_time: '23:30',
      city: 'New Delhi',
      full_address: 'Block C, Sector 5, Dwarka, New Delhi',
      current_address: 'Lat: 28.5921, Lon: 77.0465',
      status: 'Pending'
    });

    const datetime1 = new Date('2026-07-01');
    datetime1.setHours(23);
    datetime1.setMinutes(30);

    await FIRPublicRecord.create({
      fir_id: fir1._id,
      city: 'New Delhi',
      category: 'Theft',
      incident_datetime: datetime1,
      status: 'Pending',
      description: 'Bicycle stolen from apartment garage. Silver Trek mountain bike.',
      admin_review: null
    });

    // John Doe FIR 2 (Approved Assault)
    const fir2 = await FIRRecord.create({
      user_id: user1._id,
      title: 'Physical assault near metro station exit',
      category: 'Assault',
      description: 'While walking back from the Dwarka Sector 11 metro station, a person in a black hoodie grabbed my shoulder and struck my arm before running away. Bystanders shouted and he fled.',
      incident_date: new Date('2026-06-28'),
      incident_time: '20:15',
      city: 'New Delhi',
      full_address: 'Dwarka Sector 11 Metro Station exit road',
      current_address: 'Lat: 28.5910, Lon: 77.0480',
      status: 'Approved',
      admin_review: 'Approved for public information display. Patrol forces alerted.'
    });

    const datetime2 = new Date('2026-06-28');
    datetime2.setHours(20);
    datetime2.setMinutes(15);

    await FIRPublicRecord.create({
      fir_id: fir2._id,
      city: 'New Delhi',
      category: 'Assault',
      incident_datetime: datetime2,
      status: 'Approved',
      description: 'Physical assault near Dwarka Sector 11 metro station exit road.',
      admin_review: 'Approved for public information display. Patrol forces alerted.'
    });

    // Jane Smith FIR 1 (Solved Cyber Crime)
    const fir3 = await FIRRecord.create({
      user_id: user2._id,
      title: 'Scam phone call and bank details theft',
      category: 'Cyber Crime',
      description: 'I received a phone call claiming to be from my bank customer service. The caller convinced me to share a one-time OTP, resulting in an unauthorized transfer of INR 25,000 from my savings account.',
      incident_date: new Date('2026-06-25'),
      incident_time: '14:10',
      city: 'Ludhiana',
      full_address: 'Model Town Extension, Ludhiana',
      current_address: 'Lat: 30.9010, Lon: 75.8573',
      status: 'Solved',
      admin_review: 'The beneficiary account has been frozen and recovery procedures initiated. Accused located.'
    });

    const datetime3 = new Date('2026-06-25');
    datetime3.setHours(14);
    datetime3.setMinutes(10);

    await FIRPublicRecord.create({
      fir_id: fir3._id,
      city: 'Ludhiana',
      category: 'Cyber Crime',
      incident_datetime: datetime3,
      status: 'Solved',
      description: 'Scam phone call and bank details theft resulting in unauthorized bank transfer.',
      admin_review: 'The beneficiary account has been frozen and recovery procedures initiated. Accused located.'
    });

    // Jane Smith FIR 2 (Rejected Other)
    const fir4 = await FIRRecord.create({
      user_id: user2._id,
      title: 'Loud music noise from local cafe next door',
      category: 'Other',
      description: 'A local cafe next door plays extremely loud music past midnight every weekend, disturbing the residential area.',
      incident_date: new Date('2026-07-05'),
      incident_time: '01:00',
      city: 'Ludhiana',
      full_address: 'Saraba Nagar Main Market, Ludhiana',
      current_address: 'Lat: 30.8985, Lon: 75.8201',
      status: 'Rejected',
      admin_review: 'This is a civil/municipal noise issue, not a criminal matter. Referred to municipal corporation.'
    });

    const datetime4 = new Date('2026-07-05');
    datetime4.setHours(1);
    datetime4.setMinutes(0);

    await FIRPublicRecord.create({
      fir_id: fir4._id,
      city: 'Ludhiana',
      category: 'Other',
      incident_datetime: datetime4,
      status: 'Rejected',
      description: 'Loud music noise from local cafe next door in Saraba Nagar.',
      admin_review: 'This is a civil/municipal noise issue, not a criminal matter. Referred to municipal corporation.'
    });

    // Bob Johnson FIR 1 (Pending Missing Person)
    const fir5 = await FIRRecord.create({
      user_id: user3._id,
      title: 'Missing relative since Sunday morning walk',
      category: 'Missing Person',
      description: 'My uncle, aged 68, left for a morning walk around 7:00 AM on Sunday and has not returned. He is wearing a blue track suit, white shoes, and carries a black cane. He occasionally experiences mild memory loss.',
      incident_date: new Date('2026-07-05'),
      incident_time: '07:00',
      city: 'Bangalore',
      full_address: '5th Block, Koramangala, Bangalore',
      current_address: 'Lat: 12.9347, Lon: 77.6200',
      status: 'Pending'
    });

    const datetime5 = new Date('2026-07-05');
    datetime5.setHours(7);
    datetime5.setMinutes(0);

    await FIRPublicRecord.create({
      fir_id: fir5._id,
      city: 'Bangalore',
      category: 'Missing Person',
      incident_datetime: datetime5,
      status: 'Pending',
      description: 'Missing relative (uncle, 68y/o) since Sunday morning walk wearing blue tracksuit.',
      admin_review: null
    });

    console.log('Sample FIR and Public records successfully seeded.');
  } catch (error) {
    console.error('Error seeding sample data:', error.message);
  }
};

module.exports = { seedSampleData };
