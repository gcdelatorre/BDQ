import db from "../config/db.js";

/**
 * Dispense medicines to a child patient.
 * This is a complex transaction that updates 3 tables.
 */
export const dispenseMedicine = async (payload) => {
    const { user_id, child_id, notes = null, medicines } = payload;
    // medicines should be an array: [{ medicine_id, quantity_dispensed, dosage_instruction, duration_days, remarks }]

    // We MUST get a single connection from the pool to perform a Transaction
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
        for (const item of medicines) {
            const { medicine_id, quantity_dispensed, dosage_instruction, duration_days, remarks = null } = item;

            // 3. Subtract stock from Inventory (FEFO logic - First Expired First Out)
            const [batches] = await connection.execute(
                "SELECT * FROM inventory WHERE medicine_id = ? AND quantity_in_stock > 0 ORDER BY expiration_date ASC",
                [medicine_id]
            );

            let remainingToDispense = quantity_dispensed;

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
                [transactionId, medicine_id, quantity_dispensed, dosage_instruction, duration_days, remarks]
            );
        }

        // If everything is successful, we commit all changes at once
        await connection.commit();
        return { transaction_id: transactionId, ...payload };

    } catch (error) {
        // If ANY step fails, we undo everything
        await connection.rollback();
        throw error;
    } finally {
        // Always release the connection back to the pool
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

/**
 * Get dispensing history for a specific child
 */
export const getHistoryByChild = async (childId) => {
    const [rows] = await db.execute(`
        SELECT 
            dt.transaction_id,
            dt.transaction_date,
            dt.notes,
            dm.quantity_dispensed,
            dm.dosage_instruction,
            dm.duration_days,
            dm.remarks,
            m.medicine_name,
            m.generic_name,
            u.first_name as nurse_first,
            u.last_name as nurse_last
        FROM dispensing_transaction dt
        JOIN dispensed_medicine dm ON dt.transaction_id = dm.transaction_id
        JOIN medicine m ON dm.medicine_id = m.medicine_id
        JOIN user u ON dt.user_id = u.user_id
        WHERE dt.child_id = ?
        ORDER BY dt.transaction_date DESC
    `, [childId]);
    return rows;
};
