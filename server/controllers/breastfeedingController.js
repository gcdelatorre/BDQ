import * as breastfeedingService from "../services/breastfeedingService.js";
import { log } from "../utils/logger.js";

/**
 * Controller to record a new breastfeeding checkpoint
 */
export const recordCheckpoint = async (req, res) => {
    try {
        // Inject user ID from session
        const payload = { ...req.body, recorded_by_user_id: req.session.user.user_id };

        const result = await breastfeedingService.addBreastfeedingCheckpoint(payload);

        // Audit Log
        await log(req, "CREATE", "breastfeeding_checkpoint", result.checkpoint_id, `Recorded breastfeeding status for child ID ${payload.child_id} at ${payload.age_month_target} months`);

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
