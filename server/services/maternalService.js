import db from "../config/db.js";

/**
 * Save or Update Maternal Immunization doses for a specific child.
 * Using "ON DUPLICATE KEY UPDATE" to handle one record per child.
 */
export const upsertMaternalImmunization = async (payload) => {
    const {
        child_id,
        tt2_td2_date = null,
        tt3_date = null,
        tt4_date = null,
        tt5_date = null,
        notes = null
    } = payload;

    const [result] = await db.execute(
        `INSERT INTO maternal_immunization (child_id, tt2_td2_date, tt3_date, tt4_date, tt5_date, notes) 
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
            tt2_td2_date = VALUES(tt2_td2_date),
            tt3_date = VALUES(tt3_date),
            tt4_date = VALUES(tt4_date),
            tt5_date = VALUES(tt5_date),
            notes = VALUES(notes)`,
        [child_id, tt2_td2_date, tt3_date, tt4_date, tt5_date, notes]
    );

    return { child_id, ...payload };
};

/**
 * Get the maternal immunization record for a specific child
 */
export const getMaternalRecordByChild = async (childId) => {
    const [rows] = await db.execute(
        "SELECT * FROM maternal_immunization WHERE child_id = ?",
        [childId]
    );
    return rows[0] || null;
};
