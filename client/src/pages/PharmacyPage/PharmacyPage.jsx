import { useState, useEffect, useCallback } from "react";
import pharmacyService from "@/services/pharmacyService";
import patientService from "@/services/patientService";
import { useToast } from "@/hooks/useToast";
import PatientSelector from "./components/PatientSelector";
import MedicineCatalog from "./components/MedicineCatalog";
import DispensingCart from "./components/DispensingCart";

export default function PharmacyPage() {
  const { toast } = useToast();
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const [searchMed, setSearchMed] = useState("");
  const [searchPatient, setSearchPatient] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [basket, setBasket] = useState([]);
  const [notes, setNotes] = useState("");
  const [isDispensing, setIsDispensing] = useState(false);

  const fetchInitialData = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setInitialLoading(true);
      const [patientsData, medsData] = await Promise.all([
        patientService.getAllPatients(),
        pharmacyService.getAllMedicines()
      ]);
      setPatients(patientsData);
      setMedicines(medsData);
    } catch {
      toast.error("Error", "Failed to load pharmacy data.");
    } finally {
      setInitialLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInitialData();
  }, []);

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
      await fetchInitialData({ silent: true });
    } catch (error) {
      toast.error("Transaction Failed", error.message);
    } finally {
      setIsDispensing(false);
    }
  };

  return (
    <div className="page-shell">
      <div>
        <h1 className="page-title">Medicine Dispensing</h1>
        <p className="page-description">
          Select the patient, add medicines, then confirm. Stock updates automatically.
        </p>
      </div>

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <PatientSelector
          patients={patients}
          searchPatient={searchPatient}
          onSearchChange={setSearchPatient}
          selectedPatient={selectedPatient}
          onSelect={handleSelectPatient}
          onClear={handleClearPatient}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:min-h-[480px]">
        <div className="lg:col-span-7 flex flex-col">
          <MedicineCatalog
            medicines={medicines}
            searchMed={searchMed}
            onSearchChange={setSearchMed}
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
    </div>
  );
}
