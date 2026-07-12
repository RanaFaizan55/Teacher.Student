
import express from "express";
import  {login , forgotPassword ,resetPassword, verify_phone_otp,forgotPasswordToken,toggle_status ,resetPasswordApp , verifyEmailToken , verifyEmail,updatePassword,phone_otp}   from "../controller/auth_controller.js";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { my_profile , adminLogin } from "../controller/auth_controller.js";

const routes = express.Router();
// PUBLIC

routes.post("/login", login);
routes.get("/my",auth , my_profile)
routes.post("/admin/login",auth , roleCheck("admin") , adminLogin);
routes.post("/verifyemail-token",verifyEmailToken),
routes.post("/verifyemail",verifyEmail),
routes.post("/forgot-password-token", forgotPasswordToken);
routes.post("/forgot-password", forgotPassword);
routes.patch("/reset-password-app", resetPasswordApp);
routes.patch("/reset-password", resetPassword);
routes.patch("/updatePassword",auth, updatePassword);
routes.post("/toggle_status",auth,roleCheck("admin"), toggle_status);
routes.post("/phone_otp",phone_otp);
routes.post("/verify_phone_otp",verify_phone_otp);


export default routes;

