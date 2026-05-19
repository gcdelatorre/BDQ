import "dotenv/config";
import mysql from "mysql2/promise";

// Using a Pool instead of a single connection is best practice.
// It allows multiple simultaneous users and handles reconnections automatically.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    supportBigNumbers: true,   // Return BIGINT columns as JS number/string
    bigNumberStrings: true     // Return BIGINT as string (safe for IDs > 2^53)
});

// Check if the pool can connect
pool.getConnection()
    .then(conn => {
        console.log("✅ MySQL Database Connected Successfully");
        conn.release();
    })
    .catch(err => {
        console.error("❌ Database Connection Failed:", err.message);
        process.exit(1);
    });

export default pool;