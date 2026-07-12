import mongoose from "mongoose";

const teacher_schema = new mongoose.Schema(
  {
    teacher_name: {
      type: String,
      required: false,
    },

    teacher_phone: {
      type: String,
      required: false,
      default: "12345678",
    },

    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    subject_ids: [{                          
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject"
    }]
  },
  { timestamps: true }
);

export default mongoose.model("Teacher", teacher_schema);