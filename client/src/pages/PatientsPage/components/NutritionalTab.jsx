import { useState, useEffect } from "react";
import { ChartLineUp, Plus, Ruler, Scales, Calendar, Info, NotePencil, Warning } from "@phosphor-icons/react";
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
      // Reset form
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
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Nutritional Assessment</h3>
          <p className="text-slate-500 text-sm font-medium">Monitoring height and weight development</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-all text-sm"
        >
          <Plus size={18} weight="bold" />
          NEW ASSESSMENT
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {history.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50">
            <ChartLineUp size={48} weight="duotone" className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-sm">No growth assessments recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Period</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Age</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weight (kg)</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Height (cm)</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map((record) => (
                  <tr key={record.assessment_id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm uppercase">{record.assessment_period}</td>
                    <td className="px-6 py-4 font-bold text-slate-700 text-sm">{record.age_in_months_at_assessment} Mo</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Scales size={16} weight="duotone" className="text-blue-500" />
                        <span className="font-bold text-slate-900 text-sm">{record.weight_kg} kg</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Ruler size={16} weight="duotone" className="text-teal-500" />
                        <span className="font-bold text-slate-900 text-sm">{record.length_cm} cm</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                        record.nutritional_status === 'Normal' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                      )}>
                        {record.nutritional_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-bold text-[11px]">
                      {new Date(record.weight_date_taken).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center shadow-md">
                    <ChartLineUp size={22} weight="bold" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">New Growth Assessment</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Recording height and weight</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <Plus size={24} weight="bold" className="rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assessment Period</label>
                    <select 
                      value={formData.assessment_period}
                      onChange={(e) => setFormData({...formData, assessment_period: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                    >
                      <option value="1-3 months">1-3 Months</option>
                      <option value="6-11 months">6-11 Months</option>
                      <option value="12 months">12 Months</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Age in Months</label>
                    <input 
                      required type="number"
                      value={formData.age_in_months_at_assessment}
                      onChange={(e) => setFormData({...formData, age_in_months_at_assessment: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium"
                      placeholder="e.g. 6"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Weight (kg)</label>
                    <div className="relative">
                      <Scales className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        required type="number" step="0.01"
                        value={formData.weight_kg}
                        onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium"
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Height/Length (cm)</label>
                    <div className="relative">
                      <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        required type="number" step="0.01"
                        value={formData.length_cm}
                        onChange={(e) => setFormData({...formData, length_cm: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium"
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nutritional Status</label>
                  <select 
                    value={formData.nutritional_status}
                    onChange={(e) => setFormData({...formData, nutritional_status: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Underweight">Underweight</option>
                    <option value="Stunted">Stunted</option>
                    <option value="Wasted">Wasted</option>
                    <option value="Obese">Obese</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <NotePencil size={14} /> Remarks
                  </label>
                  <textarea 
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium h-24 resize-none"
                    placeholder="Health observations..."
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
                    {isRecording ? "Saving..." : "Save Assessment"}
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
