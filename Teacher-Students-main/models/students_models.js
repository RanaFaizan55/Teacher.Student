import mongoose from "mongoose";

const student_schema = new mongoose.Schema(
  {
    student_name: {
      type: String,
      required: false,
    },

    student_id: {
      type: Number,
      required: false
    },
    student_phone : {
      type: String,
    },
    subject_ids: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: false
    }],
    marks :{
      subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: false
    },
    total_marks :{
      type : Number, 
      required : true
    },
    obtained_marks :{
      type : Number, 
      required : true
    },
    grade : {
      type : String,
    },
    },
     comments: [                             
      {
        subject_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
        },
        teacher_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Teacher",
        },
        comment: { type: String },
        rating: {
          type :Number,
          min : 1,
          max : 5,
        },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);
export default mongoose.model("Student", student_schema);