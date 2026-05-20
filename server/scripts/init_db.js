import db from "../config/db.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initDB = async () => {
    try {
        console.log("🚀 Initializing Database...");

        const schemaPath = path.join(__dirname, "../../bdq_schema.sql");
        const schemaSql = fs.readFileSync(schemaPath, "utf8");

        // 2. Split SQL into individual queries
        // This regex splits by semicolon but ignores those inside quotes
        const queries = schemaSql
            .split(/;(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/)
            .map(q => q.trim())
            .filter(q => q.length > 0);

        console.log(`📝 Executing ${queries.length} schema queries...`);

        // 3. Execute each query
        for (let query of queries) {
            try {
                await db.execute(query);
            } catch (err) {
                console.error("❌ Error executing query:", query.substring(0, 50) + "...");
                console.error("Message:", err.message);
                // We continue if it's just a warning or "if not exists" check
            }
        }

        console.log("✅ Schema built successfully!");

        // 4. Seed initial data
        console.log("🌱 Seeding initial data...");

        // Clear existing data (just in case)
        await db.execute("SET FOREIGN_KEY_CHECKS = 0");
        await db.execute("TRUNCATE TABLE child_immunization_record");
        await db.execute("TRUNCATE TABLE audit_log");
        await db.execute("TRUNCATE TABLE inventory");
        await db.execute("TRUNCATE TABLE medicine");
        await db.execute("TRUNCATE TABLE child_patient");
        await db.execute("TRUNCATE TABLE user");
        await db.execute("SET FOREIGN_KEY_CHECKS = 1");

        // Create Admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);
        const [userResult] = await db.execute(
            "INSERT INTO user (first_name, last_name, role, username, password_hash, contact_number) VALUES (?, ?, ?, ?, ?, ?)",
            ["System", "Admin", "Admin", "admin123", hashedPassword, "09991234567"]
        );
        const adminId = userResult.insertId;

        // Create Mock Patients
        const today = new Date();
        const formatDate = (d) => d.toISOString().split("T")[0];

        // Newborn: 4 days old (birth vaccines overdue)
        const dobNewborn = new Date(today);
        dobNewborn.setDate(today.getDate() - 4);

        // Infant: 40 days old (6-week vaccines due in about 2 days)
        const dobOneMonth = new Date(today);
        dobOneMonth.setDate(today.getDate() - 40);

        // Infant: 81 days old (10-week vaccines overdue)
        const dobThreeMonths = new Date(today);
        dobThreeMonths.setDate(today.getDate() - 81);

        // 8 months old (9-month vaccines upcoming)
        const dobEightMonths = new Date(today);
        dobEightMonths.setDate(today.getDate() - 260);

        // 12 months old (12-month vaccine due and slightly overdue)
        const dobTwelveMonths = new Date(today);
        dobTwelveMonths.setDate(today.getDate() - 380);

        const patients = [
            // [first, last, sex, dob, mother, address, se_status, fsn, contact]
            ["Mia", "Santos", "F", formatDate(dobNewborn), "Anna Santos", "Purok 1, Brgy. Santa Cruz", "NHTS", "0501724029-00001", "09171234501"],
            ["Noah", "Reyes", "M", formatDate(dobOneMonth), "Grace Reyes", "Purok 4, Brgy. Santa Cruz", "Non-NHTS", "0501724029-00002", "09281234502"],
            ["Ella", "Cruz", "F", formatDate(dobThreeMonths), "Diana Cruz", "Purok 2, Brgy. Santa Cruz", "NHTS", "0501724029-00003", "09391234503"],
            ["Aiden", "Lopez", "M", formatDate(dobEightMonths), "Rita Lopez", "Purok 5, Brgy. Santa Cruz", "Non-NHTS", "0501724029-00004", "09401234504"],
            ["Sofia", "Dela Cruz", "F", formatDate(dobTwelveMonths), "Liza Dela Cruz", "Purok 3, Brgy. Santa Cruz", "NHTS", "0501724029-00005", "09511234505"]
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

        // Seed child immunization history for testing eligibility
        // Mia (Newborn): no vaccines yet

        // Noah (1 month): birth vaccines administered
        const noahId = patientIds[1];
        await db.execute(
            "INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'BCG', 1, ?, ?)",
            [noahId, formatDate(dobOneMonth), adminId]
        );
        await db.execute(
            "INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'HepB', 1, ?, ?)",
            [noahId, formatDate(dobOneMonth), adminId]
        );

        // Ella (3 months): birth vaccines and 6-week vaccines completed
        const ellaId = patientIds[2];
        const dobElla = dobThreeMonths;
        const ella6W = new Date(dobElla);
        ella6W.setDate(dobElla.getDate() + 42);
        const ella10W = new Date(dobElla);
        ella10W.setDate(dobElla.getDate() + 70);

        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'BCG', 1, ?, ?)", [ellaId, formatDate(dobElla), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'HepB', 1, ?, ?)", [ellaId, formatDate(dobElla), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'Pentavalent', 1, ?, ?)", [ellaId, formatDate(ella6W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'OPV', 1, ?, ?)", [ellaId, formatDate(ella6W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'PCV', 1, ?, ?)", [ellaId, formatDate(ella6W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'Pentavalent', 2, ?, ?)", [ellaId, formatDate(ella10W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'OPV', 2, ?, ?)", [ellaId, formatDate(ella10W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'PCV', 2, ?, ?)", [ellaId, formatDate(ella10W), adminId]);

        // Aiden (8 months): has birth vaccines and multiple rounds completed
        const aidenId = patientIds[3];
        const dobAiden = dobEightMonths;
        const aiden6W = new Date(dobAiden); aiden6W.setDate(dobAiden.getDate() + 42);
        const aiden10W = new Date(dobAiden); aiden10W.setDate(dobAiden.getDate() + 70);
        const aiden14W = new Date(dobAiden); aiden14W.setDate(dobAiden.getDate() + 98);

        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'BCG', 1, ?, ?)", [aidenId, formatDate(dobAiden), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'HepB', 1, ?, ?)", [aidenId, formatDate(dobAiden), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'Pentavalent', 1, ?, ?)", [aidenId, formatDate(aiden6W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'OPV', 1, ?, ?)", [aidenId, formatDate(aiden6W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'PCV', 1, ?, ?)", [aidenId, formatDate(aiden6W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'Pentavalent', 2, ?, ?)", [aidenId, formatDate(aiden10W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'OPV', 2, ?, ?)", [aidenId, formatDate(aiden10W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'PCV', 2, ?, ?)", [aidenId, formatDate(aiden10W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'Pentavalent', 3, ?, ?)", [aidenId, formatDate(aiden14W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'OPV', 3, ?, ?)", [aidenId, formatDate(aiden14W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'PCV', 3, ?, ?)", [aidenId, formatDate(aiden14W), adminId]);

        // Sofia (12 months): completed birth and primary schedules, due MMR 1 and IPV 2
        const sofiaId = patientIds[4];
        const dobSofia = dobTwelveMonths;
        const sofia6W = new Date(dobSofia); sofia6W.setDate(dobSofia.getDate() + 42);
        const sofia10W = new Date(dobSofia); sofia10W.setDate(dobSofia.getDate() + 70);
        const sofia14W = new Date(dobSofia); sofia14W.setDate(dobSofia.getDate() + 98);
        const sofia9M = new Date(dobSofia); sofia9M.setDate(dobSofia.getDate() + 274);

        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'BCG', 1, ?, ?)", [sofiaId, formatDate(dobSofia), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'HepB', 1, ?, ?)", [sofiaId, formatDate(dobSofia), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'Pentavalent', 1, ?, ?)", [sofiaId, formatDate(sofia6W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'Pentavalent', 2, ?, ?)", [sofiaId, formatDate(sofia10W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'Pentavalent', 3, ?, ?)", [sofiaId, formatDate(sofia14W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'OPV', 1, ?, ?)", [sofiaId, formatDate(sofia6W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'OPV', 2, ?, ?)", [sofiaId, formatDate(sofia10W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'OPV', 3, ?, ?)", [sofiaId, formatDate(sofia14W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'IPV', 1, ?, ?)", [sofiaId, formatDate(sofia14W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'IPV', 2, ?, ?)", [sofiaId, formatDate(sofia9M), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'PCV', 1, ?, ?)", [sofiaId, formatDate(sofia6W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'PCV', 2, ?, ?)", [sofiaId, formatDate(sofia10W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'PCV', 3, ?, ?)", [sofiaId, formatDate(sofia14W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'MMR', 1, ?, ?)", [sofiaId, formatDate(sofia9M), adminId]);

        // Create Medicine Catalog & Inventory
        const meds = [
            ["Paracetamol 500mg", "Paracetamol", "Tablet", "pcs", 500],
            ["Paracetamol 125mg/5ml", "Paracetamol", "Syrup", "bottle", 50],
            ["Mefenamic Acid 500mg", "Mefenamic Acid", "Capsule", "pcs", 200],
            ["Ibuprofen 200mg", "Ibuprofen", "Tablet", "pcs", 200],
            ["Lagundi 300mg/5ml", "Lagundi", "Syrup", "bottle", 50],
            ["Cetirizine 10mg", "Cetirizine", "Tablet", "pcs", 300],
            ["Salbutamol 2.5mg", "Salbutamol", "Nebule", "pcs", 100],
            ["Amlodipine 5mg", "Amlodipine", "Tablet", "pcs", 500],
            ["Losartan 50mg", "Losartan", "Tablet", "pcs", 500],
            ["Metoprolol 50mg", "Metoprolol", "Tablet", "pcs", 300],
            ["Metformin 500mg", "Metformin", "Tablet", "pcs", 500],
            ["Oral Rehydration Salts (ORS)", "ORS", "Sachet", "pcs", 200],
            ["Omeprazole 20mg", "Omeprazole", "Capsule", "pcs", 150],
            ["Multivitamins", "Multivitamins", "Capsule", "pcs", 1000],
            ["Ascorbic Acid (Vitamin C) 500mg", "Ascorbic Acid", "Tablet", "pcs", 1000],
            ["Iron + Folic Acid", "Iron/Folic Acid", "Tablet", "pcs", 500]
        ];

        for (const m of meds) {
            const [res] = await db.execute(
                "INSERT INTO medicine (medicine_name, generic_name, medicine_category, unit_of_measure, reorder_level, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?)",
                [m[0], m[1], m[2], m[3], m[4], adminId]
            );
            
            const medId = res.insertId;
            // Seed a healthy amount of stock (3x the reorder level) so it doesn't immediately show up as Low Stock, 
            // except for Paracetamol Syrup which we'll force to be low stock for UI demonstration.
            const initialStock = m[1] === "Paracetamol" && m[2] === "Syrup" ? m[4] - 10 : m[4] * 3;

            await db.execute(
                "INSERT INTO inventory (medicine_id, batch_number, quantity_in_stock, expiration_date, date_received, supplier_name) VALUES (?, ?, ?, ?, CURDATE(), ?)",
                [medId, `BN-${Math.floor(Math.random() * 9000) + 1000}`, initialStock, "2027-12-31", "Department of Health"]
            );
        }

        console.log("🚀 Database fully initialized and seeded!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Initialization failed:", error);
        process.exit(1);
    }
};

initDB();
