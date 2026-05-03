import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Baby, 
  Syringe, 
  ChartLineUp, 
  Pill, 
  UserCircle, 
  Calendar, 
  IdentificationCard,
  GenderFemale,
  Drop,
  CheckCircle,
  Clock,
  Info,
  Notebook,
  NotePencil,
  X,
  UsersFour,
  ClipboardText
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import patientService from "@/services/patientService";
import { cn } from "@/lib/utils";
import ImmunizationTab from "./components/ImmunizationTab";
import NutritionalTab from "./components/NutritionalTab";
import SupplementationTab from "./components/SupplementationTab";
import BreastfeedingTab from "./components/BreastfeedingTab";
import MaternalImmunizationTab from "./components/MaternalImmunizationTab";
import DispensingLogsTab from "./components/DispensingLogsTab";

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatientById(id);
      setPatient(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0) { years--; months += 12; }
    if (years === 0) return `${months} Months`;
    return `${years}y ${months}m`;
  };

  const formatDate = (date) => {
    if (!date) return "Not Recorded";
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'long', day: 'numeric', year: 'numeric' 
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
    </div>
  );

  if (!patient) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
      <Info size={48} className="text-slate-300" />
      <p className="text-slate-500 font-bold">Patient profile not found.</p>
      <button onClick={() => navigate("/patients")} className="text-teal-600 font-bold hover:underline transition-all">Return to Directory</button>
    </div>
  );

  const tabs = [
    { id: "summary", label: "Full Profile", icon: IdentificationCard },
    { id: "child_imm", label: "Child Immunization", icon: Syringe },
    { id: "maternal_imm", label: "Maternal Immunization", icon: UsersFour },
    { id: "nutrition", label: "Nutritional Assessment", icon: ChartLineUp },
    { id: "supplement", label: "Supplementation", icon: Pill },
    { id: "breastfeeding", label: "Breastfeeding", icon: Baby },
    { id: "dispensing", label: "Medicine Logs", icon: ClipboardText },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate("/patients")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all group"
        >
          <div className="w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center group-hover:border-slate-300 shadow-sm">
            <ArrowLeft size={18} weight="bold" />
          </div>
          Back to Directory
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2">
            <Clock size={18} weight="duotone" className="text-teal-600" />
            Registered: {formatDate(patient.date_of_registration)}
          </div>
          <div className="bg-teal-600 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-md">
            FSN: {patient.family_serial_number}
          </div>
        </div>
      </div>

      {/* Hero Section - Cleaned Redundancy */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/30 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
          <div className="w-24 h-24 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <UserCircle size={64} weight="duotone" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {patient.first_name} {patient.middle_initial ? `${patient.middle_initial}. ` : ""}{patient.last_name}
              </h1>
              <div className="flex gap-2">
                <span className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                  patient.sex === 'M' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-pink-50 text-pink-700 border-pink-100"
                )}>
                  {patient.sex === 'M' ? "Male" : "Female"}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                  patient.se_status === 'NHTS' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-200"
                )}>
                  {patient.se_status}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-slate-500 font-bold text-sm">
              <span className="flex items-center gap-2.5">
                <Calendar size={20} weight="duotone" className="text-teal-600" />
                Born {formatDate(patient.date_of_birth)}
              </span>
              <span className="flex items-center gap-2.5">
                <Baby size={20} weight="duotone" className="text-teal-600" />
                Current Age: {calculateAge(patient.date_of_birth)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex p-1.5 bg-slate-100/50 rounded-2xl w-fit border border-slate-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-[11px] transition-all",
                isActive 
                  ? "bg-white text-teal-600 shadow-sm border border-slate-100" 
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Icon size={18} weight={isActive ? "duotone" : "bold"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "summary" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Family & Birth */}
                <div className="lg:col-span-1 space-y-8">
                  <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <h3 className="flex items-center gap-2 font-bold text-slate-400 text-[11px] uppercase tracking-widest">
                      <GenderFemale size={18} weight="duotone" className="text-teal-600" />
                      Family Information
                    </h3>
                    <div className="space-y-5">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mother's Full Name</p>
                        <p className="text-slate-900 font-bold mt-1 text-[15px]">{patient.mother_complete_name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Home Address</p>
                        <p className="text-slate-700 font-medium mt-1 leading-relaxed text-sm">{patient.complete_address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <h3 className="flex items-center gap-2 font-bold text-slate-400 text-[11px] uppercase tracking-widest">
                      <Baby size={18} weight="duotone" className="text-teal-600" />
                      Birth Records
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Weight (kg)</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{patient.weight_at_birth_kg}</p>
                        <span className={cn(
                          "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block border",
                          patient.birth_weight_status === 'Normal' ? "bg-teal-50 text-teal-700 border-teal-100" : "bg-amber-50 text-amber-700 border-amber-100"
                        )}>
                          {patient.birth_weight_status}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Length (cm)</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{patient.length_at_birth_cm}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Health Timeline & Certifications */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="flex items-center gap-2 font-bold text-slate-400 text-[11px] uppercase tracking-widest mb-8">
                      <Drop size={18} weight="duotone" className="text-teal-600" />
                      Nutritional Milestones
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Breastfeeding Initiated</p>
                        <p className="text-slate-800 font-bold">{formatDate(patient.initiated_breastfeeding_date)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Exclusively Breastfed (6 mo)</p>
                        <div className="flex items-center gap-2 mt-1">
                          {patient.exclusively_breastfed_6_months === 'Yes' ? (
                            <CheckCircle size={20} weight="fill" className="text-teal-500" />
                          ) : (
                            <X size={20} weight="bold" className="text-slate-200" />
                          )}
                          <span className="font-bold text-slate-700 uppercase">{patient.exclusively_breastfed_6_months || "---"}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Complementary Foods</p>
                        <div className="flex items-center gap-2 mt-1">
                          {patient.intro_complementary_foods === 'Yes' ? (
                            <CheckCircle size={20} weight="fill" className="text-teal-500" />
                          ) : (
                            <X size={20} weight="bold" className="text-slate-200" />
                          )}
                          <span className="font-bold text-slate-700 uppercase">{patient.intro_complementary_foods || "---"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="flex items-center gap-2 font-bold text-slate-400 text-[11px] uppercase tracking-widest mb-8">
                      <CheckCircle size={18} weight="duotone" className="text-teal-600" />
                      Certification Status
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className={cn(
                        "p-6 rounded-2xl border transition-all",
                        patient.fic_date ? "bg-teal-50/30 border-teal-100" : "bg-slate-50 border-slate-100 opacity-60"
                      )}>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">FIC (Fully Immunized Child)</h4>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xl font-bold text-slate-900">{patient.fic_date ? formatDate(patient.fic_date) : "Pending"}</p>
                          {patient.fic_date && <CheckCircle size={24} weight="fill" className="text-teal-500" />}
                        </div>
                      </div>
                      <div className={cn(
                        "p-6 rounded-2xl border transition-all",
                        patient.cic_date ? "bg-blue-50/30 border-blue-100" : "bg-slate-50 border-slate-100 opacity-60"
                      )}>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CIC (Completely Immunized Child)</h4>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xl font-bold text-slate-900">{patient.cic_date ? formatDate(patient.cic_date) : "Pending"}</p>
                          {patient.cic_date && <CheckCircle size={24} weight="fill" className="text-blue-500" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.02]">
                      <Notebook size={140} weight="bold" />
                    </div>
                    <h3 className="flex items-center gap-2 font-bold text-slate-400 text-[11px] uppercase tracking-widest mb-4">
                      <NotePencil size={18} weight="duotone" className="text-teal-600" />
                      Clinical Remarks
                    </h3>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {patient.remarks || "No clinical remarks recorded."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "child_imm" && (
              <ImmunizationTab childId={id} />
            )}

            {activeTab === "maternal_imm" && (
              <MaternalImmunizationTab childId={id} />
            )}

            {activeTab === "nutrition" && (
              <NutritionalTab childId={id} />
            )}

            {activeTab === "supplement" && (
              <SupplementationTab childId={id} />
            )}

            {activeTab === "breastfeeding" && (
              <BreastfeedingTab childId={id} />
            )}

            {activeTab === "dispensing" && (
              <DispensingLogsTab childId={id} />
            )}

            {activeTab !== "summary" && 
             activeTab !== "child_imm" && 
             activeTab !== "maternal_imm" && 
             activeTab !== "nutrition" && 
             activeTab !== "supplement" && 
             activeTab !== "breastfeeding" && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center p-12">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-6">
                  {activeTab === "dispensing" && <ClipboardText size={32} weight="duotone" />}
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {tabs.find(t => t.id === activeTab)?.label} Module
                </h3>
                <p className="text-slate-500 max-w-sm mt-2 text-sm font-medium italic">This clinical module is currently being finalized for high-fidelity data entry.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
