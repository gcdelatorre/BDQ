import { motion } from "framer-motion";
import { Pill, AlertCircle, Calendar, Package, ArrowUpRight, ArrowDownRight, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const kpis = [
  { label: "Total Patients", value: "148", trend: "+12%", up: true, icon: Pill, color: "blue" },
  { label: "Active Prescriptions", value: "28", trend: "+5%", up: false, icon: ClipboardList, color: "teal" },
  { label: "Low Stock Items", value: "12", trend: "+2%", up: true, icon: AlertCircle, color: "amber" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function Dashboard() {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 pb-10"
    >
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Pharmacy Management</h2>
        <p className="text-slate-500 text-sm font-medium">Real-time inventory and prescription oversight</p>
      </div>

      {/* KPI Row: 4 Columns with Glows */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi) => (
          <motion.div 
            key={kpi.label} 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden"
          >
            {/* Soft Background Glow */}
            <div className={cn(
              "absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-20 transition-opacity group-hover:opacity-40",
              kpi.color === "teal" && "bg-teal-500",
              kpi.color === "amber" && "bg-amber-500",
              kpi.color === "blue" && "bg-blue-500",
              kpi.color === "purple" && "bg-purple-500",
            )}></div>

            <div className="flex items-center gap-4 mb-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                kpi.color === "teal" && "bg-teal-50 text-teal-600",
                kpi.color === "amber" && "bg-amber-50 text-amber-600",
                kpi.color === "blue" && "bg-blue-50 text-blue-600",
                kpi.color === "purple" && "bg-purple-50 text-purple-600",
              )}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.15em]">{kpi.label}</p>
            </div>
            <div className="flex items-end justify-between relative z-10">
              <h3 className="text-3xl font-bold text-slate-900 leading-none">{kpi.value}</h3>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full",
                kpi.up ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
              )}>
                {kpi.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {kpi.trend}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Middle Content: Split View with Glassmorphism */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prescription Queue */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white/50">
            <h4 className="font-bold text-slate-900 tracking-tight">Recent Dispensing</h4>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-600 bg-teal-50 px-4 py-2 rounded-2xl">
              <Calendar className="w-4 h-4" />
              Sat, Feb 7
            </div>
          </div>
          <div className="p-10">
            <div className="text-slate-400 text-center py-20 italic bg-slate-50/30 rounded-[2rem] border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <ClipboardList className="w-8 h-8 text-slate-200" />
              </div>
              No active prescriptions in queue
            </div>
          </div>
        </motion.div>

        {/* Stock Alerts */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
        >
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h4 className="font-bold text-slate-900 tracking-tight">Stock Alerts</h4>
            <button className="text-slate-400 hover:text-slate-600 font-bold">•••</button>
          </div>
          <div className="p-8 space-y-4">
            <div className="p-6 bg-red-50/50 rounded-3xl border border-red-100 flex gap-4 group cursor-pointer hover:bg-red-50 transition-colors">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-900">Critical Stock</p>
                <p className="text-xs text-red-700 font-bold opacity-80">Aspirin 75mg (Batch 002)</p>
              </div>
            </div>
            <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100 flex gap-4 group cursor-pointer hover:bg-amber-50 transition-colors">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">Low Stock</p>
                <p className="text-xs text-amber-700 font-bold opacity-80">Paracetamol 500mg</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activities */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-slate-50">
          <h4 className="font-bold text-slate-900 tracking-tight">Recent Activities</h4>
        </div>
        <div className="p-8">
          <div className="text-slate-400 text-center py-10 italic bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            System activity log will appear here
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
