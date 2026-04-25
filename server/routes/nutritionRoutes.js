import express from "express";
import * as nutritionController from "../controllers/nutritionController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// 1. Record assessment (Nurse, Midwife, Admin)
// POST /api/nutrition/record
router.post("/record", protect, restrictTo("Admin", "Nurse", "Midwife"), nutritionController.recordAssessment);

// 2. Get history for a specific child
// GET /api/nutrition/child/:child_id
router.get("/child/:child_id", protect, restrictTo("Admin", "Nurse", "Midwife"), nutritionController.getChildNutritionHistory);

export default router;
