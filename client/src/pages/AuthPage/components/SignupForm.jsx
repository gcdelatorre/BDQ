import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, User, Envelope, CircleNotch, ArrowLeft } from "@phosphor-icons/react";
import api from "../../../services/api";

export default function SignupForm() {
    const [payload, setPayload] = useState({
        first_name: "",
        last_name: "",
        username: "",
        password: "",
        confirm_password: "",
        email: "",
        role: "Nurse"
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [passwordMatch, setPasswordMatch] = useState(true);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload((prev) => ({ ...prev, [name]: value }));

        // Check password match
        if (name === "confirm_password" || name === "password") {
            const pwd = name === "password" ? value : payload.password;
            const confirm = name === "confirm_password" ? value : payload.confirm_password;
            setPasswordMatch(pwd === confirm || confirm === "");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!passwordMatch) {
            setError("Passwords do not match");
            return;
        }

        if (payload.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsSubmitting(true);

        try {
            const { confirm_password, ...registerData } = payload;
            await api.post("/auth/register", registerData);
            
            // Show success and redirect to login
            navigate("/login", { 
                state: { message: "Account created successfully! Please log in." }
            });
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl animate-shake">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">First Name</label>
                    <input
                        type="text"
                        name="first_name"
                        value={payload.first_name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                        placeholder="First name"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Last Name</label>
                    <input
                        type="text"
                        name="last_name"
                        value={payload.last_name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                        placeholder="Last name"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Username</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors">
                        <User size={18} />
                    </div>
                    <input
                        type="text"
                        name="username"
                        value={payload.username}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                        placeholder="Choose username"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email (Optional)</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors">
                        <Envelope size={18} />
                    </div>
                    <input
                        type="email"
                        name="email"
                        value={payload.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                        placeholder="your@email.com"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Role</label>
                <select
                    name="role"
                    value={payload.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium"
                >
                    <option value="Nurse">Nurse</option>
                    <option value="Midwife">Midwife</option>
                    <option value="Admin">Admin</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors">
                        <Lock size={18} />
                    </div>
                    <input
                        type="password"
                        name="password"
                        value={payload.password}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                        placeholder="At least 6 characters"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Confirm Password</label>
                <div className="relative group">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${passwordMatch ? "text-slate-400 group-focus-within:text-teal-600" : "text-red-400"}`}>
                        <Lock size={18} />
                    </div>
                    <input
                        type="password"
                        name="confirm_password"
                        value={payload.confirm_password}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 outline-none transition-all ${
                            passwordMatch ? "border-slate-100 focus:border-teal-500" : "border-red-200 focus:border-red-500 focus:ring-red-500/10"
                        }`}
                        placeholder="Repeat password"
                        required
                    />
                </div>
                {!passwordMatch && <p className="text-xs text-red-500 font-medium">Passwords do not match</p>}
            </div>

            <button
                type="submit"
                disabled={isSubmitting || !passwordMatch}
                className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <CircleNotch size={18} className="animate-spin" />
                        Creating Account...
                    </>
                ) : (
                    "Create Account"
                )}
            </button>

            <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-sm transition-colors py-2"
            >
                <ArrowLeft size={16} />
                Back to Sign In
            </Link>
        </form>
    );
}
