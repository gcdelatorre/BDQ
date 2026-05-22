import express from "express";
import * as patientController from "../controllers/patientController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/patient/register-child (Protected: Admin, Nurse, Midwife)
router.post("/register-child", protect, restrictTo("Admin", "Nurse", "Midwife"), patientController.register);

// GET /api/patient/get-all-patient (Protected: Admin, Nurse, Midwife)
router.get("/get-all-patient", protect, restrictTo("Admin", "Nurse", "Midwife"), patientController.getAllPatient);

// GET /api/patient/:id (Protected: Admin, Nurse, Midwife)
router.get("/:id", protect, restrictTo("Admin", "Nurse", "Midwife"), patientController.getPatientById);

// PUT /api/patient/:id (Protected: Admin, Nurse, Midwife)
router.put("/:id", protect, restrictTo("Admin", "Nurse", "Midwife"), patientController.updatePatient);

export default router;
