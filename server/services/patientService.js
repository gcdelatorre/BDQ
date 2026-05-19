import db from "../config/db.js";

export const registerChild = async (payload) => {
    const {
        registered_by_user_id,
        date_of_registration,
        family_serial_number,
        first_name,
        middle_initial = null,
        last_name,
        sex,
        date_of_birth,
        mother_complete_name,
        contact_number = null,
        complete_address,
        se_status,
        length_at_birth_cm,
        weight_at_birth_kg,
        birth_weight_status,
        initiated_breastfeeding_date = null,
        exclusively_breastfed_6_months = null,
        intro_complementary_foods = null,
        remarks = null
    } = payload;

    const [rows] = await db.execute(
        "SELECT * FROM child_patient WHERE `date_of_registration` = ? AND `family_serial_number` = ? AND `last_name` = ?",
        [date_of_registration, family_serial_number, last_name]
    );

    if (rows.length > 0) {
        throw { status: 400, message: "Child already exists" }
    }

    const [result] = await db.execute(
        "INSERT INTO child_patient (`registered_by_user_id`, `date_of_registration`, `family_serial_number`, `first_name`, `middle_initial`, `last_name`, `sex`, `date_of_birth`, `mother_complete_name`, `contact_number`, `complete_address`, `se_status`, `length_at_birth_cm`, `weight_at_birth_kg`, `birth_weight_status`, `initiated_breastfeeding_date`, `exclusively_breastfed_6_months`, `intro_complementary_foods`, `remarks`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            registered_by_user_id,
            date_of_registration,
            family_serial_number,
            first_name,
            middle_initial,
            last_name,
            sex,
            date_of_birth,
            mother_complete_name,
            contact_number,
            complete_address,
            se_status,
            length_at_birth_cm,
            weight_at_birth_kg,
            birth_weight_status,
            initiated_breastfeeding_date,
            exclusively_breastfed_6_months,
            intro_complementary_foods,
            remarks
        ]
    );

    return {
        data: {
            child_id: result.insertId,
            registered_by_user_id,
            date_of_registration,
            family_serial_number,
            first_name,
            middle_initial,
            last_name,
            sex,
            date_of_birth,
            mother_complete_name,
            complete_address,
            se_status,
            length_at_birth_cm,
            weight_at_birth_kg,
            birth_weight_status,
            initiated_breastfeeding_date,
            exclusively_breastfed_6_months,
            intro_complementary_foods,
            remarks
        }
    };
}


export const getAllPatient = async () => {

    const [rows] = await db.execute(
        "SELECT * FROM child_patient ORDER BY date_of_registration DESC"
    );

    if (rows.length < 1) {
        throw { status: 404, message: "No patients found" }
    }

    return rows;
}

export const getPatientById = async (id) => {
    const [rows] = await db.execute(
        "SELECT * FROM child_patient WHERE child_id = ?",
        [id]
    );

    if (rows.length < 1) {
        throw { status: 404, message: "Patient not found" }
    }

    return rows[0];
}
