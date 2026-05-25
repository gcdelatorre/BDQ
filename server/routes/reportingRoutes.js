import express from "express";
import * as reportingController from "../controllers/reportingController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/reports/monthly-summary
router.get("/monthly-summary", protect, restrictTo("Admin", "Nurse", "Midwife"), reportingController.getMonthlyPatientSummary);

export default router;
