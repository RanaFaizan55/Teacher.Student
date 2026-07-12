import express from "express"
import { create_student ,get_student ,student_update ,coments, student_delete ,get_students_subject_teacher , register_student} from "../controller/students_controller.js";
import {auth} from "../middleware/auth.js"
import { roleCheck } from "../middleware/role.js";
// ---------students routes-------->
const router = express.Router();

router.get("/register" , register_student)
router.post("/create_student",auth,roleCheck("admin","teacher","student") ,create_student)
router.get("/get_students",auth,roleCheck("admin","teacher","student"),get_student)
router.put("/update_student/:id",auth,roleCheck("admin","teacher","student"), student_update)
router.delete("/delete_student/:id",auth,roleCheck("admin","teacher","student"), student_delete)
router.get("/get_students_record/:id",auth,roleCheck("admin","student"), get_students_subject_teacher)

router.post("/coments",auth,roleCheck("admin","teacher","student") ,coments)

export default router;