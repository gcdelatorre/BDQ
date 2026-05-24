import * as breastfeedingService from "../services/breastfeedingService.js";
import { log } from "../utils/logger.js";

import * as patientService from "../services/patientService.js";

/**
 * Controller to record a new breastfeeding checkpoint
 */
export const recordCheckpoint = async (req, res) => {
    try {
        // Inject user ID from session
        const payload = { ...req.body, recorded_by_user_id: req.session.user.user_id };

        const result = await breastfeedingService.addBreastfeedingCheckpoint(payload);

        const child = await patientService.getPatientById(payload.child_id);
        const childName = `${child.first_name} ${child.last_name}`;

        // Audit Log
        await log(req, "CREATE", "breastfeeding_checkpoint", result.checkpoint_id, `Recorded breastfeeding status for ${childName} at ${payload.age_month_target} months`);

        res.status(201).json({
            message: "Breastfeeding checkpoint saved successfully",
            data: result
        });
    } catch (error) {
        console.error("Breastfeeding Record Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};

/**
 * Controller to get breastfeeding history for a child
 */
export const getChildBreastfeedingHistory = async (req, res) => {
    try {
        const { child_id } = req.params;
        const result = await breastfeedingService.getBreastfeedingHistoryByChild(child_id);

        res.status(200).json({
            message: "Breastfeeding history fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("Fetch Breastfeeding History Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};

/**
 * Controller to delete/undo a breastfeeding checkpoint
 */
export const deleteRecord = async (req, res) => {
    try {
        const { record_id } = req.params;
        const result = await breastfeedingService.deleteBreastfeedingCheckpoint(record_id);

        // Audit Log
        await log(req, "DELETE", "breastfeeding_checkpoint", record_id, `Deleted breastfeeding checkpoint for child ID ${result.child_id} at ${result.age_month_target} months`);

        res.status(200).json({
            message: "Breastfeeding checkpoint deleted successfully",
            data: result
        });
    } catch (error) {
        console.error("Delete Breastfeeding Checkpoint Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};

/**
 * Controller to update/edit a breastfeeding checkpoint
 */
export const updateRecord = async (req, res) => {
    try {
        const { record_id } = req.params;
        const result = await breastfeedingService.updateBreastfeedingCheckpoint(record_id, req.body);

        // Audit Log
        await log(req, "UPDATE", "breastfeeding_checkpoint", record_id, `Updated breastfeeding checkpoint for child ID ${result.child_id} at ${result.age_month_target} months`);

        res.status(200).json({
            message: "Breastfeeding checkpoint updated successfully",
            data: result
        });
    } catch (error) {
        console.error("Update Breastfeeding Checkpoint Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};
