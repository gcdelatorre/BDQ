import db from "../config/db.js";

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateData = () => {
    const firstNames = ["Juan", "Maria", "Jose", "Ana", "Pedro", "Elena", "Luis", "Sofia", "Carlos", "Isabel"];
    const lastNames = ["Dela Cruz", "Santos", "Reyes", "Garcia", "Gonzales", "Bautista", "Villanueva", "Fernandez", "Cruz", "Torres"];
    const barangays = ["Santa Cruz", "San Roque", "Poblacion", "Villa Paz", "San Isidro"];
    
    return {
        registered_by_user_id: 1, // Assumes Admin user exists
        date_of_registration: new Date().toISOString().split('T')[0],
        family_serial_number: `0501724029-${Math.floor(10000 + Math.random() * 90000)}`,
        first_name: getRandom(firstNames),
        middle_initial: "A",
        last_name: getRandom(lastNames),
        sex: Math.random() > 0.5 ? "M" : "F",
        date_of_birth: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString().split('T')[0],
        mother_complete_name: "Mother " + getRandom(lastNames),
        contact_number: "0917" + Math.floor(1000000 + Math.random() * 9000000),
        complete_address: `Purok ${Math.floor(Math.random() * 5) + 1}, ${getRandom(barangays)}`,
        se_status: "4Ps",
        length_at_birth_cm: (45 + Math.random() * 10).toFixed(1),
        weight_at_birth_kg: (2.5 + Math.random() * 2).toFixed(2),
        birth_weight_status: "Normal",
        remarks: "Test data"
    };
};

const seed500 = async () => {
    try {
        console.log("⏳ Starting to insert 500 patient records...");
        
        for (let i = 0; i < 500; i++) {
            const data = generateData();
            await db.execute(
                "INSERT INTO child_patient (`registered_by_user_id`, `date_of_registration`, `family_serial_number`, `first_name`, `middle_initial`, `last_name`, `sex`, `date_of_birth`, `mother_complete_name`, `contact_number`, `complete_address`, `se_status`, `length_at_birth_cm`, `weight_at_birth_kg`, `birth_weight_status`, `remarks`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    data.registered_by_user_id, data.date_of_registration, data.family_serial_number,
                    data.first_name, data.middle_initial, data.last_name, data.sex,
                    data.date_of_birth, data.mother_complete_name, data.contact_number,
                    data.complete_address, data.se_status, data.length_at_birth_cm,
                    data.weight_at_birth_kg, data.birth_weight_status, data.remarks
                ]
            );
        }

        console.log("✅ 500 patient records inserted successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seed500();
