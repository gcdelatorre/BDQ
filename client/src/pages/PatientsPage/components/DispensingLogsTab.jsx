import { useState, useEffect } from "react";
import { Pill, Clock, Calendar, User, Note, Info } from "@phosphor-icons/react";
import pharmacyService from "@/services/pharmacyService";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function DispensingLogsTab({ childId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [childId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await pharmacyService.getHistoryByChild(childId);
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch dispensing logs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Medication History</h3>
          <p className="text-slate-500 text-sm">Full log of medications dispensed at this facility</p>
        </div>
        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600">
          <Info size={16} weight="duotone" className="text-blue-500" />
          {logs.length} Total Transactions
        </div>
      </div>

      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center p-12">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-6">
              <Pill size={32} weight="duotone" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">No Medication History</h3>
            <p className="text-slate-500 max-w-sm mt-2 text-sm font-medium">No medication dispensing records found for this patient.</p>
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:border-teal-100 transition-all group">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Date & Meta */}
                <div className="md:w-48 shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-slate-50 pb-4 md:pb-0">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Calendar size={16} weight="bold" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Dispensed Date</span>
                  </div>
                  <p className="text-base font-bold text-slate-900">{new Date(log.transaction_date).toLocaleDateString()}</p>
                  <p className="text-[10px] font-bold text-teal-600 uppercase mt-1 tracking-tighter">{formatRelativeTime(log.transaction_date)}</p>
                  
                  <div className="mt-auto hidden md:block pt-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <User size={16} weight="bold" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Dispensed By</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-700">{log.nurse_first} {log.nurse_last}</p>
                  </div>
                </div>

                {/* Medication Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shadow-sm border border-teal-100/50">
                        <Pill size={24} weight="duotone" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 leading-tight">{log.medicine_name}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{log.generic_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-900">{log.quantity_dispensed}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Units</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 flex items-center gap-3">
                      <Clock size={18} weight="duotone" className="text-teal-600 shrink-0" />
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Schedule</p>
                        <p className="text-xs font-bold text-slate-700">{log.dosage_instruction}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 flex items-center gap-3">
                      <Calendar size={18} weight="duotone" className="text-teal-600 shrink-0" />
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                        <p className="text-xs font-bold text-slate-700">{log.duration_days} Days</p>
                      </div>
                    </div>
                  </div>

                  {log.notes && (
                    <div className="p-3 bg-amber-50/30 rounded-xl border border-amber-100/50 flex gap-2">
                      <Note size={16} weight="duotone" className="text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[12px] font-medium text-slate-600 italic leading-relaxed">
                        "{log.notes}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
