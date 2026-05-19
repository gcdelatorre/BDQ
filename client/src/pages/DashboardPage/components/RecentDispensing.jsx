import { motion } from "framer-motion";
import { Calendar, ClipboardList, Pill, User } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

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
      className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
        <h4 className="font-bold text-slate-900 tracking-tight">Recent Dispensing</h4>
        <div className="flex items-center gap-2 text-[10px] font-bold text-teal-700 bg-teal-50 px-4 py-2 rounded-xl uppercase tracking-widest border border-teal-100">
          <Calendar className="w-4 h-4" />
          History
        </div>
      </div>
      <div className="px-4 py-4">
        {transactions.length === 0 ? (
          <div className="text-slate-500 text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
              <ClipboardList className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-bold text-sm">No recent transactions</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50/80 rounded-2xl transition-all border border-transparent hover:border-slate-100 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">
                      Dispensed to {tx.child_first} {tx.child_last}
                    </p>
                    <p className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-widest flex items-center gap-1">
                      <User size={12} className="text-teal-600" /> Dispensed by {tx.nurse_first} {tx.nurse_last}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    {formatRelativeTime(tx.transaction_date)}
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
