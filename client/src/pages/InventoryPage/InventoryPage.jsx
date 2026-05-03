import { useState, useEffect } from "react";
import { 
  Package, 
  Plus, 
  MagnifyingGlass, 
  Warning, 
  TrendUp, 
  Pill, 
  Calendar, 
  Archive,
  ArrowRight,
  Info,
  Tag,
  NotePencil,
  Funnel
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import pharmacyService from "@/services/pharmacyService";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

export default function InventoryPage() {
  const { toast } = useToast();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  // Form States
  const [medicineForm, setMedicineForm] = useState({
    medicine_name: "",
    generic_name: "",
    medicine_category: "Tablet",
    unit_of_measure: "pcs",
    description: "",
    reorder_level: 50
  });

  const [batchForm, setBatchForm] = useState({
    batch_number: "",
    quantity_in_stock: "",
    expiration_date: "",
    date_received: new Date().toISOString().split('T')[0],
    supplier_name: "",
    storage_location: "Main Cabinet"
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const data = await pharmacyService.getAllMedicines();
      setMedicines(data);
    } catch (error) {
      toast.error("Error", "Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      await pharmacyService.addMedicine(medicineForm);
      toast.success("Success", "Medicine added to master list.");
      setShowAddMedicineModal(false);
      fetchMedicines();
      setMedicineForm({
        medicine_name: "",
        generic_name: "",
        medicine_category: "Tablet",
        unit_of_measure: "pcs",
        description: "",
        reorder_level: 50
      });
    } catch (error) {
      toast.error("Error", error.message);
    }
  };

  const handleAddBatch = async (e) => {
    e.preventDefault();
    try {
      await pharmacyService.addBatch({
        medicine_id: selectedMedicine.medicine_id,
        ...batchForm
      });
      toast.success("Success", "Inventory batch added.");
      setShowAddBatchModal(false);
      fetchMedicines();
      setBatchForm({
        batch_number: "",
        quantity_in_stock: "",
        expiration_date: "",
        date_received: new Date().toISOString().split('T')[0],
        supplier_name: "",
        storage_location: "Main Cabinet"
      });
    } catch (error) {
      toast.error("Error", error.message);
    }
  };

  const filteredMedicines = medicines.filter(m => 
    m.medicine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.generic_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStockCount = medicines.reduce((acc, m) => acc + (Number(m.total_stock) || 0), 0);
  const lowStockCount = medicines.filter(m => (Number(m.total_stock) || 0) <= m.reorder_level).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Monitor medication stock levels and batch distribution records.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddMedicineModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
          >
            <Plus size={18} weight="bold" />
            Register Medicine
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-teal-100">
            <Archive size={24} weight="duotone" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Stock Items</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{totalStockCount.toLocaleString()}</h3>
          </div>
        </div>
        <div className={cn(
          "bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-5 transition-colors",
          lowStockCount > 0 ? "border-amber-100 bg-amber-50/10" : "border-slate-100"
        )}>
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 border",
            lowStockCount > 0 ? "bg-amber-100 border-amber-200 text-amber-600" : "bg-blue-50 border-blue-100 text-blue-600"
          )}>
            <Warning size={24} weight="duotone" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Low Stock Alerts</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{lowStockCount}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-purple-50 border border-purple-100 text-purple-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <TrendUp size={24} weight="duotone" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Catalog Count</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{medicines.length}</h3>
          </div>
        </div>
      </div>

      {/* Standard Search Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search medicine by name or generic name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-200 rounded-xl transition-all outline-none text-sm font-medium text-slate-900 border"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-xl font-bold border border-slate-100 hover:bg-slate-50 transition-all text-[11px] tracking-wider uppercase">
          <Funnel size={18} weight="bold" />
          Filters
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white p-2 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medicine Details</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Available Stock</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-bold text-sm">Synchronizing inventory data...</p>
                  </td>
                </tr>
              ) : filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <Archive size={48} weight="duotone" className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold text-sm text-center">No medicines match your search.</p>
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  const isLowStock = (Number(med.total_stock) || 0) <= med.reorder_level;
                  return (
                    <tr key={med.medicine_id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all shadow-sm",
                            isLowStock ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-teal-50 border-teal-100 text-teal-600"
                          )}>
                            <Pill size={20} weight="duotone" />
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-slate-900 leading-tight group-hover:text-teal-700 transition-colors">{med.medicine_name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{med.generic_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-wider border border-slate-200/50">
                          {med.medicine_category}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="space-y-1">
                          <p className="text-[14px] font-bold text-slate-900">{med.total_stock || 0} {med.unit_of_measure}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MIN: {med.reorder_level}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center">
                          {isLowStock ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                              <Warning size={14} weight="bold" />
                              <span className="text-[9px] font-black uppercase tracking-widest">Low Stock</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                              <CheckCircle size={14} weight="bold" />
                              <span className="text-[9px] font-black uppercase tracking-widest">Optimal</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => {
                            setSelectedMedicine(med);
                            setShowAddBatchModal(true);
                          }}
                          className="px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm flex items-center gap-2 ml-auto"
                        >
                          <Plus size={14} weight="bold" />
                          Update Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medicine Modal */}
      <AnimatePresence>
        {showAddMedicineModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg border border-teal-500">
                    <Pill size={24} weight="bold" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 tracking-tight">Register New Medicine</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master Drug List Database</p>
                  </div>
                </div>
                <button onClick={() => setShowAddMedicineModal(false)} className="text-slate-400 hover:text-red-500 transition-all p-2 bg-white rounded-xl border border-slate-100">
                  <Plus size={24} weight="bold" className="rotate-45" />
                </button>
              </div>

              <form onSubmit={handleAddMedicine} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Medicine Name</label>
                    <input 
                      required type="text"
                      value={medicineForm.medicine_name}
                      onChange={(e) => setMedicineForm({...medicineForm, medicine_name: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-2xl transition-all outline-none text-sm border font-bold text-slate-700"
                      placeholder="e.g. Paracetamol"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Generic Name</label>
                    <input 
                      required type="text"
                      value={medicineForm.generic_name}
                      onChange={(e) => setMedicineForm({...medicineForm, generic_name: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-2xl transition-all outline-none text-sm border font-bold text-slate-700"
                      placeholder="e.g. Acetaminophen"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={medicineForm.medicine_category}
                      onChange={(e) => setMedicineForm({...medicineForm, medicine_category: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-2xl transition-all outline-none text-sm border font-bold text-slate-700"
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Injection">Injection</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unit</label>
                    <input 
                      required type="text"
                      value={medicineForm.unit_of_measure}
                      onChange={(e) => setMedicineForm({...medicineForm, unit_of_measure: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-2xl transition-all outline-none text-sm border font-bold text-slate-700"
                      placeholder="e.g. pcs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reorder Point</label>
                    <input 
                      required type="number"
                      value={medicineForm.reorder_level}
                      onChange={(e) => setMedicineForm({...medicineForm, reorder_level: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-2xl transition-all outline-none text-sm border font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Notes / Description</label>
                  <textarea 
                    value={medicineForm.description}
                    onChange={(e) => setMedicineForm({...medicineForm, description: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-2xl transition-all outline-none text-sm border font-medium h-24 resize-none"
                    placeholder="Brief description of the medication..."
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-50">
                  <button 
                    type="button"
                    onClick={() => setShowAddMedicineModal(false)}
                    className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors text-[11px] uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-black shadow-xl hover:bg-teal-700 transition-all text-[11px] uppercase tracking-widest border-b-4 border-teal-800 active:border-b-0 active:translate-y-1"
                  >
                    Save to Catalog
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Batch Modal */}
      <AnimatePresence>
        {showAddBatchModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-800">
                    <Package size={24} weight="bold" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 tracking-tight">Record Inventory Batch</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedMedicine?.medicine_name}</p>
                  </div>
                </div>
                <button onClick={() => setShowAddBatchModal(false)} className="text-slate-400 hover:text-red-500 transition-all p-2 bg-white rounded-xl border border-slate-100">
                  <Plus size={24} weight="bold" className="rotate-45" />
                </button>
              </div>

              <form onSubmit={handleAddBatch} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Batch Number</label>
                    <input 
                      required type="text"
                      value={batchForm.batch_number}
                      onChange={(e) => setBatchForm({...batchForm, batch_number: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-2xl transition-all outline-none text-sm border font-bold text-slate-700"
                      placeholder="e.g. LOT-2024-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Quantity Received</label>
                    <input 
                      required type="number"
                      value={batchForm.quantity_in_stock}
                      onChange={(e) => setBatchForm({...batchForm, quantity_in_stock: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-2xl transition-all outline-none text-sm border font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Calendar size={14} className="text-teal-600" /> Expiry Date
                    </label>
                    <input 
                      required type="date"
                      value={batchForm.expiration_date}
                      onChange={(e) => setBatchForm({...batchForm, expiration_date: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-2xl transition-all outline-none text-sm border font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Calendar size={14} className="text-teal-600" /> Date Received
                    </label>
                    <input 
                      required type="date"
                      value={batchForm.date_received}
                      onChange={(e) => setBatchForm({...batchForm, date_received: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-2xl transition-all outline-none text-sm border font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Supplier / Source</label>
                  <input 
                    required type="text"
                    value={batchForm.supplier_name}
                    onChange={(e) => setBatchForm({...batchForm, supplier_name: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-2xl transition-all outline-none text-sm border font-bold text-slate-700"
                    placeholder="e.g. DOH Central Office"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-50">
                  <button 
                    type="button"
                    onClick={() => setShowAddBatchModal(false)}
                    className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors text-[11px] uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all text-[11px] uppercase tracking-widest border-b-4 border-slate-950 active:border-b-0 active:translate-y-1"
                  >
                    Record Stock
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
