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

export const getAllAuditLogs = async () => {
    const [rows] = await db.execute(`
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
        ORDER BY al.action_timestamp DESC
    `);

    // Don't throw 404 if empty, just return empty array for the UI
    return rows;
}