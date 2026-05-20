import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { CaretRight } from "@phosphor-icons/react";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function StockAlerts({ alerts = [], loading }) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <h4 className="font-bold text-slate-900 text-sm tracking-tight">Stock Alerts</h4>
        <Link to="/inventory" className="link-subtle shrink-0">
          Inventory <CaretRight size={12} weight="bold" />
        </Link>
      </div>
      <div className="px-6 py-5 space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-slate-50 rounded-2xl" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-slate-500 font-bold text-sm">All medicines above reorder level</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <Link
              key={alert.medicine_id ?? alert.message}
              to="/inventory"
              className="block p-3 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4 group hover:bg-amber-100 transition-colors"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 shrink-0 shadow-sm">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900 leading-tight">{alert.type}</p>
                <p className="text-[11px] text-amber-800 font-bold opacity-75 mt-1">{alert.message}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </motion.div>
  );
}
