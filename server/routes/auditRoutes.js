import express from "express";
import * as auditController from "../controllers/auditController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/audit/get-all-logs (Protected: Admin, Nurse)
router.get("/get-all-logs", protect, restrictTo("Admin", "Nurse"), auditController.getAllAuditLogs);

export default router;
