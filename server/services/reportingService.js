import db from "../config/db.js";

/**
 * Get monthly summary report for all patients
 * Summarizes immunization status (FIC), nutritional status, and breastfeeding practices.
 */
export const getMonthlyPatientSummary = async (month, year) => {
    const monthFormatted = String(month).padStart(2, '0');
    const dateQuery = `${year}-${monthFormatted}%`;

    const [patients] = await db.execute(`
        SELECT cp.*, 
            (SELECT weight_kg FROM nutritional_assessment na WHERE na.child_id = cp.child_id ORDER BY na.weight_date_taken DESC LIMIT 1) as latest_weight,
            (SELECT length_cm FROM nutritional_assessment na WHERE na.child_id = cp.child_id ORDER BY na.weight_date_taken DESC LIMIT 1) as latest_height,
            (SELECT nutritional_status FROM nutritional_assessment na WHERE na.child_id = cp.child_id ORDER BY na.weight_date_taken DESC LIMIT 1) as latest_status,
            (SELECT MAX(check_date) FROM breastfeeding_checkpoint bc WHERE bc.child_id = cp.child_id AND bc.is_exclusively_breastfed = 'Yes') as last_exclusive_bf_date
        FROM child_patient cp
        WHERE cp.date_of_registration LIKE ? OR cp.updated_at LIKE ?
    `, [dateQuery, dateQuery]);

    const patientIds = patients.map(p => p.child_id);
    if (patientIds.length === 0) return { patients: [], stats: {} };

    // Get immunization records for FIC/CIC
    const [immunizations] = await db.execute(`
        SELECT child_id, vaccine_type, date_administered 
        FROM child_immunization_record 
        WHERE child_id IN (${patientIds.join(',')})
    `);

    const enrichedPatients = patients.map(p => {
        const imm = immunizations.filter(i => i.child_id === p.child_id);
        const vaccineTypes = new Set(imm.map(i => i.vaccine_type));
        
        const isFIC = vaccineTypes.has('BCG') && vaccineTypes.has('Pentavalent') && vaccineTypes.has('MMR');
        const ageInMonths = Math.floor((new Date() - new Date(p.date_of_birth)) / (1000 * 60 * 60 * 24 * 30));

        return {
            ...p,
            age_months: ageInMonths,
            is_fic: isFIC,
            latest_status: p.latest_status || '---',
            latest_weight: p.latest_weight || '---',
            latest_height: p.latest_height || '---',
            exclusive_bf: p.last_exclusive_bf_date ? 'Yes' : 'No'
        };
    });

    const stats = {
        totalPatients: enrichedPatients.length,
        ficCount: enrichedPatients.filter(p => p.is_fic).length,
        normalNutrition: enrichedPatients.filter(p => p.latest_status === 'Normal').length,
        exclusiveBFCount: enrichedPatients.filter(p => p.exclusive_bf === 'Yes').length
    };

    return { patients: enrichedPatients, stats };
};
