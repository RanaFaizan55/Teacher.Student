import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: String,

    role: {
        type: String,
        enum: ["admin", "teacher", "student"],
        required: true,
    },
    active: { type: Boolean, default: false },
     isEmailVerified: { type: Boolean, default: false },
    otp: { type: String, minlength: 4 },
    verifyEmailToken: {type : String},
    verifyEmailExpires: Date,
    resetPasswordToken: { 
        type: String 
    },
    resetPasswordExpires: { 
        type: Date 
    },
    phone_number :{
        type: String,
        required : false,
    },
    profile_pic :{
        type: String,
        default: "null",
    }
    
});
export default mongoose.model("User", userSchema);