import express from "express";
import * as maternalController from "../controllers/maternalController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// 1. Save or Update record
// POST /api/maternal/save
router.post("/save", protect, restrictTo("Admin", "Nurse", "Midwife"), maternalController.saveMaternalRecord);

// 2. Get record for a child
// GET /api/maternal/child/:child_id
router.get("/child/:child_id", protect, restrictTo("Admin", "Nurse", "Midwife"), maternalController.getMaternalRecord);

export default router;
