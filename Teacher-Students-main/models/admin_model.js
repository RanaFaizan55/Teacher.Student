import mongoose from "mongoose";

const admin_schema = new mongoose.Schema(
  
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    admin_name: {
      type: String,
      required: true,
    },

    admin_phone: {
      type: String,
      required: false,
      default: "12345678",
    },

  },
  { timestamps: true }
);

export default mongoose.model("admin", admin_schema);