import { useState, useEffect } from "react";
import { Pill, Clock, Calendar, User, Note } from "@phosphor-icons/react";
import pharmacyService from "@/services/pharmacyService";
import { formatRelativeTime } from "@/lib/utils";

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

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center p-12">
        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-6">
          <Pill size={32} weight="duotone" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">No Medication History</h3>
        <p className="text-slate-500 max-w-sm mt-2 text-sm font-medium">This patient has not been dispensed any medication from the facility yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Medication History</h3>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
          {logs.length} Transactions
        </span>
      </div>

      <div className="space-y-4">
        {logs.map((log, idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:border-teal-100 transition-all group">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Date & Time */}
              <div className="md:w-48 shrink-0">
                <div className="flex items-center gap-2 text-teal-600 mb-1">
                  <Calendar size={18} weight="bold" />
                  <span className="text-xs font-black uppercase tracking-widest">Dispensed Date</span>
                </div>
                <p className="text-[15px] font-bold text-slate-900">{new Date(log.transaction_date).toLocaleDateString()}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{formatRelativeTime(log.transaction_date)}</p>
              </div>

              {/* Medication Details */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors border border-slate-100 group-hover:border-teal-100">
                      <Pill size={24} weight="duotone" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 leading-tight">{log.medicine_name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{log.generic_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900">{log.quantity_dispensed}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Units Dispensed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-teal-600 shadow-sm">
                      <Clock size={18} weight="bold" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dosage Schedule</p>
                      <p className="text-xs font-bold text-slate-700">{log.dosage_instruction} ({log.duration_days} days)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-teal-600 shadow-sm">
                      <User size={18} weight="bold" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dispensed By</p>
                      <p className="text-xs font-bold text-slate-700">{log.nurse_first} {log.nurse_last}</p>
                    </div>
                  </div>
                </div>

                {log.notes && (
                  <div className="mt-4 p-4 bg-teal-50/30 rounded-2xl border border-teal-100/50 flex gap-3">
                    <Note size={18} weight="duotone" className="text-teal-600 shrink-0 mt-0.5" />
                    <p className="text-[13px] font-medium text-slate-600 italic leading-relaxed">
                      "{log.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
