import { motion } from "framer-motion";
import LoginForm from "./components/Form";

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
        className="w-full max-w-md p-8 bg-white/70 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-teal-600 rounded-3xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-6 shadow-xl shadow-teal-200">
            BDQ
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Health Portal</h2>
          <p className="text-slate-500 font-medium mt-2">BDQ System</p>
        </div>

        <LoginForm />

        <p className="text-center text-slate-400 text-[11px] mt-8 font-bold uppercase tracking-widest">
          Authorized Access Only
        </p>
      </motion.div>
    </div>
  );
}
