import express from "express";
import * as dispensingController from "../controllers/dispensingController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/dispensing/new (Admin, Nurse, Midwife)
router.post("/new", protect, restrictTo("Admin", "Nurse", "Midwife"), dispensingController.dispense);

// GET /api/dispensing/history (Admin, Nurse, Midwife)
router.get("/history", protect, restrictTo("Admin", "Nurse", "Midwife"), dispensingController.getHistory);

export default router;
