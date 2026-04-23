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

// GET /api/auth/logout
router.get("/logout", authController.logout);

export default router;
