// const mailSender = require("../../utils/mailSender.js");

// /**
//  * Sends a password reset email.
//  * @param {string} email - Recipient's email.
//  * @param {string} resetURL - The reset password link.
//  */
// const sendForgotPasswordMail = async (email, resetURL) => {
//   const subject = "Password Reset Request - Travia";
//   const body = `
//     <div style="font-family: Arial, sans-serif; color: #333;">
//       <h2>Password Reset Request</h2>
//       <p>Hello,</p>
//       <p>We received a request to reset your password. Click the button below to reset it:</p>
//       <a href="${resetURL}"
//          style="display:inline-block;background-color:#4CAF50;color:white;
//          padding:10px 20px;text-decoration:none;border-radius:5px;">
//          Reset Password
//       </a>
//       <p>This link will expire in 10 minutes.</p>
//       <p>If you didn’t request this, please ignore this email.</p>
//     </div>
//   `;

//   try {
//     const info = await mailSender(email, subject, body);
//     console.log("📧 Password reset email sent successfully to:", email);
//     return info;
//   } catch (error) {
//     console.error("❌ Error sending password reset email:", error.message);
//     throw error;
//   }
// };

// module.exports = sendForgotPasswordMail;

// mail/template/forgotpassword.js

const mailSender = require("../../utils/mailSender.js");
async function sendForgotPasswordMail(email, resetURL) {
  const subject = "Travia | Password Reset Link";

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Password Reset Request</h2>
      <p>Hi there,</p>
      <p>We received a request to reset your password. Click the link below to set a new one:</p>
      <p>
        <a href="${resetURL}" 
           style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
           Reset Password
        </a>
      </p>
      <p>If you didn’t request this, you can safely ignore this email.</p>
      <p>– The Travia Team</p>
    </div>
  `;

  try {
    await mailSender(email, subject, html);
    console.log("✅ Forgot password email sent to:", email);
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
    throw error;
  }
}

module.exports = sendForgotPasswordMail;
