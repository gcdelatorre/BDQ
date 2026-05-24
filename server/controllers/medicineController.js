import * as medicineService from "../services/medicineService.js";
import { log } from "../utils/logger.js";

/**
 * Register a new medicine type in the catalog
 */
export const addMedicine = async (req, res) => {
    try {
        // Automatically inject the user ID from the session
        const payload = { ...req.body, created_by_user_id: req.session.user.user_id };
        
        const result = await medicineService.addMedicine(payload);

        await log(req, "CREATE", "medicine", result.medicine_id, `Added ${payload.medicine_name} to medicine catalog`);

        res.status(201).json({
            message: "Medicine added to catalog successfully",
            data: result
        });
    } catch (error) {
        console.error("Add Medicine Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};
/**
 * Add a new batch of stock for an existing medicine
 */
export const addInventoryBatch = async (req, res) => {
    try {
        const result = await medicineService.addInventoryBatch(req.body);

        // Fetch medicine name for audit log
        const medicines = await medicineService.getAllMedicines();
        const medicine = medicines.find(m => m.medicine_id == req.body.medicine_id);
        const medName = medicine ? medicine.medicine_name : `ID ${req.body.medicine_id}`;

        // Audit Log
        await log(req, "CREATE", "inventory", result.inventory_id, `Added batch ${req.body.batch_number} for ${medName}`);

        res.status(201).json({
            message: "Batch added successfully",
            data: result
        });
    } catch (error) {
        console.error("Add Batch Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};

/**
 * Get all medicines with current total stock
 */
export const getAllMedicines = async (req, res) => {
    try {
        const result = await medicineService.getAllMedicines();
        res.status(200).json({
            message: "Medicines fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("Get Medicines Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};

/**
 * Get Batch history for a specific medicine
 */
export const getInventoryHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await medicineService.getInventoryHistory(id);
        res.status(200).json({
            message: "Inventory history fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("Get Inventory History Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};
