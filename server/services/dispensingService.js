import db from "../config/db.js";

/**
 * Dispense medicines to a child patient.
 * This is a complex transaction that updates 3 tables.
 */
export const dispenseMedicine = async (payload) => {
    const { user_id, child_id, notes = null, items } = payload;
    // items should be an array: [{ medicine_id, quantity, dosage, duration, remarks }]

    // We start a transaction so if one step fails, the database reverts everything
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Create the Transaction Header
        const [txResult] = await connection.execute(
            "INSERT INTO dispensing_transaction (user_id, child_id, notes) VALUES (?, ?, ?)",
            [user_id, child_id, notes]
        );
        const transactionId = txResult.insertId;

        // 2. Process each medicine item
        for (const item of items) {
            const { medicine_id, quantity, dosage, duration, remarks = null } = item;

            // 3. Subtract stock from Inventory (FEFO logic - First Expired First Out)
            // We get batches for this medicine, ordered by expiration date
            const [batches] = await connection.execute(
                "SELECT * FROM inventory WHERE medicine_id = ? AND quantity_in_stock > 0 ORDER BY expiration_date ASC",
                [medicine_id]
            );

            let remainingToDispense = quantity;

            for (const batch of batches) {
                if (remainingToDispense <= 0) break;

                const takeFromThisBatch = Math.min(batch.quantity_in_stock, remainingToDispense);
                
                await connection.execute(
                    "UPDATE inventory SET quantity_in_stock = quantity_in_stock - ? WHERE inventory_id = ?",
                    [takeFromThisBatch, batch.inventory_id]
                );

                remainingToDispense -= takeFromThisBatch;
            }

            // Check if we actually had enough stock
            if (remainingToDispense > 0) {
                throw { status: 400, message: `Insufficient stock for medicine ID ${medicine_id}` };
            }

            // 4. Create the Dispensed Medicine line item
            await connection.execute(
                "INSERT INTO dispensed_medicine (transaction_id, medicine_id, quantity_dispensed, dosage_instruction, duration_days, remarks) VALUES (?, ?, ?, ?, ?, ?)",
                [transactionId, medicine_id, quantity, dosage, duration, remarks]
            );
        }

        await connection.commit();
        return { transaction_id: transactionId, ...payload };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Get the history of all dispensing transactions
 */
export const getDispensingHistory = async () => {
    const [rows] = await db.execute(`
        SELECT 
            dt.*, 
            cp.first_name as patient_first, cp.last_name as patient_last,
            u.first_name as nurse_first, u.last_name as nurse_last
        FROM dispensing_transaction dt
        JOIN child_patient cp ON dt.child_id = cp.child_id
        JOIN user u ON dt.user_id = u.user_id
        ORDER BY dt.transaction_date DESC
    `);
    return rows;
};
