const svgCaptcha = require('svg-captcha');
const jwt = require('jsonwebtoken');

/**
 * Generates an SVG captcha and an encrypted validation token.
 * @returns {Object} { captchaSvg, captchaToken }
 */
const generateCaptcha = () => {
  const captcha = svgCaptcha.create({
    size: 5,
    noise: 3,
    charPreset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  });

  // Create a short-lived token (expires in 5 minutes) containing the lowercase answer
  const captchaToken = jwt.sign(
    { code: captcha.text.toLowerCase() },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  );

  return {
    captchaSvg: captcha.data,
    captchaToken
  };
};

/**
 * Validates the user's captcha answer against the token.
 * @param {string} text User's answer
 * @param {string} token Captcha validation token
 * @returns {boolean} True if matching and not expired
 */
const validateCaptcha = (text, token) => {
  if (!text || !token) return false;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.code === text.toLowerCase();
  } catch (error) {
    return false; // Token expired or invalid
  }
};

module.exports = {
  generateCaptcha,
  validateCaptcha
};
