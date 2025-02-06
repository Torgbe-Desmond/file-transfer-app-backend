const  AppError  = require("../Errors/custom-error-handler");

const nodemailer = require("nodemailer");
require('dotenv').config();

if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS || !process.env.ADMIN_EMAIL) {
    console.error("Missing required environment variables.");
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

async function sendMailToAdminIfCritical(error) {
    if (error && error instanceof Error && !isOperationalError(error)) {
        const subject = "Critical System Error - Immediate Attention Required";
        const text = `
            A critical error occurred in the system. Details:
            
            Message: ${error.message}
            Stack: ${error.stack}
            
            Please investigate the issue as soon as possible.
        `;
        
        try {
            const info = await transporter.sendMail({
                from: `<${process.env.GMAIL_USER}>`,
                to: process.env.ADMIN_EMAIL,  
                subject,  
                text,
            });
            console.log("Email sent to admin about critical error:", info.messageId);
        } catch (emailError) {
            console.error("Failed to send critical error email:", emailError);
        }
    }
}

function isOperationalError(error) {
    return error instanceof AppError;
}

module.exports = sendMailToAdminIfCritical;
