import { useState, useEffect, useCallback } from "react";
import pharmacyService from "@/services/pharmacyService";
import patientService from "@/services/patientService";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import PatientSelector from "./components/PatientSelector";
import MedicineCatalog from "./components/MedicineCatalog";
import DispensingCart from "./components/DispensingCart";
import DispensingHistoryModal from "./components/DispensingHistoryModal";
import { ClockCounterClockwise } from "@phosphor-icons/react";
import PrintInventoryReport from "@/components/reports/PrintInventoryReport";

export default function PharmacyPage() {
  const { toast } = useToast();
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const [searchMed, setSearchMed] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [searchPatient, setSearchPatient] = useState("");
  const [patientPage, setPatientPage] = useState(1);
  const [patientHasMore, setPatientHasMore] = useState(false);
  const [patientLoading, setPatientLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [basket, setBasket] = useState([]);
  const [notes, setNotes] = useState("");
  const [isDispensing, setIsDispensing] = useState(false);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchInitialData = useCallback(async ({ silent = false, category = "ALL" } = {}) => {
    try {
      if (!silent) setInitialLoading(true);
      const medsData = await pharmacyService.getAllMedicines({
        search: searchMed,
        category: category
      });
      setMedicines(medsData);
    } catch {
      toast.error("Error", "Failed to load pharmacy data.");
    } finally {
      setInitialLoading(false);
    }
  }, [searchMed]);

  useEffect(() => {
    fetchInitialData({ category: filterCategory });
  }, [filterCategory, fetchInitialData]);

  const fetchPatients = useCallback(async ({ search = "", page = 1, append = false } = {}) => {
    try {
      setPatientLoading(true);
      const response = await patientService.getAllPatients({ search, page, limit: 12 });
      const patientList = response.data || [];

      setPatients(prev => (append ? [...prev, ...patientList] : patientList));
      setPatientHasMore(response.meta?.totalPages > page);
    } catch {
      toast.error("Error", "Failed to load patients.");
    } finally {
      setPatientLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients({ page: 1 });
  }, []);

  const handlePatientSearch = (value) => {
    setSearchPatient(value);
    setPatientPage(1);
    fetchPatients({ search: value, page: 1 });
  };

  const loadMorePatients = async () => {
    const nextPage = patientPage + 1;
    setPatientPage(nextPage);
    await fetchPatients({ search: searchPatient, page: nextPage, append: true });
  };

  const getLiveStock = (medicineId) => {
    const med = medicines.find(m => m.medicine_id === medicineId);
    return Number(med?.total_stock) || 0;
  };

  const addToBasket = (med) => {
    const stock = getLiveStock(med.medicine_id);
    if (stock <= 0) return;

    const existing = basket.find(item => item.medicine_id === med.medicine_id);
    if (existing) {
      updateBasketItem(med.medicine_id, "quantity_dispensed", Math.min(stock, existing.quantity_dispensed + 1));
      return;
    }
    setBasket(prev => [...prev, {
      medicine_id: med.medicine_id,
      medicine_name: med.medicine_name,
      generic_name: med.generic_name,
      unit_of_measure: med.unit_of_measure,
      quantity_dispensed: 1,
      dosage_instruction: "",
      duration_days: 1,
      remarks: ""
    }]);
  };

  const removeFromBasket = (medId) => {
    setBasket(prev => prev.filter(item => item.medicine_id !== medId));
  };

  const updateBasketItem = (medId, field, value) => {
    setBasket(prev => prev.map(item =>
      item.medicine_id === medId ? { ...item, [field]: value } : item
    ));
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSearchPatient("");
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setSearchPatient("");
    setPatientPage(1);
    fetchPatients({ search: "", page: 1 });
  };

  const fetchDispensingHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await pharmacyService.getDispensingHistory(20);
      setHistory(data);
    } catch {
      toast.error("Error", "Failed to load dispensing history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const openHistory = async () => {
    setHistoryOpen(true);
    await fetchDispensingHistory();
  };

  const closeHistory = () => {
    setHistoryOpen(false);
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

    for (const item of basket) {
      const stock = getLiveStock(item.medicine_id);
      if (item.quantity_dispensed > stock) {
        toast.error("Insufficient Stock", `${item.medicine_name} only has ${stock} in stock.`);
        return;
      }
    }

    try {
      setIsDispensing(true);
      await pharmacyService.dispenseMedicine({
        child_id: selectedPatient.child_id,
        notes,
        medicines: basket.map(item => ({
          medicine_id: item.medicine_id,
          quantity_dispensed: parseInt(item.quantity_dispensed, 10),
          dosage_instruction: item.dosage_instruction || "As directed",
          duration_days: parseInt(item.duration_days, 10) || 1,
          remarks: item.remarks || ""
        }))
      });

      toast.success("Dispensed Successfully", `Medicine given to ${selectedPatient.first_name}.`);
      setSelectedPatient(null);
      setBasket([]);
      setNotes("");
      setSearchPatient("");
      await fetchInitialData({ silent: true, category: filterCategory });
    } catch (error) {
      toast.error("Transaction Failed", error.message);
    } finally {
      setIsDispensing(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Medicine Dispensing</h1>
          <p className="page-description">
            Select the patient, add medicines, then confirm. Stock updates automatically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openHistory}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-100 text-slate-600 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all text-[11px] uppercase tracking-widest"
          >
            <ClockCounterClockwise size={18} weight="bold" />
            View History
          </button>
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <PatientSelector
            patients={patients}
            searchPatient={searchPatient}
            onSearchChange={handlePatientSearch}
            selectedPatient={selectedPatient}
            onSelect={handleSelectPatient}
            onClear={handleClearPatient}
            loading={patientLoading}
            hasMore={patientHasMore}
            onLoadMore={loadMorePatients}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col">
          <MedicineCatalog
            medicines={medicines}
            searchMed={searchMed}
            onSearchChange={setSearchMed}
            filterCategory={filterCategory}
            onFilterCategoryChange={setFilterCategory}
            basket={basket}
            onAdd={addToBasket}
            disabled={!selectedPatient}
            loading={initialLoading}
          />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <DispensingCart
            basket={basket}
            notes={notes}
            onNotesChange={setNotes}
            selectedPatient={selectedPatient}
            getLiveStock={getLiveStock}
            onUpdateItem={updateBasketItem}
            onRemoveItem={removeFromBasket}
            onDispense={handleDispense}
            isDispensing={isDispensing}
          />
        </div>
      </div>

      <DispensingHistoryModal
        isOpen={historyOpen}
        onClose={closeHistory}
        history={history}
        loading={historyLoading}
      />
    </div>
  );
}
