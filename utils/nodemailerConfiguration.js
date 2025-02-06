const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
require('dotenv').config();

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
  const templatePath = path.join('views', 'password-verification.ejs');

  const htmlContent = await ejs.renderFile(templatePath, { username, verificationLink });

  await transporter.sendMail({
    from: `<${process.env.GMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  });
}

module.exports = { sendEmaiToRecipient };
