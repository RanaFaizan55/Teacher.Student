import express from "express";
import { admin_create , register_admin }from "../controller/admin_controller.js";
import {adminLogin} from "../controller/auth_controller.js"
import {auth} from "../middleware/auth.js"
import { roleCheck } from "../middleware/role.js";


const router = express.Router();
router.post("/register_admin"  , register_admin)
router.post("/admin" , auth,roleCheck ("admin"),admin_create)
router.post("/admin/adminLogin" ,adminLogin)

export default router;
