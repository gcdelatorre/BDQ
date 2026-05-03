import { motion } from "framer-motion";

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
      className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="p-8 border-b border-slate-50">
        <h4 className="font-bold text-slate-900 tracking-tight">Recent Activities</h4>
      </div>
      <div className="p-8">
        <div className="text-slate-400 text-center py-10 italic bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          {logs.length === 0 ? "System activity log will appear here" : "Loading activities..."}
        </div>
      </div>
    </motion.div>
  );
}
