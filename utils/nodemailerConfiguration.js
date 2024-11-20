const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
require('dotenv').config();

if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
  console.error('Missing required environment variables.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

async function sendEmaiToRecipient({ username, verificationLink, subject, to }) {
  const templatePath = path.join(__dirname, 'views', 'password-verification.ejs');

  console.log('path',templatePath)

  const htmlContent = await ejs.renderFile(templatePath, { username, verificationLink });

  const info = await transporter.sendMail({
    from: `<${process.env.GMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  });
}

module.exports = { sendEmaiToRecipient };
