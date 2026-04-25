import db from "../config/db.js";

/**
 * Record a new vaccine dose for a child
 */
export const recordChildImmunization = async (payload) => {
    const {
        child_id,
        vaccine_type,
        dose_number,
        date_administered,
        administered_by_user_id,
        remarks = null
    } = payload;

    const [result] = await db.execute(
        "INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id, remarks) VALUES (?, ?, ?, ?, ?, ?)",
        [child_id, vaccine_type, dose_number, date_administered, administered_by_user_id, remarks]
    );

    return { immunization_id: result.insertId, ...payload };
};

/**
 * Get the full immunization history of a specific child
 */
export const getChildImmunizationHistory = async (childId) => {
    const [rows] = await db.execute(
        `SELECT ir.*, u.first_name as nurse_first, u.last_name as nurse_last 
         FROM child_immunization_record ir
         JOIN user u ON ir.administered_by_user_id = u.user_id
         WHERE ir.child_id = ? 
         ORDER BY ir.date_administered DESC`,
        [childId]
    );
    return rows;
};
