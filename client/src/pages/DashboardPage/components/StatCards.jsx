import { motion } from "framer-motion";
import { UsersThree, WarningCircle, ClipboardText, TrendUp } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
};

const kpis = [
  { label: "Total Patients", value: "1,284", icon: UsersThree, color: "teal", trend: "+12%" },
  { label: "Active Prescriptions", value: "42", icon: ClipboardText, color: "blue", trend: "+5%" },
  { label: "Stock Alerts", value: "08", icon: WarningCircle, color: "amber", trend: "-2%" },
];

export default function StatCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {kpis.map((kpi) => (
        <motion.div
          key={kpi.label}
          variants={itemVariants}
          className="bg-white border border-slate-100 p-7 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.1em] mb-4">{kpi.label}</p>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tighter mb-2">{kpi.value}</h3>
              <div className={cn(
                "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg",
                kpi.color === "teal" && "text-teal-700 bg-teal-50",
                kpi.color === "blue" && "text-blue-700 bg-blue-50",
                kpi.color === "amber" && "text-amber-700 bg-amber-50",
              )}>
                <TrendUp className="w-3 h-3" /> {kpi.trend}
              </div>
            </div>

            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300",
              kpi.color === "teal" && "bg-teal-50 text-teal-600",
              kpi.color === "blue" && "bg-blue-50 text-blue-600",
              kpi.color === "amber" && "bg-amber-50 text-amber-600",
            )}>
              <kpi.icon weight="duotone" size={28} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
