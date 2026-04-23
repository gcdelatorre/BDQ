import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
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

app.get("/", (req, res) => {
    res.send("BDQ System API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});