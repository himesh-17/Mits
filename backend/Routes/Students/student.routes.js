import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { requireRole, verifyJWT } from "../../middlewares/auth.middleware.js";
import {
    getOrCreateApplication,
    updateApplication,
    submitApplication,
    uploadDocumentFile,
    uploadDocument,
    getMyDocuments,
    getMyPayment,
    submitPayment,
} from "../../controllers/student.controller.js";

const router = express.Router();

const uploadsDir = path.resolve(process.cwd(), "uploads", "documents");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const safeBase = path
            .parse(file.originalname || "document")
            .name
            .replace(/[^a-zA-Z0-9_-]/g, "_")
            .slice(0, 80) || "document";
        const ext = path.extname(file.originalname || "").toLowerCase();
        cb(null, `${Date.now()}-${safeBase}${ext}`);
    },
});

const allowedMimeTypes = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
]);

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (allowedMimeTypes.has((file.mimetype || "").toLowerCase())) {
            cb(null, true);
            return;
        }
        cb(new Error("Unsupported file type"));
    },
});

router.use(verifyJWT, requireRole("student"));

router.get("/application", getOrCreateApplication);
router.patch("/application", updateApplication);
router.post("/application/submit", submitApplication);

router.post("/documents/upload", upload.single("file"), uploadDocumentFile);
router.post("/documents", uploadDocument);
router.get("/documents", getMyDocuments);

router.get("/payment", getMyPayment);
router.post("/payment/submit", submitPayment);

export default router;
