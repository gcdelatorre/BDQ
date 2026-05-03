import { useState, useEffect } from "react";
import { UsersFour, NotePencil, Calendar, CheckCircle, Info, CloudArrowUp } from "@phosphor-icons/react";
import clinicalService from "@/services/clinicalService";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function MaternalImmunizationTab({ childId }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    tt2_td2_date: "",
    tt3_date: "",
    tt4_date: "",
    tt5_date: "",
    notes: ""
  });

  useEffect(() => {
    fetchRecord();
  }, [childId]);

  const fetchRecord = async () => {
    try {
      setLoading(true);
      const data = await clinicalService.getMaternalRecord(childId);
      if (data) {
        setFormData({
          tt2_td2_date: data.tt2_td2_date ? new Date(data.tt2_td2_date).toISOString().split('T')[0] : "",
          tt3_date: data.tt3_date ? new Date(data.tt3_date).toISOString().split('T')[0] : "",
          tt4_date: data.tt4_date ? new Date(data.tt4_date).toISOString().split('T')[0] : "",
          tt5_date: data.tt5_date ? new Date(data.tt5_date).toISOString().split('T')[0] : "",
          notes: data.notes || ""
        });
      }
    } catch (error) {
      console.error("Failed to fetch maternal record");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await clinicalService.saveMaternalRecord({
        child_id: childId,
        ...formData
      });
      toast.success("Profile Updated", "Maternal immunization record has been saved.");
    } catch (error) {
      toast.error("Save Failed", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
    </div>
  );

  const doseFields = [
    { id: "tt2_td2_date", label: "TT2 / TD2 Date" },
    { id: "tt3_date", label: "TT3 Date" },
    { id: "tt4_date", label: "TT4 Date" },
    { id: "tt5_date", label: "TT5 Date" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Maternal Tetanus Toxoid (TT) Record</h3>
          <p className="text-slate-500 text-sm font-medium">Tracking maternal protection doses for this pregnancy/child</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <form onSubmit={handleSave} className="p-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {doseFields.map((field) => (
              <div key={field.id} className="space-y-3 group">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                  {formData[field.id] && <CheckCircle size={16} weight="fill" className="text-teal-500" />}
                </div>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={18} />
                  <input 
                    type="date"
                    value={formData[field.id]}
                    onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-2xl transition-all outline-none text-sm border font-bold text-slate-700"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <NotePencil size={14} /> Notes & Remarks
            </label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-2xl transition-all outline-none text-sm border font-medium h-32 resize-none"
              placeholder="Record any pregnancy complications or specific clinical notes here..."
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-50">
            <button 
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <CloudArrowUp size={20} weight="bold" />
                  Update Maternal Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
        <Info size={24} weight="duotone" className="text-blue-500 shrink-0" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-blue-900">Clinical Protocol Notice</h4>
          <p className="text-xs text-blue-700 font-medium leading-relaxed">
            Ensure TT/TD doses are recorded accurately from the mother's health card (BHW Form 1). These dates are critical for monitoring neonatal tetanus protection levels.
          </p>
        </div>
      </div>
    </div>
  );
}
