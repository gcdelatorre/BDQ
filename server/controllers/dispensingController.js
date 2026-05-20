import * as dispensingService from "../services/dispensingService.js";
import { log } from "../utils/logger.js";

/**
 * Handle a new dispensing transaction
 */
export const dispense = async (req, res) => {
    try {
        // Inject the user ID of the nurse/midwife doing the dispensing
        const payload = { ...req.body, user_id: req.session.user.user_id };

        const result = await dispensingService.dispenseMedicine(payload);

        // Audit Log
        await log(req, "CREATE", "dispensing_transaction", result.transaction_id, `Dispensed medicine(s) to child ID ${payload.child_id}`);

        res.status(201).json({
            message: "Medicine(s) dispensed successfully",
            data: result
        });
    } catch (error) {
        console.error("Dispensing Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};

/**
 * Fetch all dispensing history
 */
export const getDispensingCount = async (req, res) => {
    try {
        const total = await dispensingService.getDispensingCount();
        res.status(200).json({
            message: "Dispensing count fetched successfully",
            data: { total }
        });
    } catch (error) {
        console.error("Fetch Dispensing Count Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};

export const getHistory = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
        const result = await dispensingService.getDispensingHistory(limit);
        res.status(200).json({
            message: "Dispensing history fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("Fetch History Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};

/**
 * Fetch dispensing history for a specific child
 */
export const getHistoryByChild = async (req, res) => {
    try {
        const { childId } = req.params;
        const result = await dispensingService.getHistoryByChild(childId);
        res.status(200).json({
            message: "Child dispensing history fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("Fetch Child History Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};
