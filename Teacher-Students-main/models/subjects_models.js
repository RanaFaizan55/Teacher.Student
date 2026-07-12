import mongoose from "mongoose";

const subjects_schema = new mongoose.Schema(
  {
    book_name: {
      type: String,
      required: true,
    },
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",       
      required: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",       
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjects_schema);