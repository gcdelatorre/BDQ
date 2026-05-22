import * as supplementService from "../services/supplementService.js";
import { log } from "../utils/logger.js";

/**
 * Controller to record a new supplementation event
 */
export const recordSupplement = async (req, res) => {
    try {
        // Inject user ID from session
        const payload = { ...req.body, administered_by_user_id: req.session.user.user_id };

        const result = await supplementService.addSupplementRecord(payload);

        // Audit Log
        await log(req, "CREATE", "supplementation_record", result.supplement_id, `Given ${payload.supplement_type} to child ID ${payload.child_id}`);

        res.status(201).json({
            message: "Supplementation record saved successfully",
            data: result
        });
    } catch (error) {
        console.error("Supplement Record Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};

/**
 * Controller to get supplementation history for a child
 */
export const getChildSupplementHistory = async (req, res) => {
    try {
        const { child_id } = req.params;
        const result = await supplementService.getSupplementHistoryByChild(child_id);

        res.status(200).json({
            message: "Supplementation history fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("Fetch Supplement History Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};

/**
 * Controller to delete/undo a supplement record
 */
export const deleteRecord = async (req, res) => {
    try {
        const { record_id } = req.params;
        const result = await supplementService.deleteSupplementRecord(record_id);

        // Audit Log
        await log(req, "DELETE", "supplementation_record", record_id, `Deleted ${result.supplement_type} record for child ID ${result.child_id}`);

        res.status(200).json({
            message: "Supplement record deleted successfully",
            data: result
        });
    } catch (error) {
        console.error("Delete Supplement Record Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};
