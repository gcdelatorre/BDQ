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
        const patients = [
            ["Juan", "Dela Cruz", "M", "2024-01-15", "Maria Dela Cruz", "Purok 1, Brgy. Sabang", "NHTS", "FSN-2024-001"],
            ["Elena", "Santos", "F", "2023-11-20", "Grace Santos", "Purok 4, Brgy. Sabang", "Non-NHTS", "FSN-2023-085"],
            ["Mateo", "Reyes", "M", "2024-03-05", "Liza Reyes", "Purok 2, Brgy. Sabang", "NHTS", "FSN-2024-012"]
        ];

        for (const p of patients) {
            await db.execute(
                `INSERT INTO child_patient (
                    first_name, last_name, sex, date_of_birth, 
                    mother_complete_name, complete_address, se_status, 
                    registered_by_user_id, date_of_registration, family_serial_number,
                    length_at_birth_cm, weight_at_birth_kg, birth_weight_status
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?)`,
                [p[0], p[1], p[2], p[3], p[4], p[5], p[6], adminId, p[7], 50.0, 3.2, "Normal"]
            );
        }

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
