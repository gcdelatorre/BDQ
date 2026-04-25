import db from "../config/db.js";

/**
 * Record a new breastfeeding checkpoint for a child
 */
export const addBreastfeedingCheckpoint = async (payload) => {
    const {
        child_id,
        age_month_target,
        is_exclusively_breastfed,
        check_date,
        recorded_by_user_id,
        remarks = null
    } = payload;

    const [result] = await db.execute(
        `INSERT INTO breastfeeding_checkpoint 
        (child_id, age_month_target, is_exclusively_breastfed, check_date, recorded_by_user_id, remarks) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [child_id, age_month_target, is_exclusively_breastfed, check_date, recorded_by_user_id, remarks]
    );

    return { checkpoint_id: result.insertId, ...payload };
};

/**
 * Get all breastfeeding checkpoints for a specific child
 */
export const getBreastfeedingHistoryByChild = async (childId) => {
    const [rows] = await db.execute(
        `SELECT bc.*, u.first_name as nurse_first, u.last_name as nurse_last 
         FROM breastfeeding_checkpoint bc
         JOIN user u ON bc.recorded_by_user_id = u.user_id
         WHERE bc.child_id = ? 
         ORDER BY bc.age_month_target ASC`,
        [childId]
    );
    return rows;
};
