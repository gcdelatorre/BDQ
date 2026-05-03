import { motion } from "framer-motion";
import LoginForm from "./components/Form";
import LOGO1 from "../../assets/LOGO1.png"

export default function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden">
            {/* Background Mesh Gradients */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-teal-200/30 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-200/30 blur-[100px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-10 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40"
            >
                <div className="text-center mb-5 flex flex-col items-center">
                    <img
                        src={LOGO1}
                        alt="BDQ Logo"
                        className="h-16 w-auto object-contain" />
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">Health Portal</h2>
                </div>

                <LoginForm />

                <p className="text-center text-slate-400 text-[11px] mt-8 font-bold uppercase tracking-widest">
                    Authorized Access Only
                </p>
            </motion.div>
        </div>
    );
}
