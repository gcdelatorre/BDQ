import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import dispensingRoutes from "./routes/dispensingRoutes.js";
import immunizationRoutes from "./routes/immunizationRoutes.js";

import nutritionRoutes from "./routes/nutritionRoutes.js";
import supplementRoutes from "./routes/supplementRoutes.js";
import breastfeedingRoutes from "./routes/breastfeedingRoutes.js";
import reportingRoutes from "./routes/reportingRoutes.js";
import session from "express-session";

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
}));
app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || "barangay_health_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/medicine", medicineRoutes);
app.use("/api/dispensing", dispensingRoutes);
app.use("/api/immunization", immunizationRoutes);

app.use("/api/nutrition", nutritionRoutes);
app.use("/api/supplement", supplementRoutes);
app.use("/api/breastfeeding", breastfeedingRoutes);
app.use("/api/reports", reportingRoutes);

app.get("/", (req, res) => {
    res.send("BDQ System API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});