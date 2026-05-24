import * as nutritionService from "../services/nutritionService.js";
import { log } from "../utils/logger.js";

/**
 * Controller to record a new nutritional assessment
 */
export const recordAssessment = async (req, res) => {
    try {
        // Inject user ID from session
        const payload = { ...req.body, assessed_by_user_id: req.session.user.user_id };

        const result = await nutritionService.addNutritionalAssessment(payload);

        // Audit Log
        await log(req, "CREATE", "nutritional_assessment", result.assessment_id, `Recorded ${payload.nutritional_status} status for child ID ${payload.child_id}`);

        res.status(201).json({
            message: "Nutritional assessment saved successfully",
            data: result
        });
    } catch (error) {
        console.error("Nutrition Record Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};

/**
 * Controller to get nutrition history for a child
 */
export const getChildNutritionHistory = async (req, res) => {
    try {
        const { child_id } = req.params;
        const result = await nutritionService.getNutritionHistoryByChild(child_id);

        res.status(200).json({
            message: "Nutritional history fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("Fetch Nutrition History Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};

/**
 * Controller to delete/undo a nutritional assessment
 */
export const deleteRecord = async (req, res) => {
    try {
        const { record_id } = req.params;
        const result = await nutritionService.deleteNutritionalAssessment(record_id);

        // Audit Log
        await log(req, "DELETE", "nutritional_assessment", record_id, `Deleted nutritional assessment for child ID ${result.child_id} with ${result.nutritional_status} status`);

        res.status(200).json({
            message: "Nutritional assessment deleted successfully",
            data: result
        });
    } catch (error) {
        console.error("Delete Nutritional Assessment Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};

/**
 * Controller to update/edit a nutritional assessment
 */
export const updateRecord = async (req, res) => {
    try {
        const { record_id } = req.params;
        const result = await nutritionService.updateNutritionalAssessment(record_id, req.body);

        // Audit Log
        await log(req, "UPDATE", "nutritional_assessment", record_id, `Updated nutritional assessment for child ID ${result.child_id} with ${result.nutritional_status} status`);

        res.status(200).json({
            message: "Nutritional assessment updated successfully",
            data: result
        });
    } catch (error) {
        console.error("Update Nutritional Assessment Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};
