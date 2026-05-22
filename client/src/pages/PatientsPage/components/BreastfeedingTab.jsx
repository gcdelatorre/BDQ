import { useState, useEffect, useMemo } from "react";
import { Baby, Plus, Info, Clock, Check, ListChecks, NotePencil, Trash } from "@phosphor-icons/react";
import clinicalService from "@/services/clinicalService";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const MILESTONES = [
  { 
    id: "birth", 
    label: "At Birth", 
    target: "0", 
    requirement: "Initiated breastfeeding immediately (within 90 mins)",
    shortLabel: "Initiation",
    phase: "Newborn Phase"
  },
  { 
    id: "1.5", 
    label: "1½ Months", 
    target: "1", // Mapped to 1 for backend compatibility
    requirement: "Exclusive Breastfeeding Checkpoint",
    shortLabel: "EBF Check",
    phase: "1-3 Months Phase"
  },
  {
    id: "2.5", 
    label: "2½ Months", 
    target: "2", // Mapped to 2 for backend compatibility
    requirement: "Exclusive Breastfeeding Checkpoint",
    shortLabel: "EBF Check",
    phase: "1-3 Months Phase"
  },
  { 
    id: "3.5", 
    label: "3½ Months", 
    target: "3", // Mapped to 3 for backend compatibility
    requirement: "Exclusive Breastfeeding Checkpoint",
    shortLabel: "EBF Check",
    phase: "1-3 Months Phase"
  },
  { 
    id: "6", 
    label: "6 Months", 
    target: "6", 
    requirement: "Final Exclusive Breastfeeding Checkpoint",
    shortLabel: "Final EBF",
    phase: "6 Months Phase"
  }
];

export default function BreastfeedingTab({ childId }) {
  const { toast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Modals States
  const [selectedMilestone, setSelectedMilestone] = useState(null); // For New Record
  const [selectedRecord, setSelectedRecord] = useState(null); // For Managing Existing
  
  const [formData, setFormData] = useState({
    is_exclusively_breastfed: "Yes",
    check_date: new Date().toISOString().split('T')[0],
    remarks: ""
  });

  useEffect(() => {
    fetchHistory();
  }, [childId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await clinicalService.getBreastfeedingHistory(childId);
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch breastfeeding history");
    } finally {
      setLoading(false);
    }
  };

  const milestonesWithStatus = useMemo(() => {
    return MILESTONES.map(m => {
      const record = history.find(h => {
        const hTarget = parseFloat(h.age_month_target);
        const mTarget = parseFloat(m.target);
        if (m.id === "1.5") return hTarget === 1.5 || hTarget === 1;
        if (m.id === "2.5") return hTarget === 2.5 || hTarget === 2;
        if (m.id === "3.5") return hTarget === 3.5 || hTarget === 3;
        return hTarget === mTarget;
      });
      return { ...m, record };
    });
  }, [history]);

  const handleRecordStatus = async () => {
    if (!selectedMilestone) return;
    try {
      setIsRecording(true);
      const payload = {
        child_id: childId,
        age_month_target: String(selectedMilestone.target),
        ...formData
      };
      await clinicalService.recordBreastfeeding(payload);
      toast.success("Checkpoint Saved", `Status for ${selectedMilestone.label} recorded.`);
      setSelectedMilestone(null);
      fetchHistory();
    } catch (error) {
      toast.error("Save Failed", "Verify your network connection or server status.");
    } finally {
      setIsRecording(false);
    }
  };

  const handleUpdateRecord = async () => {
    if (!selectedRecord) return;
    try {
      setIsRecording(true);
      const payload = {
        is_exclusively_breastfed: formData.is_exclusively_breastfed,
        check_date: formData.check_date,
        remarks: formData.remarks
      };
      await clinicalService.updateBreastfeedingRecord(selectedRecord.checkpoint_id, payload);
      toast.success("Record Updated", "Checkpoint details updated successfully.");
      setSelectedRecord(null);
      fetchHistory();
    } catch (error) {
      toast.error("Update Failed", "Verify the server connection.");
    } finally {
      setIsRecording(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!selectedRecord) return;
    try {
      setIsDeleting(true);
      await clinicalService.deleteBreastfeedingRecord(selectedRecord.checkpoint_id);
      toast.success("Record Deleted", "Checkpoint record has been removed.");
      setSelectedRecord(null);
      fetchHistory();
    } catch (error) {
      toast.error("Deletion Failed", error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Breastfeeding Checkpoints</h3>
          <p className="text-slate-500 text-sm">Monitoring essential milestones from birth to 6 months</p>
        </div>
        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600">
          <Info size={16} weight="duotone" className="text-blue-500" />
          Clinical Records
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {milestonesWithStatus.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              if (m.record) {
                setSelectedRecord(m.record);
                setFormData({
                  is_exclusively_breastfed: m.record.is_exclusively_breastfed,
                  check_date: new Date(m.record.check_date).toISOString().split('T')[0],
                  remarks: m.record.remarks || ""
                });
              } else {
                setSelectedMilestone(m);
                setFormData({
                  is_exclusively_breastfed: "Yes",
                  check_date: new Date().toISOString().split('T')[0],
                  remarks: ""
                });
              }
            }}
            className={cn(
              "w-full p-4 rounded-2xl border transition-all text-left group",
              m.record 
                ? "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-50/90 hover:border-emerald-300" 
                : "bg-slate-50 border-slate-100 text-slate-700 hover:border-teal-200 hover:bg-white"
            )}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                m.record ? "bg-white text-emerald-600 shadow-sm" : "bg-white text-slate-400 border border-slate-100"
              )}>
                {m.id === 'birth' ? <Clock size={20} weight="duotone" /> : <Baby size={20} weight="duotone" />}
              </div>
              <span className={cn(
                "rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider",
                m.record ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
              )}>
                {m.record ? "Recorded" : "Pending"}
              </span>
            </div>

            <div className="mb-4">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">{m.phase}</span>
              <h4 className="text-[15px] font-bold text-slate-900 leading-tight mb-1.5">{m.label}</h4>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                {m.requirement}
              </p>
            </div>

            {m.record && (
              <div className="mt-auto pt-4 border-t border-emerald-100/50 flex items-center justify-between text-[10px] font-bold">
                <div className="flex flex-col">
                  <span className="text-slate-400 uppercase tracking-widest mb-0.5 text-[8px]">EBF Status</span>
                  <span className={m.record.is_exclusively_breastfed === 'Yes' ? "text-emerald-700 font-black" : "text-amber-600 font-black"}>
                    {m.record.is_exclusively_breastfed === 'Yes' ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 uppercase tracking-widest mb-0.5 text-[8px]">Date</span>
                  <p className="text-slate-700">{new Date(m.record.check_date).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedMilestone && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 space-y-6 border border-slate-100"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Baby size={32} weight="duotone" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">{selectedMilestone.label}</h4>
                <p className="text-sm text-slate-500 font-medium">Record breastfeeding checkpoint status</p>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Requirement</p>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed">{selectedMilestone.requirement}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Check Date</label>
                    <input 
                      type="date"
                      value={formData.check_date}
                      onChange={(e) => setFormData({...formData, check_date: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Compliant?</label>
                    <select 
                      value={formData.is_exclusively_breastfed}
                      onChange={(e) => setFormData({...formData, is_exclusively_breastfed: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Remarks</label>
                  <textarea 
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium h-24 resize-none"
                    placeholder="Observations..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedMilestone(null)}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRecordStatus}
                  disabled={isRecording}
                  className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-all text-sm disabled:opacity-50"
                >
                  {isRecording ? "Saving..." : "Save Status"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
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
                  {MILESTONES.find(m => String(m.target) === String(selectedRecord.age_month_target))?.label} Checkpoint
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Check Date</label>
                    <input 
                      type="date" 
                      value={formData.check_date}
                      onChange={(e) => setFormData({...formData, check_date: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Compliant?</label>
                    <select 
                      value={formData.is_exclusively_breastfed}
                      onChange={(e) => setFormData({...formData, is_exclusively_breastfed: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Remarks</label>
                  <textarea 
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium h-24 resize-none"
                    placeholder="Observations..."
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
                    {isRecording ? "Saving..." : "Change Details"}
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
