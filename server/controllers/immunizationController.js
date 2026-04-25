import * as immunizationService from "../services/immunizationService.js";
import { log } from "../utils/logger.js";

/**
 * Controller to record a child's immunization
 */
export const recordChild = async (req, res) => {
    try {
        // Inject the user ID from the session (the nurse/midwife who gave the vaccine)
        const payload = { ...req.body, administered_by_user_id: req.session.user.user_id };

        const result = await immunizationService.recordChildImmunization(payload);

        // Audit Log
        await log(req, "CREATE", "child_immunization_record", result.immunization_id, `Recorded ${payload.vaccine_type} dose #${payload.dose_number} for child ID ${payload.child_id}`);

        res.status(201).json({
            message: "Immunization record saved successfully",
            data: result
        });
    } catch (error) {
        console.error("Immunization Record Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};

/**
 * Controller to fetch immunization history for a specific child
 */
export const getChildHistory = async (req, res) => {
    try {
        const { child_id } = req.params;
        const result = await immunizationService.getChildImmunizationHistory(child_id);

        res.status(200).json({
            message: "Child immunization history fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("Fetch History Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};
