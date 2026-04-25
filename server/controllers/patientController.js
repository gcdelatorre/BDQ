import * as patientService from "../services/patientService.js";
import { log } from "../utils/logger.js";

export const register = async (req, res) => {
    try {
        // Automatically use the ID of the Nurse/Admin who is currently logged in
        const payload = { ...req.body, registered_by_user_id: req.session.user.user_id };
        
        const result = await patientService.registerChild(payload);

        // Reusable one-liner log
        await log(req, "CREATE", "child_patient", result.data.child_id, `Registered: ${req.body.first_name} ${req.body.last_name}`);

        return res.status(200).json({
            message: "Registered Successfully!",
            data: result
        })
    } catch (error) {
        console.log("Registration Error", error);
        return res.status(error.status || 500).json({
            message: error.message || "Internal Server Error"
        });
    }
}

export const getAllPatient = async (req, res) => {
    try {
        const result = await patientService.getAllPatient();
        return res.status(200).json({
            message: "Patients fetched successfully!",
            data: result
        })
    } catch (error) {
        console.log("Failed to fetch patients", error);
        return res.status(error.status || 500).json({
            message: error.message || "Internal Server Error"
        })
    }
}