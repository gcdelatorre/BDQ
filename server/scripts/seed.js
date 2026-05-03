import db from "./db.js";
import bcrypt from "bcryptjs";

const seed = async () => {
    try {
        console.log("🌱 Seeding database...");

        // 1. Clear existing data (in correct order due to FK)
        await db.execute("SET FOREIGN_KEY_CHECKS = 0");
        await db.execute("TRUNCATE TABLE inventory");
        await db.execute("TRUNCATE TABLE medicine");
        await db.execute("TRUNCATE TABLE child_patient");
        await db.execute("TRUNCATE TABLE user");
        await db.execute("SET FOREIGN_KEY_CHECKS = 1");

        // 2. Create an Admin User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);
        const [userResult] = await db.execute(
            "INSERT INTO user (first_name, last_name, role, username, password_hash) VALUES (?, ?, ?, ?, ?)",
            ["System", "Admin", "Admin", "admin123", hashedPassword]
        );
        const adminId = userResult.insertId;

        // 3. Create Child Patients
        const patients = [
            ["Juan", "Dela Cruz", "M", "2024-01-15", "Maria Dela Cruz", "Purok 1, Brgy. Sabang", "NHTS"],
            ["Elena", "Santos", "F", "2023-11-20", "Grace Santos", "Purok 4, Brgy. Sabang", "Non-NHTS"],
            ["Mateo", "Reyes", "M", "2024-03-05", "Liza Reyes", "Purok 2, Brgy. Sabang", "NHTS"]
        ];

        for (const p of patients) {
            await db.execute(
                `INSERT INTO child_patient (first_name, last_name, sex, date_of_birth, mother_complete_name, complete_address, se_status, registered_by_user_id, date_of_registration, family_serial_number) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
                [p[0], p[1], p[2], p[3], p[4], p[5], p[6], adminId, `FSN-${Math.floor(Math.random() * 1000)}`]
            );
        }

        // 4. Create Medicine Catalog
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
            
            // Add initial stock for each medicine
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
