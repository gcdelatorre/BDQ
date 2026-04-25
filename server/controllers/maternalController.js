import * as maternalService from "../services/maternalService.js";
import { log } from "../utils/logger.js";

/**
 * Handle saving or updating maternal immunization data
 */
export const saveMaternalRecord = async (req, res) => {
    try {
        const result = await maternalService.upsertMaternalImmunization(req.body);

        // Audit Log
        await log(req, "UPDATE", "maternal_immunization", req.body.child_id, `Updated maternal immunization record for child ID ${req.body.child_id}`);

        res.status(200).json({
            message: "Maternal immunization record saved successfully",
            data: result
        });
    } catch (error) {
        console.error("Maternal Record Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};

/**
 * Get maternal record for a child
 */
export const getMaternalRecord = async (req, res) => {
    try {
        const { child_id } = req.params;
        const result = await maternalService.getMaternalRecordByChild(child_id);

        if (!result) {
            return res.status(404).json({ message: "No maternal record found for this child" });
        }

        res.status(200).json({
            message: "Maternal record fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("Fetch Maternal Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};
