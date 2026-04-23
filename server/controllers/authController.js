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
        
        // Note: In a real app, you would generate a JWT token here.
        res.status(200).json({
            message: "Login successful",
            user: result
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(error.status || 500).json({ 
            message: error.message || "Internal Server Error" 
        });
    }
};
