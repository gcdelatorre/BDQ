import express from "express";
import * as immunizationController from "../controllers/immunizationController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// 1. Record immunization (Nurse, Midwife, Admin)
// POST /api/immunization/child
router.post("/child", protect, restrictTo("Admin", "Nurse", "Midwife"), immunizationController.recordChild);

// 2. Get history for a specific child
// GET /api/immunization/child/:child_id
router.get("/child/:child_id", protect, restrictTo("Admin", "Nurse", "Midwife"), immunizationController.getChildHistory);

export default router;
