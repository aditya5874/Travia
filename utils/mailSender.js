

const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ✅ Optional debug step
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Verify Error:", error);
  } else {
    console.log("✅ SMTP connection verified, ready to send mail");
  }
});

async function mailSender(email, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject,
      html,
    });

    console.log(" Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}

module.exports = mailSender;
