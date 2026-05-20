import { useState, useEffect } from "react";
import { Syringe, CheckCircle, Clock, Plus, Info, NotePencil, Trash } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import clinicalService from "@/services/clinicalService";
import patientService from "@/services/patientService";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const VACCINE_SCHEDULE = [
  {
    type: "BCG",
    label: "BCG Vaccine",
    description: "At Birth",
    schedule: [{ dose: 1, age_label: "At Birth", offset_days: 0 }]
  },
  {
    type: "HepB",
    label: "Hepatitis B",
    description: "At Birth",
    schedule: [{ dose: 1, age_label: "At Birth", offset_days: 0 }]
  },
  {
    type: "Pentavalent",
    label: "Pentavalent (DPT-HepB-HIB)",
    description: "Infant Series",
    schedule: [
      { dose: 1, age_label: "1½ mos", offset_days: 42 },
      { dose: 2, age_label: "2½ mos", offset_days: 70 },
      { dose: 3, age_label: "3½ mos", offset_days: 98 }
    ]
  },
  {
    type: "OPV",
    label: "Oral Polio Vaccine",
    description: "Infant Series",
    schedule: [
      { dose: 1, age_label: "1½ mos", offset_days: 42 },
      { dose: 2, age_label: "2½ mos", offset_days: 70 },
      { dose: 3, age_label: "3½ mos", offset_days: 98 }
    ]
  },
  {
    type: "IPV",
    label: "Inactivated Polio Vaccine",
    description: "IPV Schedule",
    schedule: [
      { dose: 1, age_label: "3½ mos", offset_days: 98 },
      { dose: 2, age_label: "9 mos", offset_days: 274 }
    ]
  },
  {
    type: "PCV",
    label: "Pneumococcal Conjugate",
    description: "Infant Series",
    schedule: [
      { dose: 1, age_label: "1½ mos", offset_days: 42 },
      { dose: 2, age_label: "2½ mos", offset_days: 70 },
      { dose: 3, age_label: "3½ mos", offset_days: 98 }
    ]
  },
  {
    type: "MMR",
    label: "Measles, Mumps, Rubella",
    description: "Toddler Series",
    schedule: [
      { dose: 1, age_label: "9 mos", offset_days: 274 },
      { dose: 2, age_label: "12 mos", offset_days: 365 }
    ]
  }
];

export default function ImmunizationTab({ childId }) {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [patientDob, setPatientDob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);

  // Edit/Undo States
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchRecords();
    fetchPatient();
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

  const fetchPatient = async () => {
    try {
      const patient = await patientService.getPatientById(childId);
      setPatientDob(patient.date_of_birth);
    } catch (error) {
      console.error("Failed to fetch child profile");
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

  const handleUpdateRecord = async () => {
    if (!selectedRecord) return;
    try {
      setIsRecording(true);
      await clinicalService.changeVaccineDose(selectedRecord.immunization_id, {
        date_administered: editDate,
        remarks: editRemarks
      });
      toast.success("Record Updated", "Vaccine dose details updated successfully.");
      setSelectedRecord(null);
      fetchRecords();
    } catch (error) {
      toast.error("Update Failed", error.message);
    } finally {
      setIsRecording(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!selectedRecord) return;
    try {
      setIsDeleting(true);
      await clinicalService.undoVaccineDose(selectedRecord.immunization_id);
      toast.success("Record Deleted", "Vaccine dose administration record undone.");
      setSelectedRecord(null);
      fetchRecords();
    } catch (error) {
      toast.error("Deletion Failed", error?.response?.data?.message || error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getDoseRecord = (type, dose) => {
    // Use == for dose_number because mysql2 may return it as string
    return records.find(r => r.vaccine_type === type && Number(r.dose_number) === Number(dose));
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const getDoseStatus = (type, dose, offsetDays) => {
    const record = getDoseRecord(type, dose);
    if (record) {
      return {
        label: `Recorded ${formatDate(record.date_administered)}`,
        status: "recorded"
      };
    }

    if (!patientDob) {
      return {
        label: "Pending",
        status: "pending"
      };
    }

    const dueDate = addDays(new Date(patientDob), offsetDays);
    dueDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      return {
        label: `Overdue by ${Math.abs(diff)}d`,
        status: "overdue",
        dueDate,
        diff
      };
    }
    if (diff === 0) {
      return {
        label: "Due Today",
        status: "today",
        dueDate,
        diff
      };
    }
    if (diff <= 7) {
      return {
        label: `Due in ${diff}d`,
        status: "upcoming",
        dueDate,
        diff
      };
    }
    return {
      label: `Due in ${diff}d`,
      status: "future",
      dueDate,
      diff
    };
  };

  const statusClass = (status) => {
    switch (status) {
      case "overdue": return "bg-rose-100 text-rose-700";
      case "today": return "bg-orange-100 text-orange-700";
      case "upcoming": return "bg-teal-100 text-teal-700";
      case "recorded": return "bg-emerald-100 text-emerald-700";
      default: return "bg-slate-100 text-slate-500";
    }
  };

  const statusLabel = (status, diff) => {
    if (status === "recorded") return "Recorded";
    if (status === "today") return "Due Today";
    if (status === "overdue") return "Overdue";
    if (status === "upcoming") return `Due in ${diff}d`;
    return `Due in ${diff}d`;
  };

  const nextAction = () => {
    const pending = [];

    VACCINE_SCHEDULE.forEach((vac) => {
      vac.schedule.forEach((scheduleItem) => {
        const record = getDoseRecord(vac.type, scheduleItem.dose);
        if (record) return;

        const status = getDoseStatus(vac.type, scheduleItem.dose, scheduleItem.offset_days);
        if (["overdue", "today", "upcoming"].includes(status.status)) {
          pending.push({
            vaccine_type: vac.type,
            label: vac.label,
            age_label: scheduleItem.age_label,
            dose: scheduleItem.dose,
            status: status.status,
            statusLabel: status.label,
            dueDate: status.dueDate,
            diff: status.diff
          });
        }
      });
    });

    pending.sort((a, b) => {
      const priority = { overdue: 0, today: 1, upcoming: 2 };
      if (priority[a.status] !== priority[b.status]) return priority[a.status] - priority[b.status];
      return a.diff - b.diff;
    });

    return pending[0] || null;
  };

  const nextDue = nextAction();

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">EPI Vaccine Checklist</h3>
          <p className="text-slate-500 text-sm">Standard immunization schedule with next due action</p>
        </div>
        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600">
          <Info size={16} weight="duotone" className="text-blue-500" />
          Digital Records
        </div>
      </div>

      {nextDue && (
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-bold">Next Action</p>
              <p className="mt-1 text-base font-bold text-slate-900">{nextDue.label} · Dose {nextDue.dose}</p>
              <p className="mt-1 text-sm text-slate-500">{nextDue.age_label} • {nextDue.statusLabel}</p>
            </div>
            <span className={cn(
              "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest",
              statusClass(nextDue.status)
            )}>
              {nextDue.status === "overdue" ? `Overdue ${Math.abs(nextDue.diff)}d` : nextDue.statusLabel}
            </span>
          </div>
        </div>
      )}

      {/* Vaccine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {VACCINE_SCHEDULE.map((vac) => (
          <div key={vac.type} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                <Syringe size={22} weight="duotone" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">{vac.label}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{vac.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {vac.schedule.map((scheduleItem) => {
                const record = getDoseRecord(vac.type, scheduleItem.dose);
                const status = getDoseStatus(vac.type, scheduleItem.dose, scheduleItem.offset_days);

                return (
                  <button
                    key={scheduleItem.dose}
                    onClick={() => {
                      if (record) {
                        setSelectedRecord(record);
                        setEditDate(new Date(record.date_administered).toISOString().split('T')[0]);
                        setEditRemarks(record.remarks || "");
                      } else {
                        setSelectedVaccine({ type: vac.type, dose: scheduleItem.dose });
                        setRecordDate(new Date().toISOString().split('T')[0]);
                      }
                    }}
                    className={cn(
                      "w-full p-3 rounded-2xl border transition-all text-left",
                      record
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-50/90 hover:border-emerald-300"
                        : "bg-slate-50 border-slate-100 text-slate-700 hover:border-teal-200 hover:bg-white"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-slate-500">Dose {scheduleItem.dose}</p>
                        <p className="text-sm font-semibold text-slate-900 mt-1">{scheduleItem.age_label}</p>
                      </div>
                      <span className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                        record ? "bg-emerald-100 text-emerald-700" : status.status === "overdue" ? "bg-rose-100 text-rose-700"
                          : status.status === "today" ? "bg-orange-100 text-orange-700"
                          : status.status === "upcoming" ? "bg-teal-100 text-teal-700"
                          : "bg-slate-100 text-slate-500"
                      )}>
                        {record ? "Recorded" : status.label}
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] text-slate-500">{record ? `Recorded ${formatDate(record.date_administered)}` : `Due ${formatDate(status.dueDate)}`}</p>
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
          <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
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

      {/* Manage Record Modal (Edit/Undo) */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 space-y-6 border border-slate-100"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <NotePencil size={32} weight="duotone" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Manage Record</h4>
                <p className="text-sm text-slate-500 font-medium">
                  {selectedRecord.vaccine_type} - Dose {selectedRecord.dose_number}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date Administered</label>
                  <input 
                    type="date" 
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Remarks (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Catch up session, side effects..."
                    value={editRemarks}
                    onChange={(e) => setEditRemarks(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedRecord(null)}
                    className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdateRecord}
                    disabled={isRecording}
                    className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-all text-sm disabled:opacity-50"
                  >
                    {isRecording ? "Saving..." : "Change Date"}
                  </button>
                </div>
                
                <button 
                  onClick={handleDeleteRecord}
                  disabled={isDeleting}
                  className="w-full py-3 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 hover:text-rose-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Trash size={16} weight="bold" />
                  {isDeleting ? "Undoing..." : "Undo/Delete Record"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
