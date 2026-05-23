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

export const getAllAuditLogs = async ({ search, actionType, startDate, endDate, page = 1, limit = 20 } = {}) => {
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.max(1, parseInt(limit) || 20);
    const offset = (parsedPage - 1) * parsedLimit;

    let whereClauses = ["1=1"];
    const values = [];

    if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        whereClauses.push(`(u.username LIKE ? OR al.description LIKE ? OR cp.first_name LIKE ? OR cp.last_name LIKE ?)`);
        values.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (actionType && actionType !== "ALL") {
        whereClauses.push(`al.action_performed = ?`);
        values.push(actionType);
    }

    if (startDate) {
        whereClauses.push(`DATE(al.action_timestamp) >= ?`);
        values.push(startDate);
    }

    if (endDate) {
        whereClauses.push(`DATE(al.action_timestamp) <= ?`);
        values.push(endDate);
    }

    const whereSql = whereClauses.join(" AND ");

    // Get total count for pagination
    const countSql = `
        SELECT COUNT(*) as total
        FROM audit_log al
        JOIN user u ON al.user_id = u.user_id
        LEFT JOIN child_patient cp ON 
            (al.target_table = 'child_patient' AND al.target_record_id = cp.child_id) OR
            (al.target_table = 'child_immunization_record' AND al.target_record_id = (SELECT child_id FROM child_immunization_record WHERE immunization_id = al.target_record_id)) OR
            (al.target_table = 'breastfeeding_checkpoint' AND al.target_record_id = (SELECT child_id FROM breastfeeding_checkpoint WHERE checkpoint_id = al.target_record_id)) OR
            (al.target_table = 'nutritional_assessment' AND al.target_record_id = (SELECT child_id FROM nutritional_assessment WHERE assessment_id = al.target_record_id)) OR
            (al.target_table = 'supplementation_record' AND al.target_record_id = (SELECT child_id FROM supplementation_record WHERE supplement_id = al.target_record_id))
        WHERE ${whereSql}
    `;

    const [[{ total }]] = await db.execute(countSql, values);

    const sql = `
        SELECT 
            al.log_id,
            al.user_id,
            u.username,
            u.role as user_role,
            al.action_performed as action_type,
            al.target_table as table_name,
            al.target_record_id as entity_id,
            al.action_timestamp as timestamp,
            CASE 
                WHEN al.target_table = 'child_patient' AND cp.first_name IS NOT NULL 
                THEN CONCAT(al.description, ' (', cp.first_name, ' ', cp.last_name, ')')
                WHEN al.target_table IN ('child_immunization_record', 'breastfeeding_checkpoint', 'nutritional_assessment', 'supplementation_record') AND cp.first_name IS NOT NULL 
                THEN CONCAT(al.description, ' (', cp.first_name, ' ', cp.last_name, ')')
                ELSE al.description 
            END as details
        FROM audit_log al
        JOIN user u ON al.user_id = u.user_id
        LEFT JOIN child_patient cp ON 
            (al.target_table = 'child_patient' AND al.target_record_id = cp.child_id) OR
            (al.target_table = 'child_immunization_record' AND al.target_record_id = (SELECT child_id FROM child_immunization_record WHERE immunization_id = al.target_record_id)) OR
            (al.target_table = 'breastfeeding_checkpoint' AND al.target_record_id = (SELECT child_id FROM breastfeeding_checkpoint WHERE checkpoint_id = al.target_record_id)) OR
            (al.target_table = 'nutritional_assessment' AND al.target_record_id = (SELECT child_id FROM nutritional_assessment WHERE assessment_id = al.target_record_id)) OR
            (al.target_table = 'supplementation_record' AND al.target_record_id = (SELECT child_id FROM supplementation_record WHERE supplement_id = al.target_record_id))
        WHERE ${whereSql}
        ORDER BY al.action_timestamp DESC
        LIMIT ? OFFSET ?
    `;

    const [rows] = await db.execute(sql, [...values, parsedLimit, offset]);

    return {
        data: rows,
        meta: {
            total,
            totalPages: Math.ceil(total / parsedLimit),
            currentPage: parsedPage,
            limit: parsedLimit
        }
    };
}