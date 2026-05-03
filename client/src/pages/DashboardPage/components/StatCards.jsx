import { motion } from "framer-motion";
import { Pill, AlertCircle, ClipboardList, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

const defaultKpis = [
  { label: "Total Patients", value: "148", trend: "+12%", up: true, icon: Pill, color: "blue" },
  { label: "Active Prescriptions", value: "28", trend: "+5%", up: false, icon: ClipboardList, color: "teal" },
  { label: "Low Stock Items", value: "12", trend: "+2%", up: true, icon: AlertCircle, color: "amber" },
];

export default function StatCards({ data = defaultKpis }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((kpi) => (
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
  );
}
