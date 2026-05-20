import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  Baby, 
  Syringe, 
  ChartLineUp, 
  Pill, 
  UserCircle, 
  Calendar, 
  IdentificationCard,
  CheckCircle,
  Clock,
  Info,
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
import ProfileTabNav from "./components/ProfileTabNav";
import ProfileSummaryTab from "./components/ProfileSummaryTab";
import { Card, CardBody } from "@/components/ui/card";

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    fetchPatient();
  }, [id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedTab = params.get("tab");

    const tabMap = {
      immunization: "child_imm",
      child_imm: "child_imm",
      maternal: "maternal_imm",
      nutrition: "nutrition",
      supplement: "supplement",
      breastfeeding: "breastfeeding",
      dispensing: "dispensing"
    };

    if (requestedTab && tabMap[requestedTab]) {
      setActiveTab(tabMap[requestedTab]);
    } else {
      setActiveTab("summary");
    }
  }, [location.search]);

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
    <div className="page-shell">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate("/patients")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all group"
        >
          <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center group-hover:border-slate-300 shadow-sm">
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

      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/30 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <CardBody className="relative z-10 py-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-24 h-24 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <UserCircle size={64} weight="duotone" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="page-title">
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
        </CardBody>
      </Card>

      <ProfileTabNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

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
              <ProfileSummaryTab patient={patient} formatDate={formatDate} />
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

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
