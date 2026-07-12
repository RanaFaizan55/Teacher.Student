import express from "express";
import { create_subject,get_subjects,update_subject ,delete_subject} from "../controller/subjects_controller.js";
import {auth} from "../middleware/auth.js"
import { roleCheck } from "../middleware/role.js";


const router = express.Router();

// GET all users
router.get("/", (req, res) => {
  res.send("Api is running");
});

router.post("/create_subject", create_subject)
router.get("/get_subject", get_subjects)
router.put("/update_subject/:id", update_subject)
router.delete("/delete_subject/:id", delete_subject)


export default router;
