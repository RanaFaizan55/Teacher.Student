import Student from "../models/students_models.js";
import Subject from "../models/subjects_models.js";
import User from "../models/user_models.js";
import Teacher from "../models/teachers_model.js";
import bcrypt from "bcryptjs";


// REGISTER
export const register_student = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const profile_pic = req.file?.location;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            profile_pic,
        });

        if (role === "student") {
            await Student.create({ userId: newUser._id, student_name: name });
        } else if (role === "teacher") {
            await Teacher.create({ userId: newUser._id, teacher_name: name });
        }

        return res.status(201).json({
            message: "Student registered successfully",
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

// CREATE STUDENT
export const create_student = async (req, res) => {
    try {
        const { student_name, student_phone } = req.body;

        if (!student_name) {
            return res.status(400).json({
                message: "student_name is required",
                success: false,
            });
        }

        const create = await Student.create({ student_name, student_phone });

        return res.status(201).json({
            success: true,
            message: "Student created successfully",
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

// GET ALL STUDENTS
export const get_student = async (req, res) => {
    try {
        const data = await Student.find()
        return res.status(200).json({
            message: "Students fetched successfully",
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

// UPDATE STUDENT
export const student_update = async (req, res) => {
    try {
        const { id } = req.params;
        const { student_name, student_phone } = req.body;

        const updated = await Student.findByIdAndUpdate(
            id,
            { student_name, student_phone },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                message: "Student not found",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Student updated successfully",
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

// DELETE STUDENT
export const student_delete = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Student.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                message: "Student not found",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Student deleted successfully",
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

// GET SINGLE STUDENT → SUBJECTS → TEACHER

export const get_students_subject_teacher = async (req, res) => {
    try {
        const { id } = req.params;

        const studentData = await Student.findById(id)
            .populate({
                path: "subject_ids",
                select: "book_name",
                populate: {
                    path: "teacher_id",
                    select: "teacher_name teacher_phone",
                }
            });

        if (!studentData) {
            return res.status(404).json({
                message: "Student not found",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Student with subjects and teacher",
            success: true,
            data: studentData,
            // data2:studentData2
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
        });
    }
};
// add comments/reviws
export const coments = async (req, res) => {
    try {
        const { student_id, subject_id, comment , rating} = req.body; 
        if (!student_id || !subject_id) {
            return res.status(400).json({
                message: "No parameters provided",
                success: false,
            });
        }

        
        const subject = await Subject.findById(subject_id);
        if (!subject) {
            return res.status(404).json({
                message: "Subject not found",
                success: false,
            });
        }

        const teacher_id = subject.teacher_id; 

        const updatedStudent = await Student.findByIdAndUpdate(
            student_id,                        
            {
                $push: {
                    comments: {
                        subject_id,
                        teacher_id,
                        comment,
                        rating
                    }
                }
            },
            { new: true }
        )
        .populate("comments.teacher_id", "teacher_name")
        .populate("comments.subject_id", "book_name");

        return res.status(200).json({
            message: "Comment added successfully",
            success: true,
            data: updatedStudent.comments,
        });

    } catch (err) {
        return res.status(500).json({ message: err.message, success: false });
    }
};




// import student from "../models/students_models.js";
// import Subject from "../models/subjects_models.js";
// import Teachers from "../models/teachers_model.js";
// import User from "../models/user_models.js";
// import bcrypt from "bcryptjs";

// // =======signup/register==================
// export const register_student = async (req, res) => {
//     try {
//         const { name, email, password, role } = req.body;

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const newUser = await User.create({
//             name,
//             email,
//             password: hashedPassword,
//             role,
//         });

//         if (role === "student") {
//             await Student.create({ userId: newUser._id, name, email });
//         } else if (role === "teacher") {
//             await Teacher.create({ userId: newUser._id, name, email });
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
//             description: "internal server error"
//         });
//     }
// };
// // CREATE
// export const create_student = async (req, res) => {
//     try {
//         const { student_name, student_id, subject } = req.body;

//         if (!student_name) {
//             return res.status(400).json({
//                 message: "name is required",
//                 success: false,
//             });
//         }

//         const create = await student.create({student_name,student_id,subject});

//         return res.status(200).json({
//             success: true,
//             message: "student Created successfully 😊",
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
// export const get_student = async (req, res) => {
//     try {
//         const student_data = await student.find();

//         return res.status(200).json({
//             message: "students data displayed successfully",
//             success: true,
//             data: student_data,
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
// export const student_update = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { student_name, student_id, subject } = req.body;

//         const updated = await student.findByIdAndUpdate(
//             id,
//             { student_name, student_id, subject },
//             { new: true }
//         );

//         return res.status(200).json({
//             message: "students updated successfully",
//             success: true,
//             data: updated
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: error.message,
//             success: false,
//             description: "internal server error"
//         });
//     }
// };

// // DELETE
// export const student_delete = async (req, res) => {
//     try {
//         const { id } = req.params;

//         await student.findByIdAndDelete(id);

//         return res.status(200).json({
//             message: "student Records Deleted successfully",
//             success: true,
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: error.message,
//             success: false,
//             description: "internal server error"
//         });
//     }
// };


// // export const get_student_subject = async (req, res) => {
// //     try {
// //         const { id } = req.params;

// //         const studentData = await student.findById(id);
// //          const subjects = await Subject.find({
// //             student_id: id
// //         });
// //         return res.status(200).json({
// //             message : "this student_id has following subjects with student data",
// //             success : true,
// //             data : studentData,
// //             subject_data :subjects
// //         })
// //     } catch (error) {
// //         res.status(500).json({
// //             message:(error.message),
// //             success : false,
// //         })
// //     }
// // }



// export const get_students_subject_teacher = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const studentdata = await student.findById(id).populate("student_name");
//          const subjects = await Subject.find({
//             student_id: id
//         })
//         // .populate("teacher_id", "teacher_name")
//         .populate("book_name","student_name");
//         return res.status(200).json({
//             message : "this teacher has following subjects with students data",
//             success : true,
//             data : studentdata,
//             subject_data :subjects
//         })
//     } catch (error) {
//         res.status(500).json({
//             message:(error.message),
//             success : false,
//         })
//     }
// }
