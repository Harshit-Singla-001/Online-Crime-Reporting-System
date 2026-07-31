/**
 * Sends an email notification using Brevo HTTP API.
 * @param {string} to Recipient email address
 * @param {string} subject Email subject
 * @param {string} text Plain text content
 * @param {string} html HTML content (optional)
 */
const sendEmail = async (to, subject, text, html = '') => {
  // Safeguard: Block status emails to the system email address
  if (subject.toLowerCase().includes('status') && (to.toLowerCase() === 'harshitsingla72@gmail.com' || to === 'b16c21001@smtp-brevo.com')) {
    console.log(`Bypassed sending status email to ${to}`);
    return null;
  }

  const apiKey = process.env.EMAIL_PASS;
  if (!apiKey) {
    console.error('Brevo API Key (EMAIL_PASS) is not defined in environment variables.');
    return null;
  }

  try {
    const htmlContent = html || text.replace(/\n/g, '<br/>');

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'Online Crime Reporting System',
          email: process.env.SENDER_EMAIL || 'harshitsingla72@gmail.com'
        },
        to: [
          {
            email: to
          }
        ],
        subject: subject,
        htmlContent: htmlContent,
        textContent: text
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`Email sent successfully to ${to}. Message ID: ${data.messageId}`);
      return data;
    } else {
      const errData = await response.json().catch(() => ({}));
      console.error(`Brevo API Error (${response.status}):`, errData);
      throw new Error(`Brevo HTTP error status ${response.status}`);
    }
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
