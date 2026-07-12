import User from "../models/user_models.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import Teacher from "../models/teachers_model.js"
import admin from "../models/admin_model.js"
import { sendEmail } from "../utils/sendEmail.js";
import * as crypto from 'crypto';

// =======user login==========
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "emal not registered",
                success: false
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password",
                success: false
            });
        }

        const token = JWT.sign(
            { id: user._id, role: user.role },
            "secretkey",
            { expiresIn: "1d" }
        );

        return res.json({ token });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
};

// ====================MY api==================


export const my_profile = async (req, res) => {
    try {
        const user_id = req.user.id
        const user = await User.findById(user_id).select("-password")
        const detail = await Teacher.findOne({
            teacher_id: user_id
        })
            .populate("student_id", "student_name student_id")
        // .populate("subject_id", "book_name"); 
        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        return res.status(200).json({
            message: "User data found Successfully",
            success: true,
            data: user,
            data2: detail

        })

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
            data: "internal server error"
        })
    }
}

// ===============helper to gen otp======
const generateOtp = () => Math.floor(1000 * Math.random() + 20).toString();
// =================Admin login==========
export const adminLogin = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Email, password, and role are required",
            });
        }

        if (role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Only admins can log in here.",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Invalid credentials" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                message: `Access denied. This email is registered as ${user.role}, not admin.`,
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        if (!user.active) {
            return res.status(403).json({ message: "Admin account inactive" });
        }

        const adminProfile = await admin.findOne({ userId: user._id }).select(
            "admin_name admin_phone",
        );

        const token = JWT.sign(
            { id: user._id, role: user.role },
            "secretkey",
            { expiresIn: "1d" }
        );

        res.status(200).json({
            success: true,
            message: "Admin logged in successfully",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            },
        });
    } catch (err) {
        console.error("Admin login error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
// ====verify email and token

export const verifyEmailToken = async (req, res) => {
    try {
        const { token } = req.params;

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            verifyEmailToken: hashedToken,
            verifyEmailExpires: { $gt: Date.now() }, // check token expiry
        });

        if (!user) {
            return res
                .status(400)
                .send("<h3>❌ Verification link is invalid or has expired.</h3>");
        }

        user.isEmailVerified = true;
        user.verifyEmailToken = undefined;
        user.verifyEmailExpires = undefined;
        await user.save();

        res
            .status(200)
            .send("<h3>✅ Email verified successfully! You can now sign in.</h3>");
    } catch (err) {
        console.error("Verification Error:", err);
        res.status(500).send("<h3>❌ Something went wrong. Try again later.</h3>");
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.otp !== otp)
            return res.status(400).json({
                message: "Invalid OTP"
            });
        if (user.otpExpiresAt && user.otpExpiresAt < new Date())
            return res.status(400).json({
                message: "OTP expired"
            });

        user.isEmailVerified = true;
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        const token = JWT.sign(
            { id: user._id, role: user.role },
            "secretkey",
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Otp verified",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// ========= forgotPassword===========

export const forgotPasswordToken = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({
                message:
                    "If an account with that email exists, a reset link has been sent.",
            });
        }

        // 1️⃣ Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashed = crypto.createHash("sha256").update(resetToken).digest("hex");

        // 2️⃣ Save hashed token & expiry time in DB
        user.resetPasswordToken = hashed;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save({ validateBeforeSave: false });

        // 3️⃣ Send email
        await sendEmail(
            user.email,
            `<h2>Reset Password Link</h2>
     <p>Is link pe click karo: 
     <a href="http://localhost:3000/reset-password?token=${resetToken}">Reset Password</a>
     </p>
     <p>1 ghante mein expire ho jaye ga!</p>`,
            "Password Reset Link"
        );

        res.status(200).json({
            message: "A reset link has been sent. Kindly check your mail.",
        });
    } catch (err) {
        console.error("💥 forgotPassword error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// otp
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "user not found" });
        }

        const otp = generateOtp();

        user.otp = otp;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save({ validateBeforeSave: false });

        await sendEmail(
            user.email,
            `<h2>Your OTP is: <b>${otp}</b></h2>
     <p>10 minutes mein expire ho jaye ga!</p>`,
            "Password Reset OTP"
        );

        res.status(200).json({
            message: "An OTP has been sent to your email. Kindly check your mail.",
        });
    } catch (err) {
        console.error("💥 forgotPassword error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// resetpassword 
export const resetPasswordApp = async (req, res) => {
    try {
        const { email, password, otp } = req.body;

        if (!email || !password || !otp)
            return res.status(400).json({ message: "email, otp and password required" });

        const user = await User.findOne({ email });
        console.log("User found:", user);
        // ✅ Pehle user check
        if (!user) return res.status(404).json({ message: "user not found" });

        // ✅ Phir OTP check
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        user.password = await bcrypt.hash(password, 10);
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        res.status(200).json({ message: "Password has been reset successfully" });
    } catch (err) {
        console.error("resetPassword error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// reset password
export const resetPassword = async (req, res) => {
    try {

        const { email, password, token } = req.body;

        // 1️⃣ Validation
        if (!email || !password || !token) {
            return res.status(400).json({
                message: "Email, password and token are required"
            });
        }

        // 2️⃣ Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // 3️⃣ Hash incoming token
        const hashed = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // 4️⃣ Verify token + expiry
        if (
            user.resetPasswordToken !== hashed ||
            user.resetPasswordExpires < Date.now()
        ) {
            return res.status(400).json({
                message: "Invalid or expired token"
            });
        }

        // 5️⃣ Hash new password
        user.password = await bcrypt.hash(password, 10);

        // 6️⃣ Remove token
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        // 7️⃣ Save user
        await user.save();

        // 8️⃣ Response
        return res.status(200).json({
            message: "Password reset successful",
            success: true
        });

    } catch (err) {

        console.log("Reset Password Error:", err);

        return res.status(500).json({
            message: "Server Error",
            error: err.message
        });
    }
};

// updatepassword
export const updatePassword = async (req, res) => {
    try {

        const user = req.user;
        console.log("user : ", user);
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: "Old and new password required"
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);


        if (!isMatch) {
            return res.status(400).json({
                message: "Current password is incorrect"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (err) {

        console.error("updatePassword error:", err);

        res.status(500).json({
            message: "Server error"
        });
    }
};
// toggle activation status
export const toggle_status = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({ message: "Access denied: Admins only." });

        const { id } = req.body;
        const user = await User.findById(id);
        if (!user)
            return res.status(404).json({ message: "User not found" });

        if (user.role === "admin")
            return res.status(400).json({ message: "Cannot toggle admin!" });

        user.active = !user.active;
        await user.save();

        res.json({
            message: `${user.role} is now ${user.active ? "Active ✅" : "Inactive ❌"}`,
            active: user.active,
        });

    } catch (error) {
        console.error("Toggle error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// print in console  otp for phone
export const phone_otp = async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number)
      return res.status(400).json({
        success: false,
        message: "Phone number required",
      });

    const user = await User.findOne({ phone_number });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Number not registered kindly register first",
      });
    }

    const otp = generateOtp();
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000);

    await User.findOneAndUpdate(
      { phone_number },
      {
        otp,
        expiresAt: expiryTime,
      }
    );

    console.log(" OTP:", otp);

    return res.status(200).json({
      success: true,
      message: "OTP generated!",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// verification for phone otp

export const verify_phone_otp = async (req, res) => {
    try {
        const { phone_number, otp } = req.body;

        if (!phone_number || !otp)
            return res.status(400).json({ success: false, message: "Phone number and OTP required" });

        const phoneRecord = await User.findOne({ phone_number });

        if (!phoneRecord)
            return res.status(404).json({ success: false, message: "Phone number not found" });

        if (phoneRecord.isVerified)
            return res.status(400).json({ success: false, message: "Already verified" });

        if (phoneRecord.otp !== otp)
            return res.status(400).json({ success: false, message: "Invalid OTP" });

        if (phoneRecord.expiresAt < new Date())
            return res.status(400).json({ success: false, message: "OTP expired" });

        phoneRecord.isVerified = true;
        phoneRecord.otp = undefined;
        phoneRecord.expiresAt = undefined;
        await phoneRecord.save();

        res.status(200).json({ success: true, message: "Phone verified ✅" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// export const phone_otp = async (req, res) => {
//   try {
//     const { phone_number, otp } = req.body;

//     if (!otp || !phone_number)
//       return res.status(400).json({ success: false, message: "Please provide phone number and OTP" });

//     const phoneRecord = await User.findOne({ phone_number: phone_number });
//     if (!phoneRecord)
//       return res.status(404).json({ success: false, message: "Phone number not found" });
//     const newotp = generateOtp()
//     console.log("", newotp);
//     if (phoneRecord.isVerified)
//       return res.status(400).json({ success: false, message: "Phone already verified" });

//     if (phoneRecord.otp !== otp)
//       return res.status(400).json({ success: false, message: "Invalid OTP" });

//     if (!phoneRecord.expiresAt || phoneRecord.expiresAt < new Date())
//       return res.status(400).json({ success: false, message: "OTP expired" });

//     phoneRecord.isVerified = true;
//     phoneRecord.otp = undefined;
//     phoneRecord.expiresAt = undefined;
//     await phoneRecord.save();

//     res.status(200).json({ success: true, message: "Phone number verified ✅" });

//   } catch (error) {
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };