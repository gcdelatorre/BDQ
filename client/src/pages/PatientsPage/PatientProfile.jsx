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
  Info,
  ClipboardText
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import patientService from "@/services/patientService";
import { cn } from "@/lib/utils";
import ImmunizationTab from "./components/ImmunizationTab";
import NutritionalTab from "./components/NutritionalTab";
import SupplementationTab from "./components/SupplementationTab";
import BreastfeedingTab from "./components/BreastfeedingTab";
import ProfileSummaryTab from "./components/ProfileSummaryTab";
import { Card, CardBody } from "@/components/ui/card";
import DispensingLogsTab from "./components/DispensingLogsTab";



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
    { id: "summary", label: "Overview" },
    { id: "child_imm", label: "Immunization" },
    { id: "nutrition", label: "Growth" },
    { id: "supplement", label: "Supplements" },
    { id: "breastfeeding", label: "Breastfeeding" },
    { id: "dispensing", label: "Medicine Logs" },
  ];

  return (
    <div className="page-shell">
      {/* Navigation Header */}
      <div className="flex items-center justify-between gap-4 pb-4">
        <button
          onClick={() => navigate("/patients")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-all"
        >
          <ArrowLeft size={18} weight="bold" />
          Directory
        </button>
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
            Registered: {formatDate(patient.date_of_registration)}
          </div>
          <div className="text-[10px] font-black text-teal-700 uppercase tracking-widest px-3 py-1.5 bg-teal-50 border border-teal-100 rounded-xl">
            FSN: {patient.family_serial_number}
          </div>
        </div>
      </div>

      {/* Patient Header Card */}
      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-50/20 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />
        <CardBody className="p-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="w-24 h-24 bg-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-teal-600/20">
              <UserCircle size={60} weight="duotone" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {patient.first_name} {patient.middle_initial ? `${patient.middle_initial}. ` : ""}{patient.last_name}
                </h1>
                <div className="flex gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                    patient.sex === 'M' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-pink-50 text-pink-700 border-pink-100"
                  )}>
                    {patient.sex === 'M' ? "Male" : "Female"}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {patient.se_status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-x-8 gap-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-teal-600">
                    <Calendar size={18} weight="bold" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</p>
                    <p className="text-sm font-bold text-slate-700">{formatDate(patient.date_of_birth)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-teal-600">
                    <Baby size={18} weight="bold" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Age</p>
                    <p className="text-sm font-bold text-slate-700">{calculateAge(patient.date_of_birth)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tab Navigation */}
      <div className="pt-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shrink-0 border",
                activeTab === tab.id
                  ? "bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-600/20"
                  : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "summary" && (
              <ProfileSummaryTab patient={patient} formatDate={formatDate} />
            )}

            {activeTab === "child_imm" && (
              <ImmunizationTab childId={id} />
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

