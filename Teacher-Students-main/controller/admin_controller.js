import student from "../models/students_models.js";
import Subject from "../models/subjects_models.js";
import Teachers from "../models/teachers_model.js";
import User from "../models/user_models.js";
import bcrypt from "bcryptjs";
import admin from "../models/admin_model.js"
// ============admin register

export const register_admin = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        if (role === "student") {
            await Student.create({ userId: newUser._id, name, email });
        } else if (role === "teacher") {
            await Teacher.create({ userId: newUser._id, name, email });
        } else if(role === "admin"){
            await admin.create({ userId: newUser._id, name,});
        }

        return res.status(200).json({
            message: "Admin registered successfully",
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
// =========create
export const admin_create = async(req,res) =>{
    try {
            const { admin_name, admin_phone } = req.body;
    
            if (!admin_name) {
                return res.status(400).json({
                    message: "admin name is required",
                    success: false,
                });
            }
    
             const create = await admin.create({admin_name, admin_phone});
    
            return res.status(200).json({
                success: true,
                message: "Admin Created successfully 😊",
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
