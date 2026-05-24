import * as immunizationService from "../services/immunizationService.js";
import { log } from "../utils/logger.js";

import * as patientService from "../services/patientService.js";

/**
 * Controller to record a child's immunization
 */
export const recordChild = async (req, res) => {
    try {
        // Inject the user ID from the session (the nurse/midwife who gave the vaccine)
        const payload = { ...req.body, administered_by_user_id: req.session.user.user_id };

        const result = await immunizationService.recordChildImmunization(payload);

        // Fetch child name for audit log
        const child = await patientService.getPatientById(payload.child_id);
        const childName = `${child.first_name} ${child.last_name}`;

        // Audit Log
        await log(req, "CREATE", "child_immunization_record", result.immunization_id, `Recorded ${payload.vaccine_type} dose #${payload.dose_number} for ${childName}`);

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

/**
 * Controller to fetch the next-week and overdue vaccine recall list
 */
export const getRecallList = async (req, res) => {
    try {
        const result = await immunizationService.calculateRecallSchedule();
        res.status(200).json({
            message: "Vaccine recall schedule list calculated successfully",
            data: result
        });
    } catch (error) {
        console.error("Get Recall List Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};

/**
 * Controller to delete/undo an immunization record
 */
export const deleteRecord = async (req, res) => {
    try {
        const { record_id } = req.params;
        const result = await immunizationService.deleteChildImmunizationRecord(record_id);

        // Fetch child name for audit log
        const child = await patientService.getPatientById(result.child_id);
        const childName = `${child.first_name} ${child.last_name}`;

        // Audit Log
        await log(req, "DELETE", "child_immunization_record", record_id, `Undid/deleted ${result.vaccine_type} dose #${result.dose_number} for ${childName}`);

        res.status(200).json({
            message: "Immunization record deleted successfully",
            data: result
        });
    } catch (error) {
        console.error("Delete Immunization Record Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};

/**
 * Controller to update/edit an immunization record
 */
export const updateRecord = async (req, res) => {
    try {
        const { record_id } = req.params;
        const result = await immunizationService.updateChildImmunizationRecord(record_id, req.body);

        // Fetch child name for audit log
        const child = await patientService.getPatientById(result.child_id);
        const childName = `${child.first_name} ${child.last_name}`;

        // Audit Log
        await log(req, "UPDATE", "child_immunization_record", record_id, `Updated ${result.vaccine_type} dose #${result.dose_number} for ${childName}`);

        res.status(200).json({
            message: "Immunization record updated successfully",
            data: result
        });
    } catch (error) {
        console.error("Update Immunization Record Error:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
    }
};
