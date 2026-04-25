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
import session from "express-session";

const app = express();

app.use(cors());
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

app.get("/", (req, res) => {
    res.send("BDQ System API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});