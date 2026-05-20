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

/**
 * Calculate the next-week and overdue vaccine recall list
 */
export const calculateRecallSchedule = async () => {
    // 1. Get all child patients
    const [children] = await db.execute(
        `SELECT child_id, first_name, last_name, date_of_birth, mother_complete_name, complete_address, contact_number, family_serial_number 
         FROM child_patient`
    );

    // 2. Get all child immunization records
    const [records] = await db.execute(
        `SELECT child_id, vaccine_type, dose_number, date_administered 
         FROM child_immunization_record`
    );

    // Helper to normalize vaccine type names (to avoid casing/abbreviation mismatch)
    const normalizeVaccineType = (type) => {
        if (!type) return "";
        const t = type.toUpperCase().trim();
        if (t === "PENTA" || t === "PENTAVALENT") return "Pentavalent";
        if (t === "HEPB" || t === "HEPA-B-BD" || t === "HEPA-B" || t === "HEPATITIS B" || t === "HEPATITIS-B") return "HepB";
        return type;
    };

    // Create a map of completed doses: child_id -> Set of "normalizedVaccine_dose"
    const administeredMap = {};
    for (const record of records) {
        const normType = normalizeVaccineType(record.vaccine_type);
        const key = `${record.child_id}_${normType}_${record.dose_number}`;
        administeredMap[key] = record;
    }

    const VACCINE_SCHEDULE = [
        { vaccine_type: "BCG", dose_number: 1, offset_days: 0, age_label: "At Birth" },
        { vaccine_type: "HepB", dose_number: 1, offset_days: 0, age_label: "At Birth" },

        { vaccine_type: "Pentavalent", dose_number: 1, offset_days: 42, age_label: "6 Weeks" },
        { vaccine_type: "Pentavalent", dose_number: 2, offset_days: 70, age_label: "10 Weeks" },
        { vaccine_type: "Pentavalent", dose_number: 3, offset_days: 98, age_label: "14 Weeks" },

        { vaccine_type: "OPV", dose_number: 1, offset_days: 42, age_label: "6 Weeks" },
        { vaccine_type: "OPV", dose_number: 2, offset_days: 70, age_label: "10 Weeks" },
        { vaccine_type: "OPV", dose_number: 3, offset_days: 98, age_label: "14 Weeks" },

        { vaccine_type: "IPV", dose_number: 1, offset_days: 98, age_label: "14 Weeks" },
        { vaccine_type: "IPV", dose_number: 2, offset_days: 274, age_label: "9 Months" },

        { vaccine_type: "PCV", dose_number: 1, offset_days: 42, age_label: "6 Weeks" },
        { vaccine_type: "PCV", dose_number: 2, offset_days: 70, age_label: "10 Weeks" },
        { vaccine_type: "PCV", dose_number: 3, offset_days: 98, age_label: "14 Weeks" },

        { vaccine_type: "MMR", dose_number: 1, offset_days: 274, age_label: "9 Months" },
        { vaccine_type: "MMR", dose_number: 2, offset_days: 365, age_label: "12 Months" }
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recallList = [];

    for (const child of children) {
        const dob = new Date(child.date_of_birth);

        for (const sched of VACCINE_SCHEDULE) {
            const { vaccine_type, dose_number, offset_days, age_label } = sched;

            // Check if child has already received this dose
            const key = `${child.child_id}_${vaccine_type}_${dose_number}`;
            if (administeredMap[key]) {
                continue; // Already administered
            }

            // Check if child is eligible (has received previous dose if dose_number > 1)
            if (dose_number > 1) {
                const prevKey = `${child.child_id}_${vaccine_type}_${dose_number - 1}`;
                if (!administeredMap[prevKey]) {
                    continue; // Not eligible yet because previous dose is missing
                }
            }

            // Calculate due date based on DOB + offset_days
            const due_date = new Date(dob);
            due_date.setDate(due_date.getDate() + offset_days);
            due_date.setHours(0, 0, 0, 0);

            // Calculate days difference relative to today
            const diffTime = due_date.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Classification
            let status = "";
            if (diffDays < 0) {
                status = "Overdue";
            } else if (diffDays >= 0 && diffDays <= 7) {
                status = "Upcoming";
            } else {
                continue; // Too far in the future
            }

            // Age context calculation
            const ageInMonths = Math.floor((today - dob) / (1000 * 60 * 60 * 24 * 30.4375));

            recallList.push({
                child_id: child.child_id,
                first_name: child.first_name,
                last_name: child.last_name,
                date_of_birth: child.date_of_birth,
                mother_complete_name: child.mother_complete_name,
                contact_number: child.contact_number,
                complete_address: child.complete_address,
                family_serial_number: child.family_serial_number,
                age_in_months: ageInMonths >= 0 ? ageInMonths : 0,
                vaccine_type,
                dose_number,
                age_label,
                due_date: due_date.toISOString().split("T")[0],
                diff_days: diffDays,
                status
            });
        }
    }

    // Sort: Overdue first, then upcoming (closest first)
    recallList.sort((a, b) => {
        if (a.status !== b.status) {
            return a.status === "Overdue" ? -1 : 1;
        }
        return a.diff_days - b.diff_days;
    });

    return recallList;
};

/**
 * Delete/Undo an immunization record
 */
export const deleteChildImmunizationRecord = async (recordId) => {
    const [rows] = await db.execute(
        "SELECT * FROM child_immunization_record WHERE immunization_id = ?",
        [recordId]
    );
    if (rows.length === 0) {
        const err = new Error("Immunization record not found");
        err.status = 404;
        throw err;
    }

    await db.execute(
        "DELETE FROM child_immunization_record WHERE immunization_id = ?",
        [recordId]
    );

    return rows[0];
};

/**
 * Update/Change an immunization record
 */
export const updateChildImmunizationRecord = async (recordId, payload) => {
    const { date_administered, remarks = null } = payload;

    const [rows] = await db.execute(
        "SELECT * FROM child_immunization_record WHERE immunization_id = ?",
        [recordId]
    );
    if (rows.length === 0) {
        const err = new Error("Immunization record not found");
        err.status = 404;
        throw err;
    }

    await db.execute(
        "UPDATE child_immunization_record SET date_administered = ?, remarks = ? WHERE immunization_id = ?",
        [date_administered, remarks, recordId]
    );

    return { immunization_id: recordId, ...rows[0], date_administered, remarks };
};
