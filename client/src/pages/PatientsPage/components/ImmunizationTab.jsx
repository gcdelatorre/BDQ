import { useState, useEffect } from "react";
import { Syringe, CheckCircle, Clock, Plus, Info, NotePencil } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import clinicalService from "@/services/clinicalService";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const VACCINE_SCHEDULE = [
  { type: "BCG", doses: [1], label: "BCG Vaccine (Birth)" },
  { type: "HepB", doses: [1], label: "Hepatitis B (Birth)" },
  { type: "Pentavalent", doses: [1, 2, 3], label: "Penta (DPT-HepB-HIB)" },
  { type: "OPV", doses: [1, 2, 3], label: "Oral Polio Vaccine" },
  { type: "IPV", doses: [1, 2], label: "Inactivated Polio Vaccine" },
  { type: "PCV", doses: [1, 2, 3], label: "Pneumococcal Conjugate" },
  { type: "MMR", doses: [1, 2], label: "Measles, Mumps, Rubella" },
];

export default function ImmunizationTab({ childId }) {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchRecords();
  }, [childId]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await clinicalService.getChildImmunizationRecords(childId);
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch immunization records");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordDose = async () => {
    if (!selectedVaccine) return;
    
    try {
      setIsRecording(true);
      await clinicalService.recordChildImmunization({
        child_id: childId,
        vaccine_type: selectedVaccine.type,
        dose_number: selectedVaccine.dose,
        date_administered: recordDate,
        remarks: ""
      });
      
      toast.success("Record Saved", `${selectedVaccine.type} Dose ${selectedVaccine.dose} recorded.`);
      setSelectedVaccine(null);
      fetchRecords();
    } catch (error) {
      toast.error("Save Failed", error.message);
    } finally {
      setIsRecording(false);
    }
  };

  const getDoseRecord = (type, dose) => {
    return records.find(r => r.vaccine_type === type && r.dose_number === dose);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">EPI Vaccine Checklist</h3>
          <p className="text-slate-500 text-sm font-medium">Expanded Program on Immunization standard schedule</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
          <Info size={18} weight="duotone" className="text-blue-500" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Digital Records</span>
        </div>
      </div>

      {/* Vaccine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VACCINE_SCHEDULE.map((vac) => (
          <div key={vac.type} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                  <Syringe size={22} weight="duotone" />
                </div>
                <h4 className="font-bold text-slate-800">{vac.label}</h4>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {vac.doses.map((dose) => {
                const record = getDoseRecord(vac.type, dose);
                return (
                  <button
                    key={dose}
                    onClick={() => !record && setSelectedVaccine({ type: vac.type, dose })}
                    className={cn(
                      "flex-1 min-w-[100px] p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1",
                      record 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                        : "bg-slate-50 border-slate-100 text-slate-400 hover:border-teal-200 hover:bg-white hover:text-teal-600 group"
                    )}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">Dose {dose}</span>
                    {record ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle size={16} weight="fill" />
                        <span className="text-[10px] font-bold mt-1">{new Date(record.date_administered).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Plus size={16} weight="bold" className="group-hover:scale-125 transition-transform" />
                        <span className="text-[10px] font-bold mt-1">Record</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Record Modal (Overlay) */}
      <AnimatePresence>
        {selectedVaccine && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 space-y-6 border border-slate-100"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Syringe size={32} weight="duotone" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Record Vaccine Dose</h4>
                <p className="text-sm text-slate-500 font-medium">
                  {selectedVaccine.type} - Dose {selectedVaccine.dose}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date Administered</label>
                  <input 
                    type="date" 
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedVaccine(null)}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRecordDose}
                  disabled={isRecording}
                  className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-all text-sm disabled:opacity-50"
                >
                  {isRecording ? "Saving..." : "Save Record"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
