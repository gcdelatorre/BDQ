import * as auditService from "../services/auditService.js";

export const getAllAuditLogs = async (req, res) => {
    try {
        const filters = {
            search: req.query.search,
            actionType: req.query.actionType,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            page: req.query.page,
            limit: req.query.limit
        };
        const result = await auditService.getAllAuditLogs(filters);
        return res.status(200).json({
            message: "Audit logs fetched successfully!",
            ...result
        })
    } catch (error) {
        console.log("Failed to fetch audit logs", error);
        return res.status(error.status || 500).json({
            message: error.message || "Internal Server Error"
        })
    }
}

export const getAuditStats = async (req, res) => {
    try {
        const stats = await auditService.getAuditStats();
        return res.status(200).json({
            message: "Audit stats fetched successfully!",
            data: stats
        });
    } catch (error) {
        console.log("Failed to fetch audit stats", error);
        return res.status(error.status || 500).json({
            message: error.message || "Internal Server Error"
        });
    }
};