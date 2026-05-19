import { motion } from "framer-motion";
import { CalendarCheck, Bell, CaretRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function UpcomingRecalls({ recalls = [], loading }) {
  // Filter for only upcoming recalls (due today or in the next 7 days)
  const upcomingRecalls = recalls
    .filter(r => r.status === "Upcoming")
    .slice(0, 3); // Take top 3

  return (
    <motion.div 
      variants={itemVariants}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full"
    >
      <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={20} weight="bold" className="text-teal-600" />
          <h4 className="font-bold text-slate-900 tracking-tight">Vaccine Recalls</h4>
        </div>
        <Link 
          to="/recall" 
          className="text-teal-600 hover:text-teal-700 text-xs font-bold flex items-center gap-0.5 hover:underline transition-colors"
        >
          View All <CaretRight size={12} weight="bold" />
        </Link>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
          </div>
        ) : upcomingRecalls.length === 0 ? (
          <div className="text-slate-400 text-center py-8">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3 border border-slate-100">
              <CalendarCheck size={20} className="text-slate-300" />
            </div>
            <p className="font-bold text-xs">No recalls scheduled next week</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingRecalls.map((recall, index) => (
              <div 
                key={index} 
                className="p-3 bg-teal-50/40 hover:bg-teal-50/80 border border-teal-100/30 rounded-xl flex gap-3.5 group cursor-pointer transition-all duration-200"
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-teal-600 shrink-0 border border-teal-100/40 shadow-sm group-hover:scale-105 transition-transform">
                  <CalendarCheck size={20} weight="duotone" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-slate-900 text-xs truncate leading-none">
                      {recall.first_name} {recall.last_name}
                    </p>
                    <span className="text-[9px] bg-teal-100/60 text-teal-800 px-1.5 py-0.5 rounded font-black uppercase tracking-wider whitespace-nowrap">
                      {recall.vaccine_type} #{recall.dose_number}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">
                    Due {new Date(recall.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    <span className="text-slate-400 font-medium"> ({recall.diff_days === 0 ? "Today" : `in ${recall.diff_days}d`})</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
