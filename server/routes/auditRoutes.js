import express from "express";
import * as auditController from "../controllers/auditController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/audit/get-all-logs (Protected: Admin, Nurse, Midwife)
router.get("/get-all-logs", protect, restrictTo("Admin", "Nurse", "Midwife"), auditController.getAllAuditLogs);

// GET /api/audit/stats (Protected: Admin, Nurse, Midwife)
router.get("/stats", protect, restrictTo("Admin", "Nurse", "Midwife"), auditController.getAuditStats);

export default router;
