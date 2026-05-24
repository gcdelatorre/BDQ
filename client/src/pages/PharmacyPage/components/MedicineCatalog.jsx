import { memo } from "react";
import { MagnifyingGlass, Pill } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const MedicineCard = memo(function MedicineCard({ med, inBasketQty, disabled, onAdd }) {
  const stock = Number(med.total_stock) || 0;
  const isOutOfStock = stock <= 0;
  const showGeneric = !med.medicine_name.toLowerCase().includes(med.generic_name.toLowerCase());

  return (
    <button
      type="button"
      disabled={isOutOfStock || disabled}
      onClick={() => onAdd(med)}
      className={cn(
        "relative flex items-center gap-3 text-left p-3 rounded-xl border",
        "transition-all duration-200",
        isOutOfStock && "opacity-50 cursor-not-allowed bg-slate-50 border-slate-100",
        !isOutOfStock && inBasketQty > 0 && "bg-teal-50 border-teal-200 ring-1 ring-teal-200/50",
        !isOutOfStock && !inBasketQty && "bg-white border-slate-200 hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      {inBasketQty > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10">
          {inBasketQty}
        </div>
      )}
      
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
          isOutOfStock ? "bg-slate-200 text-slate-400" : "bg-teal-600 text-white"
        )}
      >
        <Pill size={20} weight="duotone" />
      </div>

      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-tight mb-0.5">
          {med.medicine_name}
        </p>
        {showGeneric && (
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1 mb-1">
            {med.generic_name}
          </p>
        )}
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            isOutOfStock ? "bg-rose-500" : (stock < 20 ? "bg-amber-500" : "bg-emerald-500")
          )} />
          <p className={cn(
            "text-[9px] font-black uppercase tracking-widest",
            isOutOfStock ? "text-rose-600" : "text-slate-500"
          )}>
            {isOutOfStock ? "NO STOCK" : `${stock} ${med.unit_of_measure}`}
          </p>
        </div>
      </div>
    </button>
  );
});

function MedicineCatalog({
  medicines,
  searchMed,
  onSearchChange,
  filterCategory,
  onFilterCategoryChange,
  basket,
  onAdd,
  disabled,
  loading
}) {
  const filtered = medicines.filter(
    (m) =>
      m.medicine_name.toLowerCase().includes(searchMed.toLowerCase()) ||
      m.generic_name.toLowerCase().includes(searchMed.toLowerCase())
  );

  const basketQtyById = basket.reduce((acc, item) => {
    acc[item.medicine_id] = item.quantity_dispensed;
    return acc;
  }, {});

  return (
    <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[320px] lg:min-h-0 lg:flex-1 overflow-hidden">
      {loading && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-[1px] rounded-2xl"
          aria-hidden="true"
        >
          <div className="w-8 h-8 border-2 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
        </div>
      )}

      <div className="p-5 border-b border-slate-100 shrink-0">
        <p className="step-label mb-3">Step 2 — Add medicines</p>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <MagnifyingGlass
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={20}
            />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchMed}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={disabled || loading}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-200 rounded-xl outline-none text-sm font-medium disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["ALL", "TABLET", "SYRUP", "CAPSULE", "INJECTION", "CREAM", "DROPS"].map((cat) => (
              <button
                key={cat}
                onClick={() => onFilterCategoryChange(cat)}
                disabled={disabled || loading}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                  filterCategory === cat
                    ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50",
                  (disabled || loading) && "opacity-50 cursor-not-allowed"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        {disabled && !loading && (
          <p className="text-xs text-amber-700 font-bold mt-2">
            Select a patient above to enable the catalog.
          </p>
        )}
      </div>

      <div
        className={cn(
          "p-5 overflow-y-auto flex-1 custom-scrollbar",
          disabled && !loading && "pointer-events-none select-none"
        )}
      >
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-12">No medicines match your search.</p>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((med) => (
              <MedicineCard
                key={med.medicine_id}
                med={med}
                inBasketQty={basketQtyById[med.medicine_id] || 0}
                disabled={disabled || loading}
                onAdd={onAdd}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(MedicineCatalog);
