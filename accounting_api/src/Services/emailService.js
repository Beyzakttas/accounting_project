import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (options) => {
    // 1) Create a transporter
    // For development, use Mailtrap or similar. For production, use real SMTP like Gmail/SendGrid
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
        port: process.env.EMAIL_PORT || 2525,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // 2) Define the email options
    const mailOptions = {
        from: `Muhasebe Uygulaması <${process.env.EMAIL_FROM || 'noreply@muhasebe.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: 
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

export default { sendEmail };
