import db from "../config/db.js";

/**
 * Record a new supplement given to a child
 */
export const addSupplementRecord = async (payload) => {
    const {
        child_id,
        supplement_type,
        target_age_months,
        date_given,
        administered_by_user_id,
        remarks = null
    } = payload;

    const [result] = await db.execute(
        `INSERT INTO supplementation_record 
        (child_id, supplement_type, target_age_months, date_given, administered_by_user_id, remarks) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [child_id, supplement_type, target_age_months, date_given, administered_by_user_id, remarks]
    );

    return { supplement_id: result.insertId, ...payload };
};

/**
 * Get all supplements given to a specific child
 */
export const getSupplementHistoryByChild = async (childId) => {
    const [rows] = await db.execute(
        `SELECT sr.*, u.first_name as nurse_first, u.last_name as nurse_last 
         FROM supplementation_record sr
         JOIN user u ON sr.administered_by_user_id = u.user_id
         WHERE sr.child_id = ? 
         ORDER BY sr.date_given DESC`,
        [childId]
    );
    return rows;
};
