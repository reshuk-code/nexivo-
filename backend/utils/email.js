const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function renderTemplate(templateName, variables) {
  const templatePath = path.join(__dirname, '../template', templateName);
  let html = fs.readFileSync(templatePath, 'utf8');
  for (const key in variables) {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
  }
  return html;
}

exports.sendOTPEmail = async (to, code) => {
  const html = renderTemplate('otp.html', { code });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your Nexivo OTP Code',
    html,
  };
  await transporter.sendMail(mailOptions);
};

// Generic email sender
exports.sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
}; 