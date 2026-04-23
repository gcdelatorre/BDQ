import * as authService from "../services/authService.js";

/**
 * BEST PRACTICE: Controllers handle HTTP concerns (status codes, req, res)
 * Services handle Business Logic & Database queries.
 */

export const register = async (req, res) => {
    try {
        const result = await authService.registerUser(req.body);
        res.status(201).json({
            message: "User created successfully",
            data: result
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(error.status || 500).json({
            message: error.message || "Internal Server Error"
        });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const result = await authService.loginUser(username, password);

        // Save user info to session that will be use for protected routes or for the middlewares
        req.session.user = {
            user_id: result.data.user_id,
            username: result.data.username,
            role: result.data.role // used for restricTo mmiddleware so only admin can perform this route
        };

        res.status(200).json({
            message: "Login successful",
            data: result.data
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(error.status || 500).json({
            message: error.message || "Internal Server Error"
        });
    }
};

// for displaying list of users in the management page
export const getAllUser = async (req, res) => {
    try {
        const users = await authService.getAllUser();
        res.status(200).json({
            message: "All users fetched successfully",
            data: users
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(error.status || 500).json({
            message: error.message || "Internal Server Error"
        });
    }
};

export const logout = async (req, res) => {
    try {
        req.session.destroy((err) => { // destroying the session when logout
            if (err) {
                return res.status(500).json({ message: "Could not log out" });
            }
            res.clearCookie("connect.sid");
            res.status(200).json({ message: "Logged out successfully" });
        });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(error.status || 500).json({
            message: error.message || "Internal Server Error"
        });
    }
};