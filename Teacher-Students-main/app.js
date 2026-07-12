import express from "express";
import dotenv from "dotenv";
import router from "./router/router.js";
import authRoutes from "./router/auth_routes.js";
import teacherRoutes from "./router/teacher_routes.js";
import studentRoutes from "./router/student_routes.js";
import admin from "./router/admin_routes.js";


dotenv.config();

const app = express();

app.use(express.json());

// ✅ ROUTES MOUNT KARO
app.use("/api", router);
app.use("/api/auth", authRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", admin);


export default app;