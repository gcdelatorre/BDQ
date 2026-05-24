import express from "express";
import * as medicineController from "../controllers/medicineController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/medicine/add-medicine (Admin/Nurse/Midwife)
router.post("/add-medicine", protect, restrictTo("Admin", "Nurse", "Midwife"), medicineController.addMedicine);

// POST /api/medicine/add-batch (Admin/Nurse/Midwife)
router.post("/add-batch", protect, restrictTo("Admin", "Nurse", "Midwife"), medicineController.addInventoryBatch);

// GET /api/medicine/all (Admin/Nurse/Midwife)
router.get("/all", protect, restrictTo("Admin", "Nurse", "Midwife"), medicineController.getAllMedicines);

// GET /api/medicine/history/:id (Admin/Nurse/Midwife)
router.get("/history/:id", protect, restrictTo("Admin", "Nurse", "Midwife"), medicineController.getInventoryHistory);

export default router;
