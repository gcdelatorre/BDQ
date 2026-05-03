import { motion } from "framer-motion";
import { Calendar, ClipboardList } from "lucide-react";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function RecentDispensing({ transactions = [] }) {
  return (
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
        {transactions.length === 0 ? (
          <div className="text-slate-400 text-center py-20 italic bg-slate-50/30 rounded-[2rem] border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <ClipboardList className="w-8 h-8 text-slate-200" />
            </div>
            No active prescriptions in queue
          </div>
        ) : (
          <div className="space-y-4">
            {/* Real list items would go here */}
          </div>
        )}
      </div>
    </motion.div>
  );
}
