

// const nodemailer = require("nodemailer");
// require("dotenv").config();

// const transporter = nodemailer.createTransport({
//   host: process.env.MAIL_HOST,
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
// });

// // ✅ Optional debug step
// transporter.verify((error, success) => {
//   if (error) {
//     console.error("❌ SMTP Verify Error:", error);
//   } else {
//     console.log("✅ SMTP connection verified, ready to send mail");
//   }
// });

// async function mailSender(email, subject, html) {
//   try {
//     const info = await transporter.sendMail({
//       from: process.env.MAIL_FROM,
//       to: email,
//       subject,
//       html,
//     });

//     console.log(" Message sent: %s", info.messageId);
//     return info;
//   } catch (error) {
//     console.error("❌ Error sending email:", error);
//     throw error;
//   }
// }

// module.exports = mailSender;
// mailSender.js
const Sib = require("sib-api-v3-sdk");
require("dotenv").config();

// Configure Brevo client
const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY; // from your Brevo dashboard

const tranEmailApi = new Sib.TransactionalEmailsApi();

/**
 * Sends an email using the Brevo API
 * @param {string} email - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML body of the email
 */
async function mailSender(email, subject, html) {
  try {
    const sender = {
      email: process.env.MAIL_FROM, // e.g., noreply@yourdomain.com
      name: "Travia Support",       // sender name
    };

    const receivers = [{ email }];

    const response = await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject,
      htmlContent: html,
    });

    console.log("✅ Email sent successfully:", response.messageId || response);
    return response;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}

module.exports = mailSender;

