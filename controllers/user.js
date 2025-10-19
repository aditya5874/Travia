const User = require("../models/user.js");
const sendForgotPasswordMail = require("../mail/template/forgotpassword.js");
const crypto = require("crypto");

// ============================
// SIGNUP
// ============================
module.exports.signupRender = async (req, res) => {
  res.render("signup.ejs");
};

module.exports.siggnedUp = async (req, res) => {
  const { username, email, password, cnfPassword } = req.body;

  if (!username || !email || !password || !cnfPassword) {
    req.flash("error", "All fields are required.");
    return res.redirect("/signup");
  }

  if (password !== cnfPassword) {
    req.flash("error", "Passwords do not match.");
    return res.redirect("/signup");
  }

  try {
    const newUser = new User({ username, email });
    await User.register(newUser, password);

    req.login(newUser, (err) => {
      if (err) {
        req.flash("error", "Login failed. Please try again.");
        return res.redirect("/signup");
      }
      req.flash("success", "Welcome! Account created successfully.");
      res.redirect("/listing");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

// ============================
// LOGOUT
// ============================
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You logged out successfully!");
    res.redirect("/listing");
  });
};

// ============================
// FORGOT PASSWORD
// ============================
module.exports.forgotPassword = (req, res) => {
  res.render("forgot-password.ejs");
};

module.exports.passwordResetLink = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      req.flash("error", "No user found with that email.");
      return res.redirect("/forgot-password");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordresetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Construct reset URL
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/resetPassword/${resetToken}`;
    // const resetURL = `${process.env.DOMAIN}/resetPassword/${resetToken}`;

    // 🧾 Debug logs
    console.log("🧾 Sending password reset link to:", user.email);
    console.log("🔗 Reset URL:", resetURL);

    // Send email
    await sendForgotPasswordMail(user.email, resetURL);

    req.flash("success", "Password reset link sent to your email.");
    res.redirect("/forgot-password");
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);

    // if (user) {
    //   user.passwordresetToken = undefined;
    //   user.passwordResetTokenExpires = undefined;
    //   await user.save({ validateBeforeSave: false });
    // }
    try {
      if (typeof user !== "undefined" && user) {
        user.passwordresetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });
      }
    } catch (saveError) {
      console.error("⚠️ Could not clean up user token:", saveError);
    }
    req.flash("error", "Error sending email. Please try again later.");
    res.redirect("/forgot-password");
  }
};

// ============================
// RESET PASSWORD
// ============================
// module.exports.resetPasswordTokenGet = (req, res) => {
//   const token = req.params.token;
//   res.render("resetPassword.ejs", { token });
// };
// ============================
// RESET PASSWORD
// ============================
module.exports.resetPasswordTokenGet = async (req, res) => {
  const token = req.params.token;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordresetToken: hashedToken,
      passwordResetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Invalid or expired password reset link.");
      return res.redirect("/forgot-password");
    }

    res.render("resetPassword.ejs", { token });
  } catch (err) {
    console.error("Error verifying reset token:", err);
    req.flash("error", "Something went wrong.");
    res.redirect("/forgot-password");
  }
};

module.exports.resetPasswordTokenPatch = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordresetToken: hashedToken,
      passwordResetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("error", "Reset token is invalid or expired.");
      return res.redirect("/forgot-password");
    }

    if (!req.body.password || req.body.password.trim().length < 6) {
      req.flash("error", "Password must be at least 6 characters long.");
      return res.redirect(`/resetPassword/${req.params.token}`);
    }

    await user.setPassword(req.body.password);
    user.passwordresetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordResetAt = Date.now();
    await user.save();

    req.flash("success", "Password reset successful! You can now log in.");
    res.redirect("/login");
  } catch (error) {
    console.error("Error during password reset:", error);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect(`/resetPassword/${req.params.token}`);
  }
};

// ============================
// UPDATE PASSWORD (LOGGED IN USER)
// ============================
module.exports.updatePasswordGet = (req, res) => {
  res.render("update-password.ejs");
};

module.exports.updatePasswordPost = async (req, res) => {
  const { currentPass, newPass } = req.body;

  try {
    const user = await User.findById(req.user._id);
    const isMatch = await user.authenticate(currentPass);

    if (!isMatch) {
      req.flash("error", "Current password is incorrect.");
      return res.redirect("/user/updatePass");
    }

    await user.setPassword(newPass);
    await user.save();

    req.flash("success", "Password updated successfully.");
    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/user/updatePass");
  }
};
