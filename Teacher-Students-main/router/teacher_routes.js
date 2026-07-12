import express from "express";
import { 
    create_teacher,
    get_teachers,
    teacher_update,
    teacher_delete,
    get_teacher_subject_students,
    register_teacher,
    quiz_marks,
    get_comments,
}
 from "../controller/teacher_controller.js";
import {auth} from "../middleware/auth.js"
import { roleCheck } from "../middleware/role.js";
import upload from "../middleware/upload.js"
const router = express.Router();

router.post("/register",upload.single("profilePic"), register_teacher);
router.post("/create_teacher",auth,roleCheck("admin", "teacher"),create_teacher);
router.get("/get_teacher", auth,roleCheck("admin", "teacher") , get_teachers)
router.put("/update_teacher/:id",auth,roleCheck("admin", "teacher"), teacher_update)
router.delete("/delete_teacher/:id",auth ,roleCheck("admin", "teacher"),teacher_delete)

router.get("/getteacher_subjects/:id",auth ,roleCheck("admin", "teacher"),get_teacher_subject_students)
router.post("/add_marks",auth ,roleCheck("admin", "teacher"),quiz_marks);
router.get("/get_comments/:id",auth ,roleCheck("admin", "teacher"),get_comments);



export default router;