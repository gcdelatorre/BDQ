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

/**
 * Delete/Undo a supplement record
 */
export const deleteSupplementRecord = async (supplementId) => {
    const [rows] = await db.execute(
        "SELECT * FROM supplementation_record WHERE supplement_id = ?",
        [supplementId]
    );
    if (rows.length === 0) {
        const err = new Error("Supplement record not found");
        err.status = 404;
        throw err;
    }

    await db.execute(
        "DELETE FROM supplementation_record WHERE supplement_id = ?",
        [supplementId]
    );

    return rows[0];
};

/**
 * Update/Edit a supplement record
 */
export const updateSupplementRecord = async (supplementId, payload) => {
    const {
        supplement_type,
        target_age_months,
        date_given,
        remarks = null
    } = payload;

    const [rows] = await db.execute(
        "SELECT * FROM supplementation_record WHERE supplement_id = ?",
        [supplementId]
    );
    if (rows.length === 0) {
        const err = new Error("Supplement record not found");
        err.status = 404;
        throw err;
    }

    await db.execute(
        "UPDATE supplementation_record SET supplement_type = ?, target_age_months = ?, date_given = ?, remarks = ? WHERE supplement_id = ?",
        [supplement_type, target_age_months, date_given, remarks, supplementId]
    );

    return { supplement_id: supplementId, ...rows[0], supplement_type, target_age_months, date_given, remarks };
};
