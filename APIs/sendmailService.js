import prisma from "./prismadb";

const nodemailer = require('nodemailer');
require("dotenv").config();

class SendMailService {
    constructor() {
        // Create a nodemailer transporter instance for sending emails
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: true, // Set to true if using port 465 (SMTPS)
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            }
        });
    }

    // Method to send email for password reset
    async sendMail(args, BaseUrl, token, user_name) {
        try {
            // Construct the password reset link
            const link = `https://${BaseUrl}/password/reset/${token}/${encodeURIComponent(user_name)}`;
            
            // Define email options
            var mailOptions = {
                from: {
                    name: 'Cloudeshope', // Sender name
                    address: process.env.MAIL_USERNAME // Sender email address
                },
                to: args.email,
                subject: args.subject, 
                text: `${args.text} ${link}`, 
                html: `${args.html} <a href="${link}">${link}</a>` 
            };
            
            // Send the email using the transporter
            const info = await this.transporter.sendMail(mailOptions);
            console.log("Email sent:", info.messageId); 
        } catch (error) {
            console.error("Error sending email:", error); 
        }
    }
}

export default SendMailService; 
