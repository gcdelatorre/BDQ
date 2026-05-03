import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Lock, User, Loader2 } from "lucide-react";

export default function LoginForm() {
    const [payload, setPayload] = useState({ username: "", password: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            await login({ username: payload.username, password: payload.password });
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 animate-shake">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Username</label>
                <div className="relative group">
                    <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                    <input
                        type="text"
                        name="username"
                        value={payload.username}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-teal-100 focus:ring-4 focus:ring-teal-50 rounded-2xl text-sm transition-all outline-none"
                        placeholder="Enter your username"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Password</label>
                <div className="relative group">
                    <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                    <input
                        type="password"
                        name="password"
                        value={payload.password}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-teal-100 focus:ring-4 focus:ring-teal-50 rounded-2xl text-sm transition-all outline-none"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold shadow-lg shadow-teal-200 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
            >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In to Dashboard"}
            </button>
        </form>
    );
}
