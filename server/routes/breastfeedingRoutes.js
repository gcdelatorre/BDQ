import express from "express";
import * as breastfeedingController from "../controllers/breastfeedingController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// 1. Record checkpoint (Nurse, Midwife, Admin)
// POST /api/breastfeeding/record
router.post("/record", protect, restrictTo("Admin", "Nurse", "Midwife"), breastfeedingController.recordCheckpoint);

// 2. Get history for a specific child
// GET /api/breastfeeding/child/:child_id
router.get("/child/:child_id", protect, restrictTo("Admin", "Nurse", "Midwife"), breastfeedingController.getChildBreastfeedingHistory);

export default router;
