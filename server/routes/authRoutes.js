import express from "express";
import * as authController from "../controllers/authController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", authController.register);

// POST /api/auth/login
router.post("/login", authController.login);

// GET /api/auth/get-all-users (Protected: Admin only)
router.get("/get-all-users", protect, restrictTo("Admin"), authController.getAllUser);

// POST /api/auth/logout
router.post("/logout", authController.logout);

// GET /api/auth/me (Protected)
router.get("/me", protect, authController.getCurrentUser);

export default router;
