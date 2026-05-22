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
        "relative flex flex-col text-left p-3 rounded-xl border min-h-[7.5rem]",
        "transition-[border-color,background-color,box-shadow] duration-150",
        isOutOfStock && "opacity-50 cursor-not-allowed bg-slate-50 border-slate-100",
        !isOutOfStock && inBasketQty > 0 && "bg-teal-50 border-teal-200",
        !isOutOfStock && !inBasketQty && "bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm"
      )}
    >
      {inBasketQty > 0 && (
        <span className="absolute top-0 right-0 min-w-[1.5rem] h-6 px-1 bg-teal-600 text-white text-[10px] font-black rounded-bl-lg flex items-center justify-center">
          {inBasketQty}
        </span>
      )}
      <div
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center mb-2 shrink-0",
          isOutOfStock ? "bg-slate-100 text-slate-400" : "bg-teal-50 text-teal-600"
        )}
      >
        <Pill size={18} weight="duotone" />
      </div>
      <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">{med.medicine_name}</p>
      {showGeneric && (
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 line-clamp-1">
          {med.generic_name}
        </p>
      )}
      <p
        className={cn(
          "text-[10px] font-black uppercase tracking-wider mt-auto pt-2",
          isOutOfStock ? "text-red-500" : "text-slate-500"
        )}
      >
        {isOutOfStock ? "Out of stock" : `${stock} ${med.unit_of_measure}`}
      </p>
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
