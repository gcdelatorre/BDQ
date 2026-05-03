import { motion } from "framer-motion";
import { Clock } from "@phosphor-icons/react";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function RecentActivities({ logs = [] }) {
  return (
    <motion.div 
      variants={itemVariants}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="p-8 border-b border-slate-50 flex items-center gap-3">
        <Clock size={20} weight="bold" className="text-teal-600" />
        <h4 className="font-bold text-slate-900 tracking-tight">Recent Activities</h4>
      </div>
      <div className="p-8">
        <div className="text-slate-500 text-center py-10 font-bold text-sm bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          {logs.length === 0 ? "System activity log will appear here" : "Loading activities..."}
        </div>
      </div>
    </motion.div>
  );
}
