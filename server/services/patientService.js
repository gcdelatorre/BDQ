import db from "../config/db.js";

const FSN_PREFIX = process.env.FSN_PSGC_PREFIX || "0501724029";
const FSN_PATTERN = new RegExp(`^${FSN_PREFIX}-\\d{5}$`);

const padFamilySequence = (sequence) => String(sequence).padStart(5, "0");

const generateFamilySerialNumber = async () => {
    const [rows] = await db.execute(
        "SELECT family_serial_number FROM child_patient WHERE family_serial_number LIKE ? ORDER BY family_serial_number DESC LIMIT 1",
        [`${FSN_PREFIX}-%`]
    );

    if (rows.length === 0) {
        return `${FSN_PREFIX}-${padFamilySequence(1)}`;
    }

    const latest = rows[0].family_serial_number;
    const [, latestSeq] = latest.split("-");
    const nextSeq = Number(latestSeq) + 1;
    return `${FSN_PREFIX}-${padFamilySequence(nextSeq)}`;
};

const normalizeFamilySerialNumber = async (family_serial_number) => {
    if (!family_serial_number) {
        return await generateFamilySerialNumber();
    }

    if (!FSN_PATTERN.test(family_serial_number)) {
        throw { status: 400, message: `Invalid FSN format. Expected ${FSN_PREFIX}-00001.` };
    }

    return family_serial_number;
};

export const registerChild = async (payload) => {
    const {
        registered_by_user_id,
        date_of_registration,
        family_serial_number: rawFamilySerialNumber,
        first_name,
        middle_initial = null,
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
        initiated_breastfeeding_date = null,
        exclusively_breastfed_6_months = null,
        intro_complementary_foods = null,
        remarks = null
    } = payload;

    const family_serial_number = await normalizeFamilySerialNumber(rawFamilySerialNumber);

    const [rows] = await db.execute(
        "SELECT * FROM child_patient WHERE family_serial_number = ? AND first_name = ? AND last_name = ? AND date_of_birth = ?",
        [family_serial_number, first_name, last_name, date_of_birth]
    );

    if (rows.length > 0) {
        throw { status: 400, message: "Child already exists in this family." };
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


export const getAllPatient = async ({ search = "", page = 1, limit = 20 } = {}) => {
    const filters = [];
    const values = [];

    const parsedPage = Number(page) || 1;
    const parsedLimit = Number(limit) > 0 ? Number(limit) : 20;
    const offset = (parsedPage - 1) * parsedLimit;

    if (search && search.trim().length > 0) {
        const query = `%${search.trim()}%`;
        filters.push("(CONCAT(first_name, ' ', last_name) LIKE ? OR family_serial_number LIKE ? OR contact_number LIKE ?)");
        values.push(query, query, query);
    }

    let sql = "SELECT * FROM child_patient";
    if (filters.length) {
        sql += ` WHERE ${filters.join(" AND ")}`;
    }
    sql += " ORDER BY date_of_registration DESC LIMIT ? OFFSET ?";
    values.push(parsedLimit, offset);

    const [rows] = await db.execute(sql, values);
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
