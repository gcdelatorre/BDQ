import db from "../config/db.js";

/**
 * Record a new nutritional assessment for a child
 */
export const addNutritionalAssessment = async (payload) => {
    const {
        child_id,
        assessment_period,
        age_in_months_at_assessment,
        length_cm,
        length_date_taken,
        weight_kg,
        weight_date_taken,
        nutritional_status,
        assessed_by_user_id,
        remarks = null
    } = payload;

    const [result] = await db.execute(
        `INSERT INTO nutritional_assessment 
        (child_id, assessment_period, age_in_months_at_assessment, length_cm, length_date_taken, weight_kg, weight_date_taken, nutritional_status, assessed_by_user_id, remarks) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [child_id, assessment_period, age_in_months_at_assessment, length_cm, length_date_taken, weight_kg, weight_date_taken, nutritional_status, assessed_by_user_id, remarks]
    );

    return { assessment_id: result.insertId, ...payload };
};

/**
 * Get the history of nutritional assessments for a specific child
 */
export const getNutritionHistoryByChild = async (childId) => {
    const [rows] = await db.execute(
        `SELECT na.*, u.first_name as nurse_first, u.last_name as nurse_last 
         FROM nutritional_assessment na
         JOIN user u ON na.assessed_by_user_id = u.user_id
         WHERE na.child_id = ? 
         ORDER BY na.age_in_months_at_assessment ASC`,
        [childId]
    );
    return rows;
};
