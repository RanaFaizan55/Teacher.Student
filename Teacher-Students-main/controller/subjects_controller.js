import Subject from "../models/subjects_models.js";
import Teacher from "../models/teachers_model.js";
import Student from "../models/students_models.js";

// CREATE SUBJECT
export const create_subject = async (req, res) => {
  try {
    const { book_name, teacher_id, student_id } = req.body;

    if (!book_name || !teacher_id) {
      return res.status(400).json({
        message: "book_name and teacher_id required",
        success: false,
      });
    }
    
    const newSubject = await Subject.create({
      book_name,
      teacher_id,
      student_id       
    });

    // Teacher ke subject_ids mein push
    await Teacher.findByIdAndUpdate(teacher_id, {
      $push: { subject_ids: newSubject._id }
    });

    // Student ke subject_ids mein push
    await Student.findByIdAndUpdate(student_id, {
      $push: { subject_ids: newSubject._id }
    });

    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: newSubject
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// GET ALL SUBJECTS
export const get_subjects = async (req, res) => {
  try {
    const data = await Subject.find()
      .populate("teacher_id", "teacher_name teacher_phone")
      .populate("student_id", "student_name student_phone");

    return res.status(200).json({
      message: "Subjects fetched successfully",
      success: true,
      data,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// UPDATE SUBJECT
export const update_subject = async (req, res) => {
  try {
    const { id } = req.params;
    const { book_name, teacher_id, student_id} = req.body;

    const updated = await Subject.findByIdAndUpdate(
      id,
      { book_name, teacher_id, student_id },
      { new: true }
    );

    return res.status(200).json({
      message: "Subject updated successfully",
      success: true,
      data: updated,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// DELETE SUBJECT
export const delete_subject = async (req, res) => {
  try {
    const { id } = req.params;
    await Subject.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Subject deleted successfully",
      success: true,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};