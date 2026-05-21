import { useState, useEffect, useMemo } from "react";
import { ChartLineUp, Plus, Ruler, Scales, Info, NotePencil } from "@phosphor-icons/react";
import clinicalService from "@/services/clinicalService";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function NutritionalTab({ childId }) {
  const { toast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    assessment_period: "1-3 months",
    age_in_months_at_assessment: "",
    length_cm: "",
    length_date_taken: new Date().toISOString().split('T')[0],
    weight_kg: "",
    weight_date_taken: new Date().toISOString().split('T')[0],
    nutritional_status: "Normal",
    remarks: ""
  });

  useEffect(() => {
    fetchHistory();
  }, [childId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await clinicalService.getNutritionHistory(childId);
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch nutrition history");
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    "Normal": "text-emerald-700 bg-emerald-50 border-emerald-100",
    "Underweight": "text-amber-700 bg-amber-50 border-amber-100",
    "Stunted": "text-orange-700 bg-orange-50 border-orange-100",
    "Wasted": "text-rose-700 bg-rose-50 border-rose-100",
    "Obese": "text-purple-700 bg-purple-50 border-purple-100"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsRecording(true);
      await clinicalService.recordNutritionAssessment({
        child_id: childId,
        ...formData
      });
      
      toast.success("Assessment Recorded", "Growth data has been saved successfully.");
      setShowModal(false);
      fetchHistory();
      setFormData({
        assessment_period: "1-3 months",
        age_in_months_at_assessment: "",
        length_cm: "",
        length_date_taken: new Date().toISOString().split('T')[0],
        weight_kg: "",
        weight_date_taken: new Date().toISOString().split('T')[0],
        nutritional_status: "Normal",
        remarks: ""
      });
    } catch (error) {
      toast.error("Save Failed", error.message);
    } finally {
      setIsRecording(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this nutritional assessment?")) return;
    
    try {
      await clinicalService.deleteNutritionAssessment(recordId);
      toast.success("Record Deleted", "The growth assessment has been removed.");
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
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Nutritional Assessment</h3>
          <p className="text-slate-500 text-sm">Monitoring height and weight development milestones</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-all text-sm"
        >
          <Plus size={18} weight="bold" />
          NEW ASSESSMENT
        </button>
      </div>

      {/* History Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.length === 0 ? (
          <div className="col-span-full py-20 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
            <ChartLineUp size={48} weight="duotone" className="text-slate-200 mb-4" />
            <p className="text-slate-500 font-bold text-sm">No growth assessments recorded yet.</p>
          </div>
        ) : (
          history.map((record) => (
            <div key={record.assessment_id} className="relative group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-teal-100 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                    <ChartLineUp size={22} weight="duotone" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{record.assessment_period}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{record.age_in_months_at_assessment} Mo Old</p>
                  </div>
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                  statusColors[record.nutritional_status] || statusColors["Normal"]
                )}>
                  {record.nutritional_status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Scales size={14} weight="fill" className="text-blue-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Weight</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{record.weight_kg}<span className="text-[10px] ml-1 text-slate-400">kg</span></p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Ruler size={14} weight="fill" className="text-teal-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Height</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{record.length_cm}<span className="text-[10px] ml-1 text-slate-400">cm</span></p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                <span>Record Date</span>
                <span className="text-slate-600">{new Date(record.weight_date_taken).toLocaleDateString()}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(record.assessment_id);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                title="Undo Assessment"
              >
                <Plus size={14} weight="bold" className="rotate-45" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Record Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 space-y-6 border border-slate-100"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ChartLineUp size={32} weight="duotone" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">New Assessment</h4>
                <p className="text-sm text-slate-500 font-medium">Record height and weight data</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Period</label>
                  <select 
                    value={formData.assessment_period}
                    onChange={(e) => setFormData({...formData, assessment_period: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                  >
                    <option value="1-3 months">1-3 Months</option>
                    <option value="6-11 months">6-11 Months</option>
                    <option value="12 months">12 Months</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Weight (kg)</label>
                    <input 
                      required type="number" step="0.01"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                      placeholder="0.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Height (cm)</label>
                    <input 
                      required type="number" step="0.01"
                      value={formData.length_cm}
                      onChange={(e) => setFormData({...formData, length_cm: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Age (Mo)</label>
                    <input 
                      required type="number"
                      value={formData.age_in_months_at_assessment}
                      onChange={(e) => setFormData({...formData, age_in_months_at_assessment: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select 
                      value={formData.nutritional_status}
                      onChange={(e) => setFormData({...formData, nutritional_status: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Underweight">Underweight</option>
                      <option value="Stunted">Stunted</option>
                      <option value="Wasted">Wasted</option>
                      <option value="Obese">Obese</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
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
