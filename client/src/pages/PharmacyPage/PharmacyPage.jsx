import { useState, useEffect } from "react";
import { 
  UsersThree, 
  Pill, 
  Plus, 
  Trash, 
  MagnifyingGlass, 
  ClipboardText, 
  Calendar,
  CheckCircle,
  PlusCircle,
  Package,
  Info,
  ClockCounterClockwise,
  Funnel
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import pharmacyService from "@/services/pharmacyService";
import patientService from "@/services/patientService";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

export default function PharmacyPage() {
  const { toast } = useToast();
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchPatient, setSearchPatient] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const [basket, setBasket] = useState([]);
  const [notes, setNotes] = useState("");
  const [isDispensing, setIsDispensing] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [patientsData, medsData, historyData] = await Promise.all([
        patientService.getAllPatients(),
        pharmacyService.getAllMedicines(),
        pharmacyService.getDispensingHistory()
      ]);
      setPatients(patientsData);
      setMedicines(medsData);
      setHistory(historyData);
    } catch (error) {
      toast.error("Error", "Failed to load pharmacy data.");
    } finally {
      setLoading(false);
    }
  };

  const addToBasket = (med) => {
    if (basket.find(item => item.medicine_id === med.medicine_id)) {
      toast.error("Duplicate", "Medicine already in basket.");
      return;
    }
    setBasket([...basket, {
      ...med,
      quantity_dispensed: 1,
      dosage_instruction: "Take 1 unit",
      duration_days: 1,
      remarks: ""
    }]);
  };

  const removeFromBasket = (medId) => {
    setBasket(basket.filter(item => item.medicine_id !== medId));
  };

  const updateBasketItem = (medId, field, value) => {
    setBasket(basket.map(item => 
      item.medicine_id === medId ? { ...item, [field]: value } : item
    ));
  };

  const handleDispense = async () => {
    if (!selectedPatient) {
      toast.error("Missing Patient", "Please select a patient first.");
      return;
    }
    if (basket.length === 0) {
      toast.error("Empty Basket", "Please add at least one medicine.");
      return;
    }

    try {
      setIsDispensing(true);
      await pharmacyService.dispenseMedicine({
        child_id: selectedPatient.child_id,
        notes,
        medicines: basket.map(item => ({
          medicine_id: item.medicine_id,
          quantity_dispensed: parseInt(item.quantity_dispensed),
          dosage_instruction: item.dosage_instruction,
          duration_days: parseInt(item.duration_days),
          remarks: item.remarks
        }))
      });

      toast.success("Dispensed Successfully", `Medicine given to ${selectedPatient.first_name}.`);
      
      setSelectedPatient(null);
      setBasket([]);
      setNotes("");
      fetchInitialData();
    } catch (error) {
      toast.error("Transaction Failed", error.message);
    } finally {
      setIsDispensing(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchPatient.toLowerCase()) ||
    p.family_serial_number?.toLowerCase().includes(searchPatient.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Standard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pharmacy Dispensing</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Dispense medication and manage dispensing records.</p>
        </div>
      </div>

      {/* Standard Search Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search patient by name or FSN..."
            value={searchPatient}
            onChange={(e) => setSearchPatient(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-200 rounded-xl transition-all outline-none text-sm font-medium text-slate-900 border"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-xl font-bold border border-slate-100 hover:bg-slate-50 transition-all text-[11px] tracking-wider uppercase">
          <Funnel size={18} weight="bold" />
          Quick Filters
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Patient Selection Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
            <h3 className="flex items-center gap-2 font-bold text-slate-400 text-[11px] uppercase tracking-widest">
              <UsersThree size={18} weight="duotone" className="text-teal-600" />
              1. Recipient Selection
            </h3>
            
            {!selectedPatient ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredPatients.length === 0 ? (
                  <div className="col-span-2 text-center py-10">
                    <p className="text-slate-400 text-sm font-bold">No patients found.</p>
                  </div>
                ) : (
                  filteredPatients.map(p => (
                    <button
                      key={p.child_id}
                      onClick={() => setSelectedPatient(p)}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 hover:border-teal-200 hover:bg-teal-50/30 transition-all text-left group"
                    >
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-teal-600 transition-all shadow-sm">
                        <UsersThree size={20} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-slate-900 leading-tight">{p.first_name} {p.last_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">FSN: {p.family_serial_number}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-6 bg-teal-50/50 border border-teal-100 rounded-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
                    <UsersThree size={28} weight="duotone" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">{selectedPatient.first_name} {selectedPatient.last_name}</h4>
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mt-0.5 px-2 py-0.5 bg-teal-100 rounded-lg inline-block">Selected Patient • ID: {selectedPatient.child_id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-2 bg-white text-slate-400 font-bold hover:text-red-600 hover:border-red-100 border border-slate-100 rounded-xl transition-all text-[11px] uppercase tracking-widest shadow-sm"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Medicine Selection Grid */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold text-slate-400 text-[11px] uppercase tracking-widest">
                <Pill size={18} weight="duotone" className="text-teal-600" />
                2. Available Medication
              </h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">{medicines.length} Types</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medicines.map(med => {
                const inBasket = basket.some(item => item.medicine_id === med.medicine_id);
                const isOutOfStock = (Number(med.total_stock) || 0) <= 0;
                return (
                  <button
                    key={med.medicine_id}
                    disabled={isOutOfStock}
                    onClick={() => !inBasket && addToBasket(med)}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl border transition-all text-left group",
                      inBasket ? "bg-emerald-50/50 border-emerald-100 opacity-60" : "bg-white border-slate-100 hover:border-teal-200 hover:shadow-md",
                      isOutOfStock && "opacity-50 grayscale cursor-not-allowed bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm border",
                        inBasket ? "bg-emerald-100 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 group-hover:border-teal-100"
                      )}>
                        <Pill size={24} weight="duotone" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-slate-900 leading-tight group-hover:text-teal-700 transition-colors">{med.medicine_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Stock: <span className={cn(isOutOfStock ? "text-red-500" : "text-slate-600")}>{med.total_stock || 0}</span> {med.unit_of_measure}
                        </p>
                      </div>
                    </div>
                    {inBasket ? (
                      <CheckCircle size={22} weight="fill" className="text-emerald-500" />
                    ) : (
                      <PlusCircle size={22} weight="bold" className="text-slate-200 group-hover:text-teal-500 group-hover:scale-110 transition-all" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          <div className="bg-slate-900 rounded-2xl shadow-2xl p-8 space-y-8 text-white relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-teal-500 text-white rounded-xl flex items-center justify-center shadow-lg border border-teal-400/50">
                <ClipboardText size={20} weight="bold" />
              </div>
              <div>
                <h4 className="text-xl font-bold tracking-tight">Dispensing Basket</h4>
                <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">Medication Summary</p>
              </div>
            </div>

            <div className="space-y-5 relative z-10 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar-light">
              {basket.length === 0 ? (
                <div className="text-center py-12 opacity-30 bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <Package size={48} weight="duotone" className="mx-auto mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No items selected</p>
                </div>
              ) : (
                basket.map((item) => (
                  <div key={item.medicine_id} className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4 hover:border-white/20 transition-colors">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <p className="font-bold text-[14px] text-teal-400">{item.medicine_name}</p>
                      <button onClick={() => removeFromBasket(item.medicine_id)} className="text-white/20 hover:text-red-400 transition-all hover:scale-110">
                        <Trash size={18} weight="bold" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">Quantity</label>
                        <input 
                          type="number"
                          value={item.quantity_dispensed}
                          onChange={(e) => updateBasketItem(item.medicine_id, 'quantity_dispensed', e.target.value)}
                          className="w-full bg-white/10 border-transparent rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all text-white border border-white/5"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">Duration (Days)</label>
                        <input 
                          type="number"
                          value={item.duration_days}
                          onChange={(e) => updateBasketItem(item.medicine_id, 'duration_days', e.target.value)}
                          className="w-full bg-white/10 border-transparent rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all text-white border border-white/5"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">Instructions</label>
                      <input 
                        type="text"
                        value={item.dosage_instruction}
                        onChange={(e) => updateBasketItem(item.medicine_id, 'dosage_instruction', e.target.value)}
                        className="w-full bg-white/10 border-transparent rounded-xl px-4 py-3 text-[11px] font-medium outline-none focus:ring-2 focus:ring-teal-500 transition-all text-white border border-white/5"
                        placeholder="e.g. 1 tab after meals"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-5 relative z-10 pt-4 border-t border-white/10">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">Clinical Notes</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-medium outline-none focus:ring-2 focus:ring-teal-500 transition-all h-24 resize-none text-white placeholder:text-white/20"
                  placeholder="Additional dispensing notes..."
                />
              </div>

              <button 
                onClick={handleDispense}
                disabled={isDispensing || basket.length === 0}
                className="w-full py-4 bg-teal-500 text-white rounded-2xl font-black shadow-xl hover:bg-teal-400 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:grayscale flex items-center justify-center gap-3 uppercase tracking-widest text-[11px] border-b-4 border-teal-600 active:border-b-0"
              >
                {isDispensing ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={20} weight="bold" />
                    Finalize Dispensing
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl flex gap-4 shadow-sm">
            <Info size={24} weight="duotone" className="text-blue-500 shrink-0" />
            <p className="text-[11px] text-blue-700 font-bold leading-relaxed">
              STOCK VALIDATION: Finalizing will automatically deduct quantities from the earliest medicine batches in stock.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
