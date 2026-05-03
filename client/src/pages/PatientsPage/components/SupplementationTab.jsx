import { useState, useEffect } from "react";
import { Pill, Plus, Calendar, Info, NotePencil, CheckCircle } from "@phosphor-icons/react";
import clinicalService from "@/services/clinicalService";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const SUPPLEMENTS = ["Vitamin A", "Iron", "MNP"];

export default function SupplementationTab({ childId }) {
  const { toast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    supplement_type: "Vitamin A",
    target_age_months: "",
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
      await clinicalService.recordSupplement({
        child_id: childId,
        ...formData
      });
      
      toast.success("Record Saved", `${formData.supplement_type} dose recorded successfully.`);
      setShowModal(false);
      fetchHistory();
      setFormData({
        supplement_type: "Vitamin A",
        target_age_months: "",
        date_given: new Date().toISOString().split('T')[0],
        remarks: ""
      });
    } catch (error) {
      toast.error("Save Failed", error.message);
    } finally {
      setIsRecording(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Supplementation Record</h3>
          <p className="text-slate-500 text-sm font-medium">Tracking Vit A, Iron, and Micronutrient Powder</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-all text-sm"
        >
          <Plus size={18} weight="bold" />
          RECORD DOSE
        </button>
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
            <Pill size={48} weight="duotone" className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-sm">No supplement records found.</p>
          </div>
        ) : (
          history.map((record) => (
            <div key={record.supplement_id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:border-teal-100 transition-colors group">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Pill size={24} weight="duotone" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Date Given</span>
                  <p className="text-sm font-bold text-slate-900">{new Date(record.date_given).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{record.supplement_type}</h4>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Target Age: {record.target_age_months} Months</p>
              </div>
              {record.remarks && (
                <div className="pt-3 border-t border-slate-50">
                  <p className="text-[11px] text-slate-500 leading-relaxed italic line-clamp-2">
                    "{record.remarks}"
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Record Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-8 bg-slate-50/50 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center shadow-md">
                    <Pill size={22} weight="bold" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">Record Dose</h4>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <Plus size={24} weight="bold" className="rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Supplement Type</label>
                  <select 
                    value={formData.supplement_type}
                    onChange={(e) => setFormData({...formData, supplement_type: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                  >
                    {SUPPLEMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Age (Mo)</label>
                    <input 
                      required type="number"
                      value={formData.target_age_months}
                      onChange={(e) => setFormData({...formData, target_age_months: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                      placeholder="e.g. 6"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date Given</label>
                    <input 
                      required type="date"
                      value={formData.date_given}
                      onChange={(e) => setFormData({...formData, date_given: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Remarks</label>
                  <textarea 
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium h-24 resize-none"
                    placeholder="Dose details or observations..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isRecording}
                    className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-all text-sm disabled:opacity-50"
                  >
                    {isRecording ? "Saving..." : "Save Record"}
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
