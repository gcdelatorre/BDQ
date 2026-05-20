import { AnimatePresence, motion } from "framer-motion";
import { X, Package, Clock } from "@phosphor-icons/react";

export default function DispensingHistoryModal({ isOpen, onClose, history, loading }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <Package size={22} weight="duotone" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold">Dispensing history</p>
                  <h3 className="text-lg font-bold text-slate-900">Recent transactions</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                aria-label="Close history"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex h-60 items-center justify-center">
                  <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex h-48 items-center justify-center text-center text-slate-500">
                  No dispensing records are available yet.
                </div>
              ) : (
                <div className="space-y-4 max-h-130 overflow-y-auto custom-scrollbar pr-2">
                  {history.map((item) => (
                    <div key={item.transaction_id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">Transaction #{item.transaction_id}</p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {new Date(item.transaction_date).toLocaleString()}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200">
                          <Clock size={14} />
                          {item.patient_first} {item.patient_last}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white p-3 border border-slate-200">
                          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold">Dispensed by</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{item.nurse_first} {item.nurse_last}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-3 border border-slate-200">
                          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold">Notes</p>
                          <p className="mt-1 text-sm text-slate-600">{item.notes || "No notes recorded."}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
