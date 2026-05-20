import { MagnifyingGlass, UsersThree, X, Phone } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const RECENT_LIMIT = 8;

export default function PatientSelector({
  patients,
  searchPatient,
  onSearchChange,
  selectedPatient,
  onSelect,
  onClear
}) {
  const query = searchPatient.trim().toLowerCase();

  const filtered = query
    ? patients.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(query) ||
        p.family_serial_number?.toLowerCase().includes(query) ||
        p.contact_number?.includes(searchPatient.trim())
      ).slice(0, 10)
    : [];

  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.date_of_registration) - new Date(a.date_of_registration))
    .slice(0, RECENT_LIMIT);

  const listToShow = query ? filtered : recentPatients;

  if (selectedPatient) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-teal-50 border border-teal-200 rounded-2xl">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <UsersThree size={24} weight="fill" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">Patient</p>
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
          Change patient
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="step-label mb-2 block">Step 1 — Select patient</label>
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
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          {query ? `Matches (${listToShow.length})` : "Recently registered"}
        </p>
        {listToShow.length === 0 ? (
          <p className="text-sm text-slate-500 font-medium py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            {query ? "No patients match your search." : "No patients registered yet."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
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
                {p.contact_number ? (
                  <p className="text-[10px] text-slate-500 mt-1 truncate">{p.contact_number}</p>
                ) : (
                  <p className="text-[10px] text-amber-600 mt-1">No contact on file</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
