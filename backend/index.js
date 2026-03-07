import express from "express";
import 'dotenv/config'
import cors from "cors";

import { main } from "./Services/Connections/db.connection.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

import authRoutes from "./Routes/Authentication/auth.routes.js";
import studentRoutes from "./Routes/Students/student.routes.js";
import admissionCellRoutes from "./Routes/Admission_Cell/admissionCell.routes.js";
import generalOfficeRoutes from "./Routes/General_Office/generalOffice.routes.js";
import accountOfficeRoutes from "./Routes/Account_Office/accountOffice.routes.js";
import hodRoutes from "./Routes/HOD/hod.routes.js";
import adminRoutes from "./Routes/Admin/admin.routes.js";

const app = express();
const port = process.env.PORT || 8080;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({
    origin: frontendUrl,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admission-cell", admissionCellRoutes);
app.use("/api/general-office", generalOfficeRoutes);
app.use("/api/account-office", accountOfficeRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
    try {
        if (!process.env.GOOGLE_CLIENT_ID) {
            throw new Error("GOOGLE_CLIENT_ID is missing in environment variables");
        }

        await main();
        console.log("MongoDB is connected");

        app.listen(port, () => {
            console.log(`Server is listening to the port ${port}`);
        });
    } catch (error) {
        console.error("Startup failed:", error);
        process.exit(1);
    }
}

startServer();
