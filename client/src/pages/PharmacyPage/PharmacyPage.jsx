import { useState, useEffect } from "react";
import { 
  UsersThree, 
  Pill, 
  Plus, 
  Trash, 
  MagnifyingGlass, 
  ClipboardText, 
  CheckCircle,
  Package,
  Info,
  Minus,
  Warning
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
  const [loading, setLoading] = useState(true);
  
  const [searchMed, setSearchMed] = useState("");
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
      const [patientsData, medsData] = await Promise.all([
        patientService.getAllPatients(),
        pharmacyService.getAllMedicines()
      ]);
      setPatients(patientsData);
      setMedicines(medsData);
    } catch (error) {
      toast.error("Error", "Failed to load pharmacy data.");
    } finally {
      setLoading(false);
    }
  };

  const addToBasket = (med) => {
    const existing = basket.find(item => item.medicine_id === med.medicine_id);
    if (existing) {
      updateBasketItem(med.medicine_id, 'quantity_dispensed', existing.quantity_dispensed + 1);
      return;
    }
    setBasket([...basket, {
      ...med,
      quantity_dispensed: 1,
      dosage_instruction: "",
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
          dosage_instruction: item.dosage_instruction || 'As directed',
          duration_days: parseInt(item.duration_days) || 1,
          remarks: item.remarks || ''
        }))
      });

      toast.success("Dispensed Successfully", `Medicine given to ${selectedPatient.first_name}.`);
      
      setSelectedPatient(null);
      setBasket([]);
      setNotes("");
      setSearchPatient("");
      fetchInitialData();
    } catch (error) {
      toast.error("Transaction Failed", error.message);
    } finally {
      setIsDispensing(false);
    }
  };

  const filteredMeds = medicines.filter(m => 
    m.medicine_name.toLowerCase().includes(searchMed.toLowerCase()) ||
    m.generic_name.toLowerCase().includes(searchMed.toLowerCase())
  );

  const filteredPatients = searchPatient.trim() === "" ? [] : patients.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchPatient.toLowerCase()) ||
    p.family_serial_number?.toLowerCase().includes(searchPatient.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dispensary Point</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Select medicines and assign them to a patient.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
        
        {/* Left Column: Medicines POS */}
        <div className="lg:col-span-7 flex flex-col h-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-50">
            <div className="relative group">
              <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search medicine catalog..."
                value={searchMed}
                onChange={(e) => setSearchMed(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-200 rounded-xl transition-all outline-none text-sm font-medium text-slate-900 border"
              />
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMeds.map(med => {
                const isOutOfStock = (Number(med.total_stock) || 0) <= 0;
                const inBasket = basket.some(item => item.medicine_id === med.medicine_id);
                const showGeneric = !med.medicine_name.toLowerCase().includes(med.generic_name.toLowerCase());
                
                return (
                  <button
                    key={med.medicine_id}
                    disabled={isOutOfStock}
                    onClick={() => addToBasket(med)}
                    className={cn(
                      "flex flex-col text-left p-4 rounded-2xl border transition-all group h-full relative overflow-hidden",
                      isOutOfStock ? "bg-slate-50/50 border-slate-100 opacity-50 cursor-not-allowed" 
                      : inBasket ? "bg-teal-50/50 border-teal-200 shadow-sm"
                      : "bg-white border-slate-200 hover:border-teal-300 hover:shadow-md"
                    )}
                  >
                    {inBasket && (
                      <div className="absolute top-0 right-0 w-8 h-8 bg-teal-500 rounded-bl-2xl flex items-center justify-center">
                        <span className="text-white font-black text-[10px]">{basket.find(i => i.medicine_id === med.medicine_id)?.quantity_dispensed}</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between w-full mb-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border",
                        isOutOfStock ? "bg-slate-100 text-slate-400" : "bg-teal-50 border-teal-100 text-teal-600"
                      )}>
                        <Pill size={20} weight="duotone" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900 leading-tight group-hover:text-teal-700 transition-colors line-clamp-2">
                        {med.medicine_name}
                      </p>
                      {showGeneric && (
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 line-clamp-1">
                          {med.generic_name}
                        </p>
                      )}
                    </div>
                    <div className="mt-auto pt-3">
                      <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        isOutOfStock ? "text-red-500" : "text-slate-500"
                      )}>
                        Stock: {med.total_stock || 0} {med.unit_of_measure}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Cart & Checkout */}
        <div className="lg:col-span-5 flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          
          {/* Patient Selection Banner */}
          <div className="p-6 border-b border-white/10 relative z-10 bg-black/20">
            {!selectedPatient ? (
              <div className="relative">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2 block">Assign to Patient</label>
                <div className="relative group">
                  <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by name or FSN..."
                    value={searchPatient}
                    onChange={(e) => setSearchPatient(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                  />
                </div>
                
                {searchPatient.trim() !== "" && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    {filteredPatients.length === 0 ? (
                      <div className="p-4 text-center text-white/50 text-xs font-bold">No match found</div>
                    ) : (
                      filteredPatients.map(p => (
                        <button
                          key={p.child_id}
                          onClick={() => {
                            setSelectedPatient(p);
                            setSearchPatient("");
                          }}
                          className="w-full flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/10 transition-colors text-left last:border-0"
                        >
                          <div>
                            <p className="text-sm font-bold text-white">{p.first_name} {p.last_name}</p>
                            <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mt-0.5">{p.family_serial_number}</p>
                          </div>
                          <Plus size={16} weight="bold" className="text-white/50" />
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between bg-teal-500/20 border border-teal-500/30 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                    <UsersThree size={20} weight="fill" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-teal-300 uppercase tracking-widest">Selected Patient</p>
                    <p className="text-sm font-black text-white">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors"
                >
                  <Trash size={16} weight="bold" />
                </button>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar-light relative z-10">
            {basket.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-white">
                <Package size={64} weight="duotone" className="mb-4" />
                <p className="text-sm font-bold tracking-widest uppercase">Cart is Empty</p>
                <p className="text-[11px] font-medium mt-2 max-w-[200px] text-center">Select medicines from the catalog to add them to the dispensing cart.</p>
              </div>
            ) : (
              <AnimatePresence>
                {basket.map((item) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={item.medicine_id} 
                    className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-sm text-teal-400">{item.medicine_name}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Stock: {item.total_stock}</p>
                      </div>
                      <button onClick={() => removeFromBasket(item.medicine_id)} className="text-white/20 hover:text-red-400 transition-colors">
                        <Trash size={18} weight="fill" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-black/40 rounded-lg p-1 border border-white/10">
                        <button 
                          onClick={() => updateBasketItem(item.medicine_id, 'quantity_dispensed', Math.max(1, item.quantity_dispensed - 1))}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 text-white transition-colors"
                        >
                          <Minus size={14} weight="bold" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-white">{item.quantity_dispensed}</span>
                        <button 
                          onClick={() => updateBasketItem(item.medicine_id, 'quantity_dispensed', Math.min(item.total_stock, item.quantity_dispensed + 1))}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 text-white transition-colors"
                        >
                          <Plus size={14} weight="bold" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-white/50">{item.unit_of_measure}</span>
                    </div>

                    <input 
                      type="text"
                      placeholder="Sig. (e.g. 1 tab 3x a day)"
                      value={item.dosage_instruction}
                      onChange={(e) => updateBasketItem(item.medicine_id, 'dosage_instruction', e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[11px] font-medium text-white placeholder:text-white/30 outline-none focus:border-teal-500/50 transition-colors"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Checkout Footer */}
          <div className="p-6 bg-black/40 border-t border-white/10 relative z-10 space-y-4">
            {basket.length > 0 && (
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Total Items</span>
                <span className="text-lg font-black text-white">{basket.length}</span>
              </div>
            )}
            <button 
              onClick={handleDispense}
              disabled={isDispensing || basket.length === 0 || !selectedPatient}
              className="w-full py-4 bg-teal-500 text-white rounded-xl font-black shadow-xl hover:bg-teal-400 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3 uppercase tracking-widest text-xs border-b-4 border-teal-600 active:border-b-0"
            >
              {isDispensing ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ClipboardText size={20} weight="bold" />
                  Confirm & Dispense
                </>
              )}
            </button>
            {!selectedPatient && basket.length > 0 && (
              <p className="text-center text-[10px] font-bold text-amber-500 flex items-center justify-center gap-1">
                <Warning size={12} weight="bold" /> Please assign a patient above
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
