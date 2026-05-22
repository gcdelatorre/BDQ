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

// 3. Update a breastfeeding checkpoint (Nurse, Midwife, Admin)
// PUT /api/breastfeeding/record/:record_id
router.put("/record/:record_id", protect, restrictTo("Admin", "Nurse", "Midwife"), breastfeedingController.updateRecord);

// 4. Delete/Undo a breastfeeding checkpoint (Nurse, Midwife, Admin)
// DELETE /api/breastfeeding/record/:record_id
router.delete("/record/:record_id", protect, restrictTo("Admin", "Nurse", "Midwife"), breastfeedingController.deleteRecord);

export default router;
