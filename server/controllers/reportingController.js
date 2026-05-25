import * as reportingService from "../services/reportingService.js";

export const getMonthlyPatientSummary = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ message: "Month and Year are required." });
        }
        const result = await reportingService.getMonthlyPatientSummary(month, year);
        res.status(200).json({ data: result });
    } catch (error) {
        console.error("Monthly Summary Report Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
