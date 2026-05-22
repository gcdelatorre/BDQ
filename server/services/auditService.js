import db from "../config/db.js";

export const logAction = async (payload) => {
    const {
        user_id,
        action_performed,
        target_table,
        target_record_id = null,
        description = null
    } = payload;

    try {
        await db.execute(
            "INSERT INTO audit_log (user_id, action_performed, target_table, target_record_id, description) VALUES (?, ?, ?, ?, ?)",
            [user_id, action_performed, target_table, target_record_id, description]
        );
    } catch (error) {
        console.error("Audit Log Error:", error);
    }
};

export const getAllAuditLogs = async ({ search, actionType, startDate, endDate } = {}) => {
    let sql = `
        SELECT 
            al.log_id,
            al.user_id,
            u.username,
            u.role as user_role,
            al.action_performed as action_type,
            al.target_table as table_name,
            al.target_record_id as entity_id,
            al.action_timestamp as timestamp,
            al.description as details
        FROM audit_log al
        JOIN user u ON al.user_id = u.user_id
        WHERE 1=1
    `;
    const values = [];

    if (search && search.trim()) {
        sql += ` AND (u.username LIKE ? OR al.description LIKE ?)`;
        values.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (actionType && actionType !== "ALL") {
        sql += ` AND al.action_performed = ?`;
        values.push(actionType);
    }

    if (startDate) {
        sql += ` AND DATE(al.action_timestamp) >= ?`;
        values.push(startDate);
    }

    if (endDate) {
        sql += ` AND DATE(al.action_timestamp) <= ?`;
        values.push(endDate);
    }

    sql += ` ORDER BY al.action_timestamp DESC`;

    const [rows] = await db.execute(sql, values);
    return rows;
}