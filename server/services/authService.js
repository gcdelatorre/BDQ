import db from "../config/db.js";
import bcrypt from "bcryptjs";

/**
 * MERN logic to MySQL translation pattern:
 * 1. db.execute(query, [params]) -> Returns [rows, fields]
 * 2. Use [rows] to check if something exists.
 * 3. Use result.insertId to get the new ID after creation.
 */

export const getCurrentUser = async (user_id) => {
    const [users] = await db.execute(
        "SELECT * FROM user WHERE user_id = ?",
        [user_id]
    );

    if (!users[0]) {
        throw { status: 404, message: "User not found" }
    }

    return users[0];
};

export const registerUser = async (payload) => {
    const {
        first_name,
        last_name,
        middle_name = null,
        date_of_birth = null,
        contact_number = null,
        email = null,
        username,
        password,
        role = 'Nurse'
    } = payload;

    // 1. Check if user already exists
    // Pattern: SELECT * FROM table WHERE column = ?
    const [existingUsers] = await db.execute(
        "SELECT * FROM user WHERE username = ?",
        [username]
    );

    if (existingUsers.length > 0) {
        throw { status: 400, message: "User already exists" };
    }

    // 2. Hash password (Same as MERN)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create new user
    const [result] = await db.execute(
        "INSERT INTO user (first_name, last_name, middle_name, date_of_birth, contact_number, email, username, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [first_name, last_name, middle_name, date_of_birth, contact_number, email, username, hashedPassword, role]
    );

    return {
        data: {
            user_id: result.insertId,
            first_name,
            last_name,
            middle_name,
            date_of_birth,
            contact_number,
            email,
            username,
            role
        }
    };
};

export const loginUser = async (username, password) => {
    // 1. Find user
    const [users] = await db.execute(
        "SELECT * FROM user WHERE username = ?",
        [username]
    );

    const user = users[0];
    if (!user) {
        throw { status: 400, message: "Invalid credentials" };
    }

    // 2. Compare password (Same as MERN)
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw { status: 400, message: "Invalid credentials" };
    }

    return {
        data: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            role: user.role
        }
    };
};

export const getAllUser = async () => {
    const [users] = await db.execute(
        "SELECT * FROM user WHERE account_status = 'Active'"
    );

    if (users.length < 1) {
        throw { status: 400, message: "No active users found" }
    }

    return users;
};