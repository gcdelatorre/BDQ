import { AnimatePresence, motion } from "framer-motion";
import { Package, Plus, Minus, Trash, ClipboardText, Warning } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export default function DispensingCart({
  basket,
  notes,
  onNotesChange,
  selectedPatient,
  getLiveStock,
  onUpdateItem,
  onRemoveItem,
  onDispense,
  isDispensing
}) {
  const itemCount = basket.reduce((sum, i) => sum + i.quantity_dispensed, 0);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl flex flex-col min-h-[320px] lg:min-h-0 lg:flex-1 overflow-hidden">
      <div className="p-5 border-b border-white/10">
        <p className="step-label text-white/50">
          Step 3 — Review & dispense
        </p>
        <p className="text-white font-bold text-sm mt-1">
          {basket.length === 0
            ? "Cart is empty"
            : `${basket.length} medicine(s) · ${itemCount} unit(s)`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar-light min-h-[140px]">
        {basket.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/40 py-8">
            <Package size={48} weight="duotone" className="mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest">Add items from catalog</p>
          </div>
        ) : (
          <AnimatePresence>
            {basket.map((item) => {
              const maxStock = getLiveStock(item.medicine_id);
              return (
                <motion.div
                  key={item.medicine_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-teal-300 truncate">{item.medicine_name}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">
                        Available: {maxStock} {item.unit_of_measure}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.medicine_id)}
                      className="text-white/30 hover:text-red-400 p-1 shrink-0"
                      aria-label="Remove"
                    >
                      <Trash size={18} weight="fill" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10">
                      <button
                        type="button"
                        onClick={() => onUpdateItem(item.medicine_id, "quantity_dispensed", Math.max(1, item.quantity_dispensed - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-white"
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-white">{item.quantity_dispensed}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateItem(item.medicine_id, "quantity_dispensed", Math.min(maxStock, item.quantity_dispensed + 1))}
                        disabled={item.quantity_dispensed >= maxStock}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-white disabled:opacity-30"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={item.duration_days}
                      onChange={(e) => onUpdateItem(item.medicine_id, "duration_days", Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-16 bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] font-bold text-white text-center"
                      title="Duration (days)"
                    />
                    <span className="text-[10px] text-white/40 font-bold">days</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Sig. (e.g. 1 tab 3x a day)"
                    value={item.dosage_instruction}
                    onChange={(e) => onUpdateItem(item.medicine_id, "dosage_instruction", e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-white placeholder:text-white/30 outline-none focus:border-teal-500/50"
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <div className="p-4 border-t border-white/10 space-y-3 bg-black/30">
        <div>
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">
            Visit notes (optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="e.g. Follow-up for fever, counsel on completion..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-teal-500/50 resize-none"
          />
        </div>

        <button
          type="button"
          onClick={onDispense}
          disabled={isDispensing || basket.length === 0 || !selectedPatient}
          className={cn(
            "w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
            "bg-teal-500 text-white hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isDispensing ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ClipboardText size={18} weight="bold" />
              Confirm & dispense
            </>
          )}
        </button>

        {!selectedPatient && basket.length > 0 && (
          <p className="text-[10px] font-bold text-amber-400 flex items-center justify-center gap-1">
            <Warning size={12} weight="bold" />
            Select a patient in step 1
          </p>
        )}
      </div>
    </div>
  );
}
