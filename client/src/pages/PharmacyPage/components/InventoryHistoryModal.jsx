import { AnimatePresence, motion } from "framer-motion";
import { X, Calendar, Warehouse, Hash, Truck, Archive } from "@phosphor-icons/react";

export default function InventoryHistoryModal({ isOpen, onClose, history, loading, medicineName }) {
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Warehouse size={22} weight="duotone" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold">Inventory batches</p>
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{medicineName || "Batch History"}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                aria-label="Close history"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex h-60 items-center justify-center">
                  <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <Archive size={32} />
                  </div>
                  <p className="text-slate-500 font-medium text-sm">No batch records found for this medicine.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-130 overflow-y-auto custom-scrollbar pr-2">
                  {history.map((batch) => (
                    <div key={batch.inventory_id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5 hover:bg-white hover:border-blue-100 transition-all group">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
                            <Hash size={20} weight="bold" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{batch.batch_number}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Reference ID: {batch.inventory_id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-blue-600/20">
                            {batch.quantity_in_stock} UNITS
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-2xl bg-white p-3 border border-slate-200/50">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Calendar size={14} className="text-teal-500" />
                            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold">Received On</p>
                          </div>
                          <p className="text-sm font-bold text-slate-700">{formatDate(batch.date_received)}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-3 border border-slate-200/50">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Truck size={14} className="text-blue-500" />
                            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold">Supplier</p>
                          </div>
                          <p className="text-sm font-bold text-slate-700 truncate" title={batch.supplier_name}>
                            {batch.supplier_name || "N/A"}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white p-3 border border-slate-200/50">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Clock size={14} className="text-rose-500" />
                            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold">Expiration</p>
                          </div>
                          <p className="text-sm font-bold text-slate-700">{formatDate(batch.expiration_date)}</p>
                        </div>
                      </div>

                      {batch.storage_location && (
                        <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-white/50 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Storage:</p>
                          <p className="text-[11px] font-bold text-slate-600">{batch.storage_location}</p>
                        </div>
                      )}
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

// Helper to avoid ReferenceError if Clock is not imported (though it's usually needed)
import { Clock } from "@phosphor-icons/react";
