import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, ClipboardList, Pill, User } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function RecentDispensing({ transactions = [], loading }) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <h4 className="font-bold text-slate-900 text-sm tracking-tight">Recent Dispensing</h4>
        <Link
          to="/pharmacy"
          className="flex items-center gap-2 text-[10px] font-bold text-teal-700 bg-teal-50 px-4 py-2 rounded-xl uppercase tracking-widest border border-teal-100 hover:bg-teal-100 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          New dispense
        </Link>
      </div>
      <div className="px-6 py-5 max-h-[350px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-50 rounded-2xl" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-slate-500 text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
              <ClipboardList className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-bold text-sm">No dispensing records yet</p>
            <p className="text-xs text-slate-400 mt-1">Transactions will appear here after the first dispense.</p>
          </div>
        ) : (
          <motion.div variants={itemVariants} className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.transaction_id}
                className="flex items-center justify-between p-3 hover:bg-slate-50/80 rounded-2xl transition-all border border-transparent hover:border-slate-100 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <motion.div variants={itemVariants} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors shrink-0">
                    <Pill className="w-6 h-6" />
                  </motion.div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 leading-tight truncate">
                      {tx.patient_first} {tx.patient_last}
                    </p>
                    <p className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-widest flex items-center gap-1">
                      <User size={12} className="text-teal-600 shrink-0" />
                      <span className="truncate">
                        By {tx.nurse_first} {tx.nurse_last}
                      </span>
                    </p>
                  </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter shrink-0 ml-3">
                  {formatRelativeTime(tx.transaction_date)}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
