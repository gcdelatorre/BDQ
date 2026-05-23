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
        await db.execute("TRUNCATE TABLE child_immunization_record");
        await db.execute("TRUNCATE TABLE child_patient");
        await db.execute("TRUNCATE TABLE user");
        await db.execute("SET FOREIGN_KEY_CHECKS = 1");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);
        
        // Admin
        const [userResult] = await db.execute(
            "INSERT INTO user (first_name, last_name, role, username, password_hash, contact_number) VALUES (?, ?, ?, ?, ?, ?)",
            ["System", "Admin", "Admin", "admin", hashedPassword, "09991234567"]
        );
        const adminId = userResult.insertId;

        // Midwife
        await db.execute(
            "INSERT INTO user (first_name, last_name, role, username, password_hash, contact_number) VALUES (?, ?, ?, ?, ?, ?)",
            ["Barangay", "Midwife", "Nurse", "midwife", hashedPassword, "09991234568"]
        );

        // Nurse
        await db.execute(
            "INSERT INTO user (first_name, last_name, role, username, password_hash, contact_number) VALUES (?, ?, ?, ?, ?, ?)",
            ["Barangay", "Nurse", "Nurse", "nurse", hashedPassword, "09991234569"]
        );

        const today = new Date();
        const formatDate = (date) => date.toISOString().split("T")[0];

        const dobNewborn = new Date(today);
        dobNewborn.setDate(today.getDate() - 4);

        const dobOneMonth = new Date(today);
        dobOneMonth.setDate(today.getDate() - 41);

        const dobThreeMonths = new Date(today);
        dobThreeMonths.setDate(today.getDate() - 97);

        const dobEightMonths = new Date(today);
        dobEightMonths.setDate(today.getDate() - 267);

        const dobTwelveMonths = new Date(today);
        dobTwelveMonths.setDate(today.getDate() - 370);

        const patients = [
            ["Nathaniel", "Buag", "M", formatDate(dobNewborn), "Anna Santos", "Purok 1, Brgy. Santa Cruz", "NHTS", "0501724029-00001", "09171234501"],
            ["Amouia Jane", "Casilac", "F", formatDate(dobOneMonth), "Grace Reyes", "Purok 4, Brgy. Santa Cruz", "Non-NHTS", "0501724029-00002", "09281234502"],
            ["Kenjie Apol", "Baclagan", "M", formatDate(dobThreeMonths), "Diana Cruz", "Purok 2, Brgy. Santa Cruz", "NHTS", "0501724029-00003", "09391234503"],
            ["Athalia", "Del Socorro", "F", formatDate(dobEightMonths), "Rita Lopez", "Purok 5, Brgy. Santa Cruz", "Non-NHTS", "0501724029-00004", "09401234504"],
            ["Zynna Eloix", "Yadao", "F", formatDate(dobTwelveMonths), "Liza Dela Cruz", "Purok 3, Brgy. Santa Cruz", "NHTS", "0501724029-00005", "09511234505"]
        ];

        const patientIds = [];
        for (const p of patients) {
            const [res] = await db.execute(
                `INSERT INTO child_patient (
                    first_name, last_name, sex, date_of_birth,
                    mother_complete_name, complete_address, contact_number, se_status,
                    registered_by_user_id, date_of_registration, family_serial_number,
                    length_at_birth_cm, weight_at_birth_kg, birth_weight_status
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, 50.0, 3.2, 'Normal')`,
                [p[0], p[1], p[2], p[3], p[4], p[5], p[8], p[6], adminId, p[7]]
            );
            patientIds.push(res.insertId);
        }

        const recordVaccine = async (childId, vaccineType, doseNumber, dateAdministered) => {
            await db.execute(
                "INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, ?, ?, ?, ?)",
                [childId, vaccineType, doseNumber, formatDate(dateAdministered), adminId]
            );
        };

        const noahId = patientIds[1];
        await recordVaccine(noahId, "BCG", 1, dobOneMonth);
        await recordVaccine(noahId, "HepB", 1, dobOneMonth);

        const ellaId = patientIds[2];
        const ella6W = new Date(dobThreeMonths);
        ella6W.setDate(ella6W.getDate() + 42);
        const ella10W = new Date(dobThreeMonths);
        ella10W.setDate(ella10W.getDate() + 70);

        await recordVaccine(ellaId, "BCG", 1, dobThreeMonths);
        await recordVaccine(ellaId, "HepB", 1, dobThreeMonths);
        await recordVaccine(ellaId, "Pentavalent", 1, ella6W);
        await recordVaccine(ellaId, "OPV", 1, ella6W);
        await recordVaccine(ellaId, "PCV", 1, ella6W);
        await recordVaccine(ellaId, "Pentavalent", 2, ella10W);
        await recordVaccine(ellaId, "OPV", 2, ella10W);
        await recordVaccine(ellaId, "PCV", 2, ella10W);

        const aidenId = patientIds[3];
        const aiden6W = new Date(dobEightMonths);
        aiden6W.setDate(aiden6W.getDate() + 42);
        const aiden10W = new Date(dobEightMonths);
        aiden10W.setDate(aiden10W.getDate() + 70);
        const aiden14W = new Date(dobEightMonths);
        aiden14W.setDate(aiden14W.getDate() + 98);

        await recordVaccine(aidenId, "BCG", 1, dobEightMonths);
        await recordVaccine(aidenId, "HepB", 1, dobEightMonths);
        await recordVaccine(aidenId, "Pentavalent", 1, aiden6W);
        await recordVaccine(aidenId, "OPV", 1, aiden6W);
        await recordVaccine(aidenId, "PCV", 1, aiden6W);
        await recordVaccine(aidenId, "Pentavalent", 2, aiden10W);
        await recordVaccine(aidenId, "OPV", 2, aiden10W);
        await recordVaccine(aidenId, "PCV", 2, aiden10W);
        await recordVaccine(aidenId, "Pentavalent", 3, aiden14W);
        await recordVaccine(aidenId, "OPV", 3, aiden14W);
        await recordVaccine(aidenId, "PCV", 3, aiden14W);

        const sofiaId = patientIds[4];
        const sofia6W = new Date(dobTwelveMonths);
        sofia6W.setDate(sofia6W.getDate() + 42);
        const sofia10W = new Date(dobTwelveMonths);
        sofia10W.setDate(sofia10W.getDate() + 70);
        const sofia14W = new Date(dobTwelveMonths);
        sofia14W.setDate(sofia14W.getDate() + 98);
        const sofia9M = new Date(dobTwelveMonths);
        sofia9M.setDate(sofia9M.getDate() + 274);

        await recordVaccine(sofiaId, "BCG", 1, dobTwelveMonths);
        await recordVaccine(sofiaId, "HepB", 1, dobTwelveMonths);
        await recordVaccine(sofiaId, "Pentavalent", 1, sofia6W);
        await recordVaccine(sofiaId, "Pentavalent", 2, sofia10W);
        await recordVaccine(sofiaId, "Pentavalent", 3, sofia14W);
        await recordVaccine(sofiaId, "OPV", 1, sofia6W);
        await recordVaccine(sofiaId, "OPV", 2, sofia10W);
        await recordVaccine(sofiaId, "OPV", 3, sofia14W);
        await recordVaccine(sofiaId, "PCV", 1, sofia6W);
        await recordVaccine(sofiaId, "PCV", 2, sofia10W);
        await recordVaccine(sofiaId, "PCV", 3, sofia14W);
        await recordVaccine(sofiaId, "IPV", 1, sofia14W);
        await recordVaccine(sofiaId, "IPV", 2, sofia9M);
        await recordVaccine(sofiaId, "MMR", 1, sofia9M);

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
