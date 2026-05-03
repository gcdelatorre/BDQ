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
          className="bg-white border border-slate-100 p-7 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
        >
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-4">{kpi.label}</p>
              <h3 className="text-4xl font-bold text-slate-900 tracking-tighter mb-2">{kpi.value}</h3>
              <div className={cn(
                "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
                kpi.color === "teal" && "text-teal-600 bg-teal-50",
                kpi.color === "blue" && "text-blue-600 bg-blue-50",
                kpi.color === "amber" && "text-amber-600 bg-amber-50",
              )}>
                <TrendUp className="w-3 h-3" /> {kpi.trend}
              </div>
            </div>

            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
              kpi.color === "teal" && "bg-teal-50 text-teal-600",
              kpi.color === "blue" && "bg-blue-50 text-blue-600",
              kpi.color === "amber" && "bg-amber-50 text-amber-600",
            )}>
              <kpi.icon weight="duotone" size={32} />
            </div>
          </div>

          <div className={cn(
            "absolute bottom-0 left-0 w-full h-1",
            kpi.color === "teal" && "bg-teal-500/10",
            kpi.color === "blue" && "bg-blue-500/10",
            kpi.color === "amber" && "bg-amber-500/10",
          )} />
        </motion.div>
      ))}
    </div>
  );
}
