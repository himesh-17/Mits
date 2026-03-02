import express from "express";
import 'dotenv/config'
import cors from "cors";

import { main } from "./Services/Connections/db.connection.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";

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
