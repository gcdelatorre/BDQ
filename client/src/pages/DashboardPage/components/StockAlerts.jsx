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
      className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
        <h4 className="font-bold text-slate-900 tracking-tight">Stock Alerts</h4>
        <button className="text-slate-400 hover:text-slate-600 font-bold">•••</button>
      </div>
      <div className="p-8 space-y-4">
        {alerts.length === 0 ? (
          <p className="text-center text-slate-400 italic py-10">No stock alerts</p>
        ) : (
          alerts.map((alert, index) => (
            <div key={index} className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100 flex gap-4 group cursor-pointer hover:bg-amber-50 transition-colors">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">{alert.type}</p>
                <p className="text-xs text-amber-700 font-bold opacity-80">{alert.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
