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
  Funnel,
  IdentificationCard,
  X
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
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
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

  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = m.medicine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.generic_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "ALL" || m.medicine_category.toUpperCase() === filterCategory;
    
    const stock = Number(m.total_stock) || 0;
    const isLowStock = stock <= m.reorder_level;
    const matchesStatus = filterStatus === "ALL" || 
                          (filterStatus === "LOW_STOCK" && isLowStock) || 
                          (filterStatus === "OPTIMAL" && !isLowStock);
                          
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalStockCount = medicines.reduce((acc, m) => acc + (Number(m.total_stock) || 0), 0);
  const lowStockCount = medicines.filter(m => (Number(m.total_stock) || 0) <= m.reorder_level).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-description">Monitor medication stock levels and batch distribution records.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddMedicineModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
          >
            <Plus size={18} weight="bold" />
            Register Medicine
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-teal-100">
            <Archive size={24} weight="duotone" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Stock Items</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{totalStockCount.toLocaleString()}</h3>
          </div>
        </div>
        <div className={cn(
          "bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-5 transition-colors",
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
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
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
        <div className="flex items-center gap-3">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-200 transition-all cursor-pointer min-w-[140px]"
          >
            <option value="ALL">All Categories</option>
            <option value="TABLET">Tablet</option>
            <option value="SYRUP">Syrup</option>
            <option value="CAPSULE">Capsule</option>
            <option value="INJECTION">Injection</option>
            <option value="CREAM">Cream</option>
            <option value="DROPS">Drops</option>
          </select>

          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-200 transition-all cursor-pointer min-w-[140px]"
          >
            <option value="ALL">All Statuses</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OPTIMAL">Optimal</option>
          </select>
        </div>
      </div>

      {/* Inventory Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-bold text-sm">Synchronizing inventory data...</p>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Archive size={48} weight="duotone" className="text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold text-sm text-center">No medicines match your search.</p>
          </div>
        ) : (
          filteredMedicines.map((med) => {
            const stock = Number(med.total_stock) || 0;
            const isLowStock = stock <= med.reorder_level;

            // Avoid redundancy if generic name is same as medicine name (or just brand name with dosage)
            // A simple check is if generic name is already in the medicine name string
            const showGenericName = !med.medicine_name.toLowerCase().includes(med.generic_name.toLowerCase());

            // Calculate a rough percentage for the stock bar (cap at 100%)
            // Let's assume a "healthy" stock is 2.5x the reorder level for visualization purposes
            const targetStock = med.reorder_level * 2.5;
            const stockPercent = Math.min(100, Math.max(5, (stock / targetStock) * 100));

            return (
              <div key={med.medicine_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col">
                <div className="p-6 flex-1 flex flex-col">
                  {/* Card Header: Icon & Category */}
                  <div className="flex justify-between items-start mb-5">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border",
                      isLowStock ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-teal-50 border-teal-100 text-teal-600"
                    )}>
                      <Pill size={24} weight="duotone" />
                    </div>
                    <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-wider border border-slate-200/50">
                      {med.medicine_category}
                    </span>
                  </div>

                  {/* Title Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-teal-700 transition-colors">
                      {med.medicine_name}
                    </h3>
                    {showGenericName && (
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {med.generic_name}
                      </p>
                    )}
                  </div>

                  {/* Stock Level Section */}
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Available Stock</p>
                      <p className={cn(
                        "text-sm font-black",
                        isLowStock ? "text-amber-600" : "text-teal-700"
                      )}>
                        {stock.toLocaleString()} {med.unit_of_measure}
                      </p>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          isLowStock ? "bg-amber-500" : "bg-teal-500"
                        )}
                        style={{ width: `${stockPercent}%` }}
                      />
                    </div>

                    {/* Minimal Status Text instead of clunky "MIN: 50" */}
                    {isLowStock ? (
                      <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                        <Warning size={12} weight="bold" /> Low supply alert
                      </p>
                    ) : (
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <CheckCircle size={12} strokeWidth={3} className="text-emerald-500" /> Optimal supply
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-2 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedMedicine(med);
                      setShowAddBatchModal(true);
                    }}
                    className="w-full py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest hover:border-teal-500 hover:text-teal-700 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Plus size={16} weight="bold" />
                    Add New Batch
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Medicine Modal */}
      <AnimatePresence>
        {showAddMedicineModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl shadow-xl flex flex-col border border-slate-100"
            >
              {/* Header */}
              <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-md">
                    <Pill size={22} weight="bold" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add New Medicine</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Master Drug Catalog</p>
                  </div>
                </div>
                <button onClick={() => setShowAddMedicineModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900">
                  <X size={24} weight="bold" />
                </button>
              </div>

              {/* Form Body */}
              <form id="add-medicine-form" onSubmit={handleAddMedicine} className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-teal-600 border-b border-teal-50 pb-2">
                    <Tag size={20} weight="duotone" />
                    <h3 className="font-bold text-xs uppercase tracking-widest">Drug Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Brand/Trade Name</label>
                      <input
                        required type="text"
                        value={medicineForm.medicine_name}
                        onChange={(e) => setMedicineForm({ ...medicineForm, medicine_name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium"
                        placeholder="e.g. Paracetamol 500mg"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Generic Name</label>
                      <input
                        required type="text"
                        value={medicineForm.generic_name}
                        onChange={(e) => setMedicineForm({ ...medicineForm, generic_name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium"
                        placeholder="e.g. Acetaminophen"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-teal-600 border-b border-teal-50 pb-2">
                    <Package size={20} weight="duotone" />
                    <h3 className="font-bold text-xs uppercase tracking-widest">Packaging & Inventory</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                      <select
                        value={medicineForm.medicine_category}
                        onChange={(e) => setMedicineForm({ ...medicineForm, medicine_category: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium"
                      >
                        <option value="Tablet">Tablet</option>
                        <option value="Syrup">Syrup</option>
                        <option value="Capsule">Capsule</option>
                        <option value="Injection">Injection</option>
                        <option value="Cream">Cream</option>
                        <option value="Drops">Drops</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unit of Measure</label>
                      <input
                        required type="text"
                        value={medicineForm.unit_of_measure}
                        onChange={(e) => setMedicineForm({ ...medicineForm, unit_of_measure: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium"
                        placeholder="e.g. pcs, ml, box"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reorder Level</label>
                      <input
                        required type="number"
                        value={medicineForm.reorder_level}
                        onChange={(e) => setMedicineForm({ ...medicineForm, reorder_level: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium"
                        placeholder="Minimum quantity"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-teal-600 border-b border-teal-50 pb-2">
                    <NotePencil size={20} weight="duotone" />
                    <h3 className="font-bold text-xs uppercase tracking-widest">Additional Notes</h3>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description & Usage</label>
                    <textarea
                      value={medicineForm.description}
                      onChange={(e) => setMedicineForm({ ...medicineForm, description: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium resize-none h-20"
                      placeholder="Indications, dosage info, storage requirements..."
                    />
                  </div>
                </div>

              </form>

              {/* Footer */}
              <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button onClick={() => setShowAddMedicineModal(false)} type="button" className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-900 transition-colors text-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-medicine-form"
                  className="flex items-center gap-2 px-8 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 hover:-translate-y-0.5 transition-all active:translate-y-0 text-sm"
                >
                  <Plus size={18} weight="bold" />
                  Add to Catalog
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Batch Modal */}
      <AnimatePresence>
        {showAddBatchModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-xl flex flex-col border border-slate-100"
            >
              {/* Header */}
              <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-md">
                    <Package size={22} weight="bold" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Record Inventory Batch</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedMedicine?.medicine_name}</p>
                  </div>
                </div>
                <button onClick={() => setShowAddBatchModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900">
                  <X size={24} weight="bold" />
                </button>
              </div>

              {/* Form Body */}
              <form id="add-batch-form" onSubmit={handleAddBatch} className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-teal-600 border-b border-teal-50 pb-2">
                    <IdentificationCard size={20} weight="duotone" />
                    <h3 className="font-bold text-xs uppercase tracking-widest">Batch Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Batch Number / LOT</label>
                      <input
                        required type="text"
                        value={batchForm.batch_number}
                        onChange={(e) => setBatchForm({ ...batchForm, batch_number: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium"
                        placeholder="e.g. LOT-2024-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Quantity Received</label>
                      <input
                        required type="number"
                        value={batchForm.quantity_in_stock}
                        onChange={(e) => setBatchForm({ ...batchForm, quantity_in_stock: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium"
                        placeholder="Units"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-teal-600 border-b border-teal-50 pb-2">
                    <Calendar size={20} weight="duotone" />
                    <h3 className="font-bold text-xs uppercase tracking-widest">Dates & Storage</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date Received</label>
                      <input
                        required type="date"
                        value={batchForm.date_received}
                        onChange={(e) => setBatchForm({ ...batchForm, date_received: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Expiration Date</label>
                      <input
                        required type="date"
                        value={batchForm.expiration_date}
                        onChange={(e) => setBatchForm({ ...batchForm, expiration_date: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-teal-600 border-b border-teal-50 pb-2">
                    <Archive size={20} weight="duotone" />
                    <h3 className="font-bold text-xs uppercase tracking-widest">Supplier & Location</h3>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Supplier / Source</label>
                    <input
                      required type="text"
                      value={batchForm.supplier_name}
                      onChange={(e) => setBatchForm({ ...batchForm, supplier_name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 rounded-xl transition-all outline-none text-sm border font-medium"
                      placeholder="e.g. DOH Central Office, Central Pharmacy"
                    />
                  </div>
                </div>
              </form>

              {/* Footer */}
              <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button onClick={() => setShowAddBatchModal(false)} type="button" className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-900 transition-colors text-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-batch-form"
                  className="flex items-center gap-2 px-8 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 hover:-translate-y-0.5 transition-all active:translate-y-0 text-sm"
                >
                  <Package size={18} weight="bold" />
                  Record Batch
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
