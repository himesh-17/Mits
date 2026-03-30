import express from "express";
import 'dotenv/config'
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";



import { main } from "./Services/Connections/db.connection.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { simpleRateLimit } from "./middlewares/rateLimit.middleware.js";

import authRoutes from "./Routes/Authentication/auth.routes.js";
import studentRoutes from "./Routes/Students/student.routes.js";
import admissionCellRoutes from "./Routes/Admission_Cell/admissionCell.routes.js";
import generalOfficeRoutes from "./Routes/General_Office/generalOffice.routes.js";
import accountOfficeRoutes from "./Routes/Account_Office/accountOffice.routes.js";
import hodRoutes from "./Routes/Hod/hod.routes.js";
import adminRoutes from "./Routes/Admin/admin.routes.js";

const app = express();
const port = process.env.PORT || 8080;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const trustProxy = process.env.TRUST_PROXY === "1";

if (trustProxy) {
    app.set("trust proxy", 1);
}

// Deduplicate origins so that if FRONTEND_URL === "http://localhost:3000"
// we don't send two identical entries in the CORS allow-list.
const allowedOrigins = [...new Set([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    frontendUrl,
])];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: true,
}));
app.use(express.json({ limit: "1mb" })); // guard against oversized payloads
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
app.use("/api", simpleRateLimit);

app.get("/", (req, res) => {
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

        app.listen(port, "0.0.0.0", () => {
            console.log(`Server is listening to the port ${port} on 0.0.0.0`);
        });
    } catch (error) {
        console.error("Startup failed:", error);
        process.exit(1);
    }
}
startServer();
