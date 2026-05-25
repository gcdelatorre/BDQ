import db from "../config/db.js";

/**
 * Get monthly summary report for all patients
 * Summarizes immunization status (FIC) and displays birth weight status.
 */
export const getMonthlyPatientSummary = async (month, year) => {
    const monthFormatted = String(month).padStart(2, '0');
    const dateQuery = `${year}-${monthFormatted}%`;

    const [patients] = await db.execute(`
        SELECT cp.*, 
            (SELECT MAX(check_date) FROM breastfeeding_checkpoint bc WHERE bc.child_id = cp.child_id AND bc.is_exclusively_breastfed = 'Yes') as last_exclusive_bf_date
        FROM child_patient cp
        WHERE cp.date_of_registration LIKE ? OR cp.updated_at LIKE ?
    `, [dateQuery, dateQuery]);

    const patientIds = patients.map(p => p.child_id);
    if (patientIds.length === 0) return { patients: [], stats: {} };

    // Get immunization records for FIC/CIC
    const [immunizations] = await db.execute(`
        SELECT child_id, vaccine_type 
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
            // Display birth_weight_status as requested
            latest_status: p.birth_weight_status || '---',
            latest_weight: p.weight_at_birth_kg || '---',
            latest_height: p.length_at_birth_cm || '---',
            exclusive_bf: p.last_exclusive_bf_date ? 'Yes' : 'No'
        };
    });

    const stats = {
        totalPatients: enrichedPatients.length,
        ficCount: enrichedPatients.filter(p => p.is_fic).length,
        // Calculate based on birth weight status
        normalStatus: enrichedPatients.filter(p => p.birth_weight_status === 'Normal').length,
        exclusiveBFCount: enrichedPatients.filter(p => p.exclusive_bf === 'Yes').length
    };

    return { patients: enrichedPatients, stats };
};
