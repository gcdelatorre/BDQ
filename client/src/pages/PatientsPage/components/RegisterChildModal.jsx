import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Baby, House, IdentificationCard, Ruler, Scales, NotePencil } from "@phosphor-icons/react";
import { useToast } from "@/hooks/useToast";
import patientService from "@/services/patientService";

export default function RegisterChildModal({ isOpen, onClose, onRefresh }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    family_serial_number: "",
    first_name: "",
    middle_initial: "",
    last_name: "",
    sex: "M",
    date_of_birth: "",
    date_of_registration: new Date().toISOString().split('T')[0],
    mother_complete_name: "",
    contact_number: "",
    complete_address: "",
    se_status: "Non-NHTS",
    length_at_birth_cm: "",
    weight_at_birth_kg: "",
    birth_weight_status: "Normal",
    remarks: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const requiredFields = [
      'first_name', 'last_name', 
      'date_of_birth', 'mother_complete_name', 'complete_address',
      'length_at_birth_cm', 'weight_at_birth_kg'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error("Validation Error", `${field.replace(/_/g, ' ')} is required.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await patientService.registerChild(formData);
      toast.success("Registration Successful", `${formData.first_name} has been added.`);
      onRefresh();
      onClose();
      setFormData({
        family_serial_number: "",
        first_name: "",
        middle_initial: "",
        last_name: "",
        sex: "M",
        date_of_birth: "",
        date_of_registration: new Date().toISOString().split('T')[0],
        mother_complete_name: "",
        contact_number: "",
        complete_address: "",
        se_status: "Non-NHTS",
        length_at_birth_cm: "",
        weight_at_birth_kg: "",
        birth_weight_status: "Normal",
        remarks: ""
      });
    } catch (error) {
      toast.error("Registration Failed", error.response?.data?.message || "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-xl flex flex-col border border-slate-100"
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <UserPlus size={22} weight="bold" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Register New Child</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pediatric Intake Form</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900">
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Form Body */}
        <form id="child-reg-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-teal-600 border-b border-teal-50 pb-2">
              <IdentificationCard size={20} weight="duotone" />
              <h3 className="font-bold text-xs uppercase tracking-widest">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Family Serial No.</label>
                <input name="family_serial_number" value={formData.family_serial_number} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium" placeholder="Leave blank to auto-generate new FSN" />
                <p className="text-[10px] text-slate-500">Use the same FSN for siblings in one family. New families will get a generated code like 0501724029-00001.</p>
              </div>
              <div className="md:col-span-1 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Registration Date</label>
                <input required type="date" name="date_of_registration" value={formData.date_of_registration} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium" />
              </div>
              <div className="md:col-span-1 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">SE Status</label>
                <select name="se_status" value={formData.se_status} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold text-slate-700">
                  <option value="Non-NHTS">Non-NHTS</option>
                  <option value="NHTS">NHTS (Pantawid)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <input required name="first_name" value={formData.first_name} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium" placeholder="First name" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-center block">M.I.</label>
                <input name="middle_initial" value={formData.middle_initial} onChange={handleChange} maxLength={1} className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border text-center uppercase font-bold" placeholder="A" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                <input required name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium" placeholder="Last name" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sex</label>
                <div className="flex gap-4">
                  {['M', 'F'].map((s) => (
                    <button key={s} type="button" onClick={() => setFormData(p => ({ ...p, sex: s }))} className={cn(
                      "flex-1 py-3 rounded-xl font-bold transition-all border text-sm",
                      formData.sex === s ? "bg-teal-600 text-white border-teal-600 shadow-sm" : "bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100"
                    )}>
                      {s === 'M' ? "Male" : "Female"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                <input required type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-teal-600 border-b border-teal-50 pb-2">
              <House size={20} weight="duotone" />
              <h3 className="font-bold text-xs uppercase tracking-widest">Home & Family</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mother's Full Name</label>
                <input required name="mother_complete_name" value={formData.mother_complete_name} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium" placeholder="Full name of mother" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                <input name="contact_number" value={formData.contact_number} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium" placeholder="e.g. 09123456789" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Complete Address</label>
                <input required name="complete_address" value={formData.complete_address} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium" placeholder="Purok / Zone / Barangay" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-teal-600 border-b border-teal-50 pb-2">
              <Baby size={20} weight="duotone" />
              <h3 className="font-bold text-xs uppercase tracking-widest">Birth Statistics</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Length (cm)</label>
                <div className="relative">
                  <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required type="number" step="0.01" name="length_at_birth_cm" value={formData.length_at_birth_cm} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium" placeholder="0.0" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Weight (kg)</label>
                <div className="relative">
                  <Scales className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required type="number" step="0.01" name="weight_at_birth_kg" value={formData.weight_at_birth_kg} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium" placeholder="0.0" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Weight Status</label>
                <select name="birth_weight_status" value={formData.birth_weight_status} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-bold">
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <NotePencil size={14} /> Initial Remarks
              </label>
              <textarea name="remarks" value={formData.remarks} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium resize-none h-24" placeholder="Clinical observations..." />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button onClick={onClose} type="button" className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-900 transition-colors text-sm">
            Cancel
          </button>
          <button 
            type="submit" 
            form="child-reg-form"
            disabled={isSubmitting} 
            className="flex items-center gap-2 px-8 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-70 disabled:translate-y-0 text-sm"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : "Register Patient"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
