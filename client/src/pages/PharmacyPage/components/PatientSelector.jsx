import { MagnifyingGlass, UsersThree, X, Phone } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export default function PatientSelector({
  patients,
  searchPatient,
  onSearchChange,
  selectedPatient,
  onSelect,
  onClear,
  loading,
  hasMore,
  onLoadMore
}) {
  const query = searchPatient.trim().toLowerCase();

  const filtered = query
    ? patients.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(query) ||
        p.family_serial_number?.toLowerCase().includes(query) ||
        p.contact_number?.includes(searchPatient.trim())
      )
    : patients;

  const listToShow = filtered;

  if (selectedPatient) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-teal-50 border border-teal-200 rounded-2xl w-full">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <UsersThree size={24} weight="fill" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">Active Patient</p>
            <p className="text-lg font-black text-slate-900 truncate">
              {selectedPatient.first_name} {selectedPatient.last_name}
            </p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              {selectedPatient.family_serial_number}
              {selectedPatient.contact_number && (
                <span className="inline-flex items-center gap-1 ml-2 text-teal-700">
                  <Phone size={12} weight="bold" />
                  {selectedPatient.contact_number}
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shrink-0"
        >
          <X size={16} weight="bold" />
          Remove Patient
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div>
        <label className="step-label mb-2 block">Step 1 — Find and Select Patient</label>
        <div className="relative">
          <MagnifyingGlass
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name, FSN, or contact number..."
            value={searchPatient}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-300 transition-all"
          />
        </div>
      </div>

      <div>
        {loading ? (
          <p className="text-sm text-slate-500 font-medium py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Searching patients...
          </p>
        ) : listToShow.length === 0 ? (
          <p className="text-sm text-slate-500 font-medium py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            {query ? "No patients match your search." : "No patients registered yet."}
          </p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {listToShow.map((p) => (
                <button
                  key={p.child_id}
                  type="button"
                  onClick={() => onSelect(p)}
                  className={cn(
                    "text-left p-3 rounded-xl border transition-all",
                    "bg-white border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 hover:shadow-sm"
                  )}
                >
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {p.first_name} {p.last_name}
                  </p>
                  <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mt-1 truncate">
                    {p.family_serial_number}
                  </p>
                </button>
              ))}
            </div>

            {hasMore && (
              <button
                type="button"
                onClick={onLoadMore}
                disabled={loading}
                className="w-full py-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
              >
                {loading ? "Loading more..." : "Show more patients"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
