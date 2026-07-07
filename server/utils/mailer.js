const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Sends an email notification.
 * @param {string} to Recipient email address
 * @param {string} subject Email subject
 * @param {string} text Plain text content
 * @param {string} html HTML content (optional)
 */
const sendEmail = async (to, subject, text, html = '') => {
  try {
    const mailOptions = {
      from: `"Online Crime Reporting System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br/>')
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Email Sending Failed to ${to}: ${error.message}`);
    // Log to console for development verification
    console.log(`[DEV EMAIL BACKUP]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    return null;
  }
};

module.exports = { sendEmail };
