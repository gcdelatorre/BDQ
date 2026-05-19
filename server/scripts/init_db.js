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
            "INSERT INTO user (first_name, last_name, role, username, password_hash) VALUES (?, ?, ?, ?, ?)",
            ["System", "Admin", "Admin", "admin123", hashedPassword]
        );
        const adminId = userResult.insertId;

        // Create Mock Patients
        const today = new Date();
        const formatDate = (d) => d.toISOString().split("T")[0];

        // Newborn: 3 days old (At Birth vaccines were 3 days ago -> Overdue)
        const dobNewborn = new Date(today);
        dobNewborn.setDate(today.getDate() - 3);

        // Infant: 39 days old (Penta 1, OPV 1, PCV 1 due at 42 days -> Upcoming in 3 days)
        const dobInfant1 = new Date(today);
        dobInfant1.setDate(today.getDate() - 39);

        // Infant: 270 days old (MMR 1, IPV 2 due at 274 days -> Upcoming in 4 days)
        const dobInfant9 = new Date(today);
        dobInfant9.setDate(today.getDate() - 270);

        // Toddler: 360 days old (MMR 2 due at 365 days -> Upcoming in 5 days)
        const dobToddler = new Date(today);
        dobToddler.setDate(today.getDate() - 360);

        const patients = [
            ["Juan", "Newborn", "M", formatDate(dobNewborn), "Maria Newborn", "Purok 1, Brgy. Sabang", "NHTS", "FSN-2026-001"],
            ["Elena", "Infant", "F", formatDate(dobInfant1), "Grace Infant", "Purok 4, Brgy. Sabang", "Non-NHTS", "FSN-2026-002"],
            ["Mateo", "Toddler", "M", formatDate(dobInfant9), "Liza Toddler", "Purok 2, Brgy. Sabang", "NHTS", "FSN-2025-012"],
            ["Baby", "OneYear", "F", formatDate(dobToddler), "Sarah OneYear", "Purok 3, Brgy. Sabang", "NHTS", "FSN-2025-099"]
        ];

        const patientIds = [];
        for (const p of patients) {
            const [res] = await db.execute(
                `INSERT INTO child_patient (
                    first_name, last_name, sex, date_of_birth, 
                    mother_complete_name, complete_address, se_status, 
                    registered_by_user_id, date_of_registration, family_serial_number,
                    length_at_birth_cm, weight_at_birth_kg, birth_weight_status
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, 50.0, 3.2, 'Normal')`,
                [p[0], p[1], p[2], p[3], p[4], p[5], p[6], adminId, p[7]]
            );
            patientIds.push(res.insertId);
        }

        // Seed child immunization history for testing eligibility
        // Juan (Newborn): Has no vaccines yet (due for BCG 1, HepB 1)
        
        // Elena (Infant 1.5m): Already got birth vaccines
        const elenaId = patientIds[1];
        await db.execute(
            "INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'BCG', 1, ?, ?)",
            [elenaId, formatDate(dobInfant1), adminId]
        );
        await db.execute(
            "INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'HepB', 1, ?, ?)",
            [elenaId, formatDate(dobInfant1), adminId]
        );

        // Mateo (Infant 9m): Already got BCG, HepB, Penta 1/2/3, OPV 1/2/3, IPV 1, PCV 1/2/3
        const mateoId = patientIds[2];
        const dobMateo = dobInfant9;
        
        const dateAtBirth = new Date(dobMateo);
        const dateAt6Weeks = new Date(dobMateo); dateAt6Weeks.setDate(dobMateo.getDate() + 42);
        const dateAt10Weeks = new Date(dobMateo); dateAt10Weeks.setDate(dobMateo.getDate() + 70);
        const dateAt14Weeks = new Date(dobMateo); dateAt14Weeks.setDate(dobMateo.getDate() + 98);

        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'BCG', 1, ?, ?)", [mateoId, formatDate(dateAtBirth), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'HepB', 1, ?, ?)", [mateoId, formatDate(dateAtBirth), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'Pentavalent', 1, ?, ?)", [mateoId, formatDate(dateAt6Weeks), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'OPV', 1, ?, ?)", [mateoId, formatDate(dateAt6Weeks), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'PCV', 1, ?, ?)", [mateoId, formatDate(dateAt6Weeks), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'Pentavalent', 2, ?, ?)", [mateoId, formatDate(dateAt10Weeks), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'OPV', 2, ?, ?)", [mateoId, formatDate(dateAt10Weeks), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'PCV', 2, ?, ?)", [mateoId, formatDate(dateAt10Weeks), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'Pentavalent', 3, ?, ?)", [mateoId, formatDate(dateAt14Weeks), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'OPV', 3, ?, ?)", [mateoId, formatDate(dateAt14Weeks), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'IPV', 1, ?, ?)", [mateoId, formatDate(dateAt14Weeks), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'PCV', 3, ?, ?)", [mateoId, formatDate(dateAt14Weeks), adminId]);

        // Baby (Toddler 12m): Got all up to 9m including MMR 1 and IPV 2
        const babyId = patientIds[3];
        const dobBaby = dobToddler;
        const dateBabyBirth = new Date(dobBaby);
        const dateBaby6W = new Date(dobBaby); dateBaby6W.setDate(dobBaby.getDate() + 42);
        const dateBaby10W = new Date(dobBaby); dateBaby10W.setDate(dobBaby.getDate() + 70);
        const dateBaby14W = new Date(dobBaby); dateBaby14W.setDate(dobBaby.getDate() + 98);
        const dateBaby9M = new Date(dobBaby); dateBaby9M.setDate(dobBaby.getDate() + 274);

        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'BCG', 1, ?, ?)", [babyId, formatDate(dateBabyBirth), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'HepB', 1, ?, ?)", [babyId, formatDate(dateBabyBirth), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'Pentavalent', 1, ?, ?)", [babyId, formatDate(dateBaby6W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'Pentavalent', 2, ?, ?)", [babyId, formatDate(dateBaby10W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'Pentavalent', 3, ?, ?)", [babyId, formatDate(dateBaby14W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'OPV', 1, ?, ?)", [babyId, formatDate(dateBaby6W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'OPV', 2, ?, ?)", [babyId, formatDate(dateBaby10W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'OPV', 3, ?, ?)", [babyId, formatDate(dateBaby14W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'IPV', 1, ?, ?)", [babyId, formatDate(dateBaby14W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'IPV', 2, ?, ?)", [babyId, formatDate(dateBaby9M), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'PCV', 1, ?, ?)", [babyId, formatDate(dateBaby6W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'PCV', 2, ?, ?)", [babyId, formatDate(dateBaby10W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'PCV', 3, ?, ?)", [babyId, formatDate(dateBaby14W), adminId]);
        await db.execute("INSERT INTO child_immunization_record (child_id, vaccine_type, dose_number, date_administered, administered_by_user_id) VALUES (?, 'MMR', 1, ?, ?)", [babyId, formatDate(dateBaby9M), adminId]);

        // Create Medicine Catalog & Inventory
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

        console.log("🚀 Database fully initialized and seeded!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Initialization failed:", error);
        process.exit(1);
    }
};

initDB();
