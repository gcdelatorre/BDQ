import { useState, useEffect } from "react";
import { Pill, Plus, Info, NotePencil, Trash } from "@phosphor-icons/react";
import clinicalService from "@/services/clinicalService";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const SUPPLEMENTS = ["Vitamin A", "Iron", "MNP"];
const AGE_CHECKPOINTS = [
  { label: "6 Months", value: "6" },
  { label: "9 Months", value: "9" },
  { label: "12 Months", value: "12" },
  { label: "18 Months", value: "18" },
  { label: "24 Months", value: "24" },
  { label: "Other", value: "other" }
];

export default function SupplementationTab({ childId }) {
  const { toast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Modals States
  const [selectedRecord, setSelectedRecord] = useState(null); // For Managing Existing
  
  const [formData, setFormData] = useState({
    supplement_type: "Vitamin A",
    target_age_months: "6",
    date_given: new Date().toISOString().split('T')[0],
    remarks: ""
  });

  useEffect(() => {
    fetchHistory();
  }, [childId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await clinicalService.getSupplementHistory(childId);
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch supplement history");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsRecording(true);
      if (selectedRecord) {
        await clinicalService.updateSupplementRecord(selectedRecord.supplement_id, formData);
        toast.success("Record Updated", "Supplement record has been modified.");
      } else {
        await clinicalService.recordSupplement({
          child_id: childId,
          ...formData
        });
        toast.success("Record Saved", `${formData.supplement_type} dose recorded successfully.`);
      }
      setShowModal(false);
      setSelectedRecord(null);
      fetchHistory();
      setFormData({
        supplement_type: "Vitamin A",
        target_age_months: "6",
        date_given: new Date().toISOString().split('T')[0],
        remarks: ""
      });
    } catch (error) {
      toast.error("Save Failed", error.message);
    } finally {
      setIsRecording(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this supplement record?")) return;
    
    try {
      await clinicalService.deleteSupplementRecord(recordId);
      toast.success("Record Deleted", "The supplement record has been removed.");
      fetchHistory();
    } catch (error) {
      toast.error("Deletion Failed", error.message);
    }
  };

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
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Supplementation Record</h3>
          <p className="text-slate-500 text-sm">Tracking Vit A, Iron, and Micronutrient Powder</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600">
            <Info size={16} weight="duotone" className="text-blue-500" />
            Digital Records
          </div>
          <button 
            onClick={() => {
              setSelectedRecord(null);
              setFormData({
                supplement_type: "Vitamin A",
                target_age_months: "6",
                date_given: new Date().toISOString().split('T')[0],
                remarks: ""
              });
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-all text-sm"
          >
            <Plus size={18} weight="bold" />
            RECORD DOSE
          </button>
        </div>
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.length === 0 ? (
          <div className="col-span-full py-20 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
            <Pill size={48} weight="duotone" className="text-slate-200 mb-4" />
            <p className="text-slate-500 font-bold text-sm">No supplement records found.</p>
          </div>
        ) : (
          history.map((record) => (
            <div key={record.supplement_id} className="relative group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-teal-100 transition-all">
              <div 
                className="cursor-pointer"
                onClick={() => {
                  setSelectedRecord(record);
                  setFormData({
                    supplement_type: record.supplement_type,
                    target_age_months: String(record.target_age_months),
                    date_given: new Date(record.date_given).toISOString().split('T')[0],
                    remarks: record.remarks || ""
                  });
                  setShowModal(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                      <Pill size={22} weight="duotone" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{record.supplement_type}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{record.target_age_months} Mo Target</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Date Given</span>
                    <p className="text-[11px] font-bold text-slate-700">{new Date(record.date_given).toLocaleDateString()}</p>
                  </div>
                </div>

                {record.remarks ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                    <div className="flex items-start gap-2">
                      <NotePencil size={14} className="text-slate-300 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic line-clamp-2">"{record.remarks}"</p>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest">No Remarks</p>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(record.supplement_id);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                title="Undo Record"
              >
                <Trash size={14} weight="bold" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Record Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 space-y-6 border border-slate-100"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Pill size={32} weight="duotone" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">{selectedRecord ? "Modify Dose" : "Record Dose"}</h4>
                <p className="text-sm text-slate-500 font-medium">Record supplement administration</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Supplement Type</label>
                  <select 
                    value={formData.supplement_type}
                    onChange={(e) => setFormData({...formData, supplement_type: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                  >
                    {SUPPLEMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Age (Mo)</label>
                    <select 
                      required
                      value={formData.target_age_months}
                      onChange={(e) => setFormData({...formData, target_age_months: e.target.value})}
                      className="w-full px-4 py-3 bg-teal-50 border border-teal-100 focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm font-bold text-slate-700"
                    >
                      {AGE_CHECKPOINTS.map(age => <option key={age.value} value={age.value}>{age.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date Given</label>
                    <input 
                      required type="date"
                      value={formData.date_given}
                      onChange={(e) => setFormData({...formData, date_given: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                    />
                  </div>
                </div>

                {formData.target_age_months === "other" && (
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Custom Age (months)</label>
                    <input 
                      required type="number"
                      value={formData.target_age_months === "other" ? "" : formData.target_age_months}
                      onChange={(e) => setFormData({...formData, target_age_months: e.target.value})}
                      className="w-full px-4 py-3 bg-white border focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border-teal-200 font-bold text-slate-700"
                      placeholder="Enter age in months"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Remarks</label>
                  <textarea 
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium h-24 resize-none"
                    placeholder="Dose observations..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedRecord(null);
                    }}
                    className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isRecording}
                    className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-all text-sm disabled:opacity-50"
                  >
                    {isRecording ? "Saving..." : (selectedRecord ? "Apply Changes" : "Save Record")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
