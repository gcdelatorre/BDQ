import express from "express";
import * as supplementController from "../controllers/supplementController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// 1. Record supplement (Nurse, Midwife, Admin)
// POST /api/supplement/record
router.post("/record", protect, restrictTo("Admin", "Nurse", "Midwife"), supplementController.recordSupplement);

// 2. Get history for a specific child
// GET /api/supplement/child/:child_id
router.get("/child/:child_id", protect, restrictTo("Admin", "Nurse", "Midwife"), supplementController.getChildSupplementHistory);

export default router;
