import db from "../config/db.js";

/**
 * Calculate if child is FIC (Fully Immunized Child)
 * FIC = All vaccines up to 12 months:
 * - BCG (1 dose)
 * - HepB (1 dose)
 * - Pentavalent (3 doses)
 * - OPV (3 doses)
 * - IPV (2 doses by 12 months)
 * - PCV (3 doses)
 * - MMR (1 dose by 12 months)
 */
export const calculateFICStatus = async (childId) => {
    const [records] = await db.execute(
        `SELECT vaccine_type, COUNT(*) as count
         FROM child_immunization_record
         WHERE child_id = ?
         GROUP BY vaccine_type`,
        [childId]
    );

    const vaccineMap = {};
    records.forEach(r => {
        vaccineMap[r.vaccine_type] = r.count;
    });

    // Check if FIC requirements are met
    const isFIC = (
        (vaccineMap['BCG'] >= 1 || vaccineMap['BCG'] === 1) &&
        (vaccineMap['HepB'] >= 1 || vaccineMap['HepB'] === 1) &&
        (vaccineMap['Pentavalent'] >= 3 || vaccineMap['Pentavalent'] === 3) &&
        (vaccineMap['OPV'] >= 3 || vaccineMap['OPV'] === 3) &&
        (vaccineMap['PCV'] >= 3 || vaccineMap['PCV'] === 3) &&
        (vaccineMap['MMR'] >= 1 || vaccineMap['MMR'] === 1)
    );

    if (!isFIC) return null;

    // Get the most recent date of last required vaccine
    const [latestDose] = await db.execute(
        `SELECT MAX(date_administered) as fic_date
         FROM child_immunization_record
         WHERE child_id = ? AND vaccine_type IN ('BCG', 'HepB', 'Pentavalent', 'OPV', 'PCV', 'MMR')`,
        [childId]
    );

    return latestDose[0]?.fic_date || null;
};

/**
 * Calculate if child is CIC (Completely Immunized Child)
 * CIC = All vaccines including boosters
 * - All FIC requirements
 * - IPV (2 doses total)
 * - Pentavalent booster (1 dose)
 * - OPV booster (1 dose)
 * - MMR booster (1 dose)
 */
export const calculateCICStatus = async (childId) => {
    const [records] = await db.execute(
        `SELECT vaccine_type, COUNT(*) as count
         FROM child_immunization_record
         WHERE child_id = ?
         GROUP BY vaccine_type`,
        [childId]
    );

    const vaccineMap = {};
    records.forEach(r => {
        vaccineMap[r.vaccine_type] = r.count;
    });

    // Check if CIC requirements are met (more complete than FIC)
    const isCIC = (
        (vaccineMap['BCG'] >= 1) &&
        (vaccineMap['HepB'] >= 1) &&
        (vaccineMap['Pentavalent'] >= 4) && // 3 primary + 1 booster
        (vaccineMap['OPV'] >= 4) && // 3 primary + 1 booster
        (vaccineMap['IPV'] >= 2) &&
        (vaccineMap['PCV'] >= 3) &&
        (vaccineMap['MMR'] >= 2) // Primary + booster
    );

    if (!isCIC) return null;

    // Get the most recent date of all boosters
    const [latestDose] = await db.execute(
        `SELECT MAX(date_administered) as cic_date
         FROM child_immunization_record
         WHERE child_id = ?`,
        [childId]
    );

    return latestDose[0]?.cic_date || null;
};

/**
 * Calculate breastfeeding milestones from checkpoint records
 */
export const calculateBreastfeedingMilestones = async (childId) => {
    const [checkpoints] = await db.execute(
        `SELECT age_month_target, is_exclusively_breastfed, check_date
         FROM breastfeeding_checkpoint
         WHERE child_id = ?
         ORDER BY age_month_target ASC`,
        [childId]
    );

    let initiated = null;
    let exclusively_6_months = null;

    if (checkpoints.length > 0) {
        // Breastfeeding Initiated = first checkpoint date
        initiated = checkpoints[0].check_date;

        // Exclusively Breastfed at 6 months = checkpoint at 6 months milestone
        const sixMonthCheckpoint = checkpoints.find(c => c.age_month_target === 6);
        if (sixMonthCheckpoint && sixMonthCheckpoint.is_exclusively_breastfed === 1) {
            exclusively_6_months = "Yes";
        }
    }

    return {
        initiated_breastfeeding_date: initiated,
        exclusively_breastfed_6_months: exclusively_6_months
    };
};

/**
 * Calculate complementary foods introduction from nutrition records
 */
export const calculateComplementaryFoods = async (childId) => {
    // Check if there's any nutrition assessment at 6 months or after
    const [assessments] = await db.execute(
        `SELECT assessment_id FROM nutritional_assessment
         WHERE child_id = ? AND age_in_months_at_assessment >= 6
         LIMIT 1`,
        [childId]
    );

    return assessments.length > 0 ? "Yes" : null;
};

/**
 * Fetch patient with auto-calculated milestones
 */
export const getPatientWithCalculatedMilestones = async (childId) => {
    const [patients] = await db.execute(
        "SELECT * FROM child_patient WHERE child_id = ?",
        [childId]
    );

    if (patients.length === 0) {
        const err = new Error("Patient not found");
        err.status = 404;
        throw err;
    }

    const patient = patients[0];

    // Calculate auto-populated milestones
    const ficDate = await calculateFICStatus(childId);
    const cicDate = await calculateCICStatus(childId);
    const breastfeedingData = await calculateBreastfeedingMilestones(childId);
    const complementaryFoods = await calculateComplementaryFoods(childId);

    // Merge with existing patient data, but only auto-fill if not manually set
    return {
        ...patient,
        fic_date: patient.fic_date || ficDate,
        cic_date: patient.cic_date || cicDate,
        initiated_breastfeeding_date: patient.initiated_breastfeeding_date || breastfeedingData.initiated_breastfeeding_date,
        exclusively_breastfed_6_months: patient.exclusively_breastfed_6_months || breastfeedingData.exclusively_breastfed_6_months,
        intro_complementary_foods: patient.intro_complementary_foods || complementaryFoods
    };
};
