import db from "../config/db.js";

/**
 * 1. Add a new Medicine to the catalog (The definition)
 */
export const addMedicine = async (payload) => {
    const {
        medicine_name,
        generic_name,
        medicine_category,
        unit_of_measure,
        description = null,
        reorder_level = 0,
        created_by_user_id
    } = payload;

    const [result] = await db.execute(
        "INSERT INTO medicine (medicine_name, generic_name, medicine_category, unit_of_measure, description, reorder_level, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [medicine_name, generic_name, medicine_category, unit_of_measure, description, reorder_level, created_by_user_id]
    );

    return { medicine_id: result.insertId, ...payload };
};

/**
 * 2. Add an Inventory Batch (The physical stock)
 */
export const addInventoryBatch = async (payload) => {
    const {
        medicine_id,
        batch_number,
        quantity_in_stock,
        expiration_date,
        date_received,
        supplier_name,
        storage_location = null
    } = payload;

    const [result] = await db.execute(
        "INSERT INTO inventory (medicine_id, batch_number, quantity_in_stock, expiration_date, date_received, supplier_name, storage_location) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [medicine_id, batch_number, quantity_in_stock, expiration_date, date_received, supplier_name, storage_location]
    );

    return { inventory_id: result.insertId, ...payload };
};

/**
 * 3. Get all medicines with their total stock count
 */
export const getAllMedicines = async () => {
    // This query joins medicine and inventory to show the catalog and total stock
    const [rows] = await db.execute(`
        SELECT m.*, IFNULL(SUM(i.quantity_in_stock), 0) as total_stock
        FROM medicine m
        LEFT JOIN inventory i ON m.medicine_id = i.medicine_id
        GROUP BY m.medicine_id
    `);
    return rows;
};

/**
 * 4. Get Inventory History (Batch records) for a specific medicine
 */
export const getInventoryHistory = async (medicineId) => {
    const [rows] = await db.execute(`
        SELECT * FROM inventory 
        WHERE medicine_id = ? 
        ORDER BY date_received DESC, created_at DESC
    `, [medicineId]);
    return rows;
};