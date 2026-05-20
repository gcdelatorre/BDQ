import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, CaretRight } from "@phosphor-icons/react";
import { cn, formatRelativeTime } from "@/lib/utils";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

const getActionStyle = (type) => {
  switch (type) {
    case "CREATE": return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "UPDATE": return "bg-blue-50 text-blue-700 border-blue-100";
    case "DELETE": return "bg-rose-50 text-rose-700 border-rose-100";
    case "LOGIN": return "bg-purple-50 text-purple-700 border-purple-100";
    default: return "bg-slate-50 text-slate-700 border-slate-100";
  }
};

export default function RecentActivities({ logs = [], loading }) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock size={18} weight="bold" className="text-teal-600 shrink-0" />
          <h4 className="font-bold text-slate-900 text-sm tracking-tight">Recent Activities</h4>
        </div>
        <Link to="/audit" className="link-subtle shrink-0">
          View all <CaretRight size={12} weight="bold" />
        </Link>
      </div>
      
      {/* Scrollable Container Container matching RecentDispensing */}
      <div className="px-6 py-5 max-h-[350px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-50 rounded-xl" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-slate-500 text-center py-10 font-bold text-sm bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            System activity will appear here as staff use the app.
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <motion.div
                variants={itemVariants}
                key={log.log_id}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition-colors"
              >
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border shrink-0",
                  getActionStyle(log.action_type)
                )}>
                  {log.action_type}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {log.details || `${log.action_type} on ${log.table_name}`}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    {log.username} · {formatRelativeTime(log.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}