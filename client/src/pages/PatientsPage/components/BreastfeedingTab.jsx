import { useState, useEffect } from "react";
import { Baby, Plus, Calendar, Info, NotePencil, CheckCircle, XCircle } from "@phosphor-icons/react";
import clinicalService from "@/services/clinicalService";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function BreastfeedingTab({ childId }) {
  const { toast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    age_month_target: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsRecording(true);
      await clinicalService.recordBreastfeeding({
        child_id: childId,
        ...formData
      });
      
      toast.success("Checkpoint Saved", `Breastfeeding status for ${formData.age_month_target} months recorded.`);
      setShowModal(false);
      fetchHistory();
      setFormData({
        age_month_target: "",
        is_exclusively_breastfed: "Yes",
        check_date: new Date().toISOString().split('T')[0],
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
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Breastfeeding Checkpoints</h3>
          <p className="text-slate-500 text-sm font-medium">Monitoring exclusive breastfeeding milestones</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-all text-sm"
        >
          <Plus size={18} weight="bold" />
          NEW CHECKPOINT
        </button>
      </div>

      {/* History Timeline */}
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
            <Baby size={48} weight="duotone" className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-sm">No breastfeeding checkpoints recorded.</p>
          </div>
        ) : (
          history.map((record) => (
            <div key={record.checkpoint_id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-teal-100 transition-colors">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border transition-all",
                record.is_exclusively_breastfed === 'Yes' 
                  ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                  : "bg-slate-50 border-slate-100 text-slate-400"
              )}>
                <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Month</span>
                <span className="text-xl font-black leading-none">{record.age_month_target}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-900">Exclusively Breastfed:</h4>
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                    record.is_exclusively_breastfed === 'Yes' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  )}>
                    {record.is_exclusively_breastfed}
                  </span>
                </div>
                {record.remarks ? (
                  <p className="text-xs text-slate-500 font-medium leading-relaxed italic line-clamp-1">"{record.remarks}"</p>
                ) : (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No remarks added</p>
                )}
              </div>

              <div className="hidden md:block text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Check Date</p>
                <p className="text-xs font-bold text-slate-700">{new Date(record.check_date).toLocaleDateString()}</p>
              </div>
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
                    <Baby size={22} weight="bold" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">Breastfeeding Check</h4>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <Plus size={24} weight="bold" className="rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Age (Mo)</label>
                    <input 
                      required type="number"
                      value={formData.age_month_target}
                      onChange={(e) => setFormData({...formData, age_month_target: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                      placeholder="e.g. 6"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Exclusively Breastfed?</label>
                    <select 
                      value={formData.is_exclusively_breastfed}
                      onChange={(e) => setFormData({...formData, is_exclusively_breastfed: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Check Date</label>
                  <input 
                    required type="date"
                    value={formData.check_date}
                    onChange={(e) => setFormData({...formData, check_date: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Remarks</label>
                  <textarea 
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium h-24 resize-none"
                    placeholder="Observations or notes..."
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
                    {isRecording ? "Saving..." : "Save Checkpoint"}
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
