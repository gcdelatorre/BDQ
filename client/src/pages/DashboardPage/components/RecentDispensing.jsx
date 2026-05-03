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
      className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
        <h4 className="font-bold text-slate-900 tracking-tight">Recent Dispensing</h4>
        <div className="flex items-center gap-2 text-[10px] font-bold text-teal-700 bg-teal-50 px-4 py-2 rounded-xl uppercase tracking-widest border border-teal-100">
          <Calendar className="w-4 h-4" />
          Today
        </div>
      </div>
      <div className="p-8">
        {transactions.length === 0 ? (
          <div className="text-slate-500 text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
              <ClipboardList className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-bold text-sm">No active prescriptions in queue</p>
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
