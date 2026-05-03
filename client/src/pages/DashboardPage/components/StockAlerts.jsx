import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function StockAlerts({ alerts = [] }) {
  return (
    <motion.div 
      variants={itemVariants}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
        <h4 className="font-bold text-slate-900 tracking-tight">Stock Alerts</h4>
        <button className="text-slate-400 hover:text-slate-600 font-bold">•••</button>
      </div>
      <div className="p-8 space-y-4">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-slate-500 font-bold text-sm">No stock alerts</p>
          </div>
        ) : (
          alerts.map((alert, index) => (
            <div key={index} className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4 group cursor-pointer hover:bg-amber-100 transition-colors">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 shrink-0 shadow-sm">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900 leading-tight">{alert.type}</p>
                <p className="text-[11px] text-amber-800 font-bold opacity-75 mt-1">{alert.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
