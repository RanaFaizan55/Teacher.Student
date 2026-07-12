import teacher from "../models/teachers_model.js";
import Subject from "../models/subjects_models.js";
import User from "../models/user_models.js";
import Student from "../models/students_models.js";
import bcrypt from "bcryptjs";
import students_models from "../models/students_models.js";


// REGISTER

export const register_teacher = async (req, res) => {
    try {
        const { name, email, password, role, phone_number } = req.body;
        const profile_pic = req.file?.location;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            phone_number,
            profile_pic,
        });

        if (role === "student") {
            await Student.create({ userId: newUser._id, student_name: name });
        } else if (role === "teacher") {
            await teacher.create({ userId: newUser._id, teacher_name: name });
        }

        return res.status(201).json({
            message: "User registered successfully",
            success: true,
            data: newUser
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
            description: "internal server error"
        });
    }
};

// CREATE TEACHER
export const create_teacher = async (req, res) => {
    try {
        const { teacher_name, teacher_phone } = req.body;

        if (!teacher_name) {
            return res.status(400).json({
                message: "teacher_name is required",
                success: false,
            });
        }

        const create = await teacher.create({ teacher_name, teacher_phone });

        return res.status(201).json({
            success: true,
            message: "Teacher created successfully",
            data: create,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
            description: "internal server error"
        });
    }
};

// GET ALL TEACHERS
export const get_teachers = async (req, res) => {
    try {
        const data = await teacher.find()
            .populate({
                path: "subject_ids",
                select: "book_name"
            });

        return res.status(200).json({
            message: "Teachers fetched successfully",
            success: true,
            data,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
            description: "internal server error"
        });
    }
};

// UPDATE TEACHER
export const teacher_update = async (req, res) => {
    try {
        const { id } = req.params;
        const { teacher_name, teacher_phone } = req.body;

        const updated = await teacher.findByIdAndUpdate(
            id,
            { teacher_name, teacher_phone },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                message: "Teacher not found",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Teacher updated successfully",
            success: true,
            data: updated
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
            description: "internal server error"
        });
    }
};

// DELETE TEACHER
export const teacher_delete = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await teacher.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                message: "Teacher not found",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Teacher deleted successfully",
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
            description: "internal server error"
        });
    }
};

// GET SINGLE TEACHER → SUBJECTS → STUDENTS
export const get_teacher_subject_students = async (req, res) => {
    try {
        const { id } = req.params;

        const teacherData = await teacher.findById(id)
            .populate({
                path: "subject_ids",
                select: "book_name",
                populate: {
                    path: "student_id",
                    select: "student_name student_phone"
                }
            });

        if (!teacherData) {
            return res.status(404).json({
                message: "Teacher not found",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Teacher with subjects and students",
            success: true,
            data: teacherData,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
        });
    }
};
// student quizez marks
export const quiz_marks = async (req, res) => {
    try {
        const { student_id, subject_id, total_marks, obtained_marks, grade } = req.body;
        if (!student_id || !subject_id) {
            return res.status(400).json({ message: "Parameters not provided", success: false });
        }

        const student_marks = await Student.findByIdAndUpdate(
            student_id,
            {                                   
                $push: {
                    marks: { subject_id, total_marks, obtained_marks, grade }
                }
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Marks added successfully",
            data: student_marks            
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message,
            success: false,
        });
    }
};
// get student comments
export const get_comments = async (req, res) => {
    try {
        const { id } = req.params;  

        const students = await Student.find({ "comments.teacher_id": id })
            .populate("comments.subject_id", "book_name")
            .populate("comments.teacher_id", "teacher_name");

        if (!students || students.length === 0) {
            return res.status(404).json({
                message: "No comments found for this teacher",
                success: false,
            });
        }

        
        const teacher_comment = [];
        students.forEach(student => {              
            student.comments.forEach(c => {        
                if (c.teacher_id._id.toString() === id) {
                    teacher_comment.push({
                        student_name: student.student_name,  
                        rating: c.rating || 0,
                        comment: c.comment,
                    });
                }
            });
        });
        // Average
        const rated = teacher_comment.filter(c => c.rating > 0);
        const total = rated.reduce((sum, c) => sum + c.rating, 0);
        const average_rating = rated.length > 0
            ? parseFloat((total / rated.length).toFixed(1))
            : 0;

        return res.status(200).json({
            success: true,
            message: "Teacher comments fetched",
            average_rating,
            total_reviews: teacher_comment.length,
            data: teacher_comment
        });

    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};

// import teacher from "../models/teachers_model.js";
// import Subject from "../models/subjects_models.js";
// import User from "../models/user_models.js";
// import Student from "../models/students_models.js";
// import bcrypt from "bcryptjs";
// // =====register/signup


// export const register_teacher = async (req, res) => {
//     try {
//         const { name, email, password, role  ,phone_number } = req.body;
//         const profile_pic = req.file?.location;
//         const hashedPassword = await bcrypt.hash(password, 10);

//         const newUser = await User.create({
//             name,
//             email,
//             password: hashedPassword,
//             role,
//             phone_number,
//             profile_pic,
//         });

        
//         if (role === "student") {
//             await Student.create({ userId: newUser._id, name, email });
//         } else if (role === "teacher") {
//             await teacher.create({ userId: newUser._id, name, email });
//         }

//         return res.status(200).json({
//             message: "User registered successfully",
//             success: true,
//             data: newUser
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: error.message,
//             success: false,
//             description: "internall server error"
//         });
//     }
// };


// // CREATE
// export const create_teacher = async (req, res) => {
//     try {
//         const { teacher_name, teacher_phone} = req.body;

//         if (!teacher_name) {
//             return res.status(400).json({
//                 message: "name is required",
//                 success: false,
//             });
//         }

//         const create = (await teacher.create({ teacher_name, teacher_phone   }));

//         return res.status(200).json({
//             success: true,
//             message: "teacher Created successfully 😊",
//             data: create,
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: error.message,
//             success: false,
//             description: "internal server error"
//         });
//     }
// };

// // GET
// export const get_teachers = async (req, res) => {
//     try {
//         const data = await teacher.find();

//         return res.status(200).json({
//             message: "Teachers data displayed successfully",
//             success: true,
//             data:data
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: error.message,
//             success: false,
//             description: "internal server error"
//         });
//     }
// };

// // UPDATE
// export const teacher_update = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { teacher_name, teacher_phone} = req.body;

//         const updated = await teacher.findByIdAndUpdate(
//             id,
//             { teacher_name, teacher_phone},
//             { new: true }
//         );

//         return res.status(200).json({
//             message: "Teachers updated successfully",
//             success: true,
//             data: updated
//         });

//     } catch (error) {
//         res.status(500).json({
//             message: error.message,
//             success: false,
//             description: "internal server error"
//         });
//     }
// };

// // DELETE
// export const teacher_delete = async (req, res) => {
//     try {
//         const { id } = req.params;

//         await teacher.findByIdAndDelete(id);

//         return res.status(200).json({
//             message: "Teacher Records Deleted successfully",
//             success: true,
//         });

//     } catch (error) {
//         res.status(500).json({
//             message: error.message,
//             success: false,
//             description: "internal server error"
//         });
//     }
// };



// export const get_teacher_subject_students = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const teacherData = await teacher.findById(id).populate("teacher_name");
//          const subjects = await Subject.find({
//             teacher_id: id 
//         })
//         .populate("student_id", "student_name student_id")  
//         .populate("book_name"); 
//         return res.status(200).json({
//             message : "this teacher has following subjects with students data",
//             success : true,
//             data : teacherData,
//             subject_data :subjects
//         })
//     } catch (error) {
//         res.status(500).json({
//             message:(error.message),
//             success : false,
//         })
//     }
// }
