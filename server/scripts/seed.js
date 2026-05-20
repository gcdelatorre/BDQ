import db from "../config/db.js";
import bcrypt from "bcryptjs";

/**
 * Lightweight re-seed (schema must already exist).
 * For full demo data with immunization scenarios, use: npm run init-db
 */
const seed = async () => {
    try {
        console.log("🌱 Seeding database...");

        await db.execute("SET FOREIGN_KEY_CHECKS = 0");
        await db.execute("TRUNCATE TABLE inventory");
        await db.execute("TRUNCATE TABLE medicine");
        await db.execute("TRUNCATE TABLE child_patient");
        await db.execute("TRUNCATE TABLE user");
        await db.execute("SET FOREIGN_KEY_CHECKS = 1");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);
        const [userResult] = await db.execute(
            "INSERT INTO user (first_name, last_name, role, username, password_hash, contact_number) VALUES (?, ?, ?, ?, ?, ?)",
            ["System", "Admin", "Admin", "admin123", hashedPassword, "09991234567"]
        );
        const adminId = userResult.insertId;

        // [first, last, sex, dob, mother, address, se_status, fsn, contact]
        const patients = [
            ["Juan", "Dela Cruz", "M", "2024-01-15", "Maria Dela Cruz", "Purok 1, Brgy. Sabang", "NHTS", "FSN-2026-101", "09171234501"],
            ["Elena", "Santos", "F", "2023-11-20", "Grace Santos", "Purok 4, Brgy. Sabang", "Non-NHTS", "FSN-2026-102", "09281234502"],
            ["Mateo", "Reyes", "M", "2024-03-05", "Liza Reyes", "Purok 2, Brgy. Sabang", "NHTS", "FSN-2026-103", "09391234503"]
        ];

        for (const p of patients) {
            await db.execute(
                `INSERT INTO child_patient (
                    first_name, last_name, sex, date_of_birth,
                    mother_complete_name, complete_address, contact_number, se_status,
                    registered_by_user_id, date_of_registration, family_serial_number,
                    length_at_birth_cm, weight_at_birth_kg, birth_weight_status
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, 50.0, 3.2, 'Normal')`,
                [p[0], p[1], p[2], p[3], p[4], p[5], p[8], p[6], adminId, p[7]]
            );
        }

        const meds = [
            ["Paracetamol 500mg", "Paracetamol", "Tablet", "pcs", 50],
            ["Amoxicillin 250mg/5ml", "Amoxicillin", "Syrup", "bottle", 10],
            ["Vitamin A 100,000 IU", "Retinol", "Capsule", "pcs", 100]
        ];

        for (const m of meds) {
            const [res] = await db.execute(
                "INSERT INTO medicine (medicine_name, generic_name, medicine_category, unit_of_measure, reorder_level, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?)",
                [m[0], m[1], m[2], m[3], m[4], adminId]
            );

            const medId = res.insertId;
            await db.execute(
                "INSERT INTO inventory (medicine_id, batch_number, quantity_in_stock, expiration_date, date_received, supplier_name) VALUES (?, ?, ?, ?, CURDATE(), ?)",
                [medId, `BN-${Math.floor(Math.random() * 9000) + 1000}`, 100, "2027-12-31", "Department of Health"]
            );
        }

        console.log("✅ Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seed();
