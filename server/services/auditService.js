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
    const [rows] = await db.execute(
        "SELECT * FROM audit_log ORDER BY action_timestamp DESC"
    );

    if (rows.length < 1) {
        throw ({
            status: 404,
            message: "No audit logs found"
        })
    }

    return rows;
}