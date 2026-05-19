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

// 3. Get vaccine recall list (Admin, Nurse, Midwife)
// GET /api/immunization/recall
router.get("/recall", protect, restrictTo("Admin", "Nurse", "Midwife"), immunizationController.getRecallList);

// 4. Update an immunization record (Admin, Nurse, Midwife)
// PUT /api/immunization/record/:record_id
router.put("/record/:record_id", protect, restrictTo("Admin", "Nurse", "Midwife"), immunizationController.updateRecord);

// 5. Delete/Undo an immunization record (Admin, Nurse, Midwife)
// DELETE /api/immunization/record/:record_id
router.delete("/record/:record_id", protect, restrictTo("Admin", "Nurse", "Midwife"), immunizationController.deleteRecord);

export default router;
