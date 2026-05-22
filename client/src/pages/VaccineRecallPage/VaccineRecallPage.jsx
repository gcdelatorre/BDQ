import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  MagnifyingGlass,
  Syringe,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  WarningCircle,
  PhoneCall,
  X,
  CaretLeft,
  CaretRight,
  ClockCounterClockwise
} from "@phosphor-icons/react";
import clinicalService from "@/services/clinicalService";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

const ITEMS_PER_PAGE = 9;

export default function VaccineRecallPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recalls, setRecalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showCallList, setShowCallList] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRecalls();
  }, []);

  const fetchRecalls = async () => {
    try {
      setLoading(true);
      const data = await clinicalService.getVaccineRecallList();
      setRecalls(data || []);
    } catch (error) {
      console.error("Failed to load recall list:", error);
      toast.error("Error", "Could not fetch vaccine recall list");
    } finally {
      setLoading(false);
    }
  };

  const groupedRecalls = useMemo(() => {
    const grouped = recalls.reduce((acc, curr) => {
      if (!acc[curr.child_id]) {
        acc[curr.child_id] = {
          child_id: curr.child_id,
          first_name: curr.first_name,
          last_name: curr.last_name,
          age_in_months: curr.age_in_months,
          mother_complete_name: curr.mother_complete_name,
          contact_number: curr.contact_number,
          complete_address: curr.complete_address,
          family_serial_number: curr.family_serial_number,
          vaccines: [],
          worst_diff_days: Infinity,
          has_overdue: false,
          has_upcoming: false,
        };
      }
      acc[curr.child_id].vaccines.push({
        vaccine_type: curr.vaccine_type,
        dose_number: curr.dose_number,
        age_label: curr.age_label,
        due_date: curr.due_date,
        diff_days: curr.diff_days,
        status: curr.status
      });
      if (curr.diff_days < acc[curr.child_id].worst_diff_days) {
        acc[curr.child_id].worst_diff_days = curr.diff_days;
      }
      if (curr.status === "Overdue") acc[curr.child_id].has_overdue = true;
      if (curr.status === "Upcoming") acc[curr.child_id].has_upcoming = true;
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => a.worst_diff_days - b.worst_diff_days);
  }, [recalls]);

  const filteredGroups = useMemo(() => {
    return groupedRecalls.filter((group) => {
      // 7-day lookahead for upcoming recalls
      const hasUpcomingWithinWeek = group.vaccines.some(v => v.status === "Upcoming" && v.diff_days <= 7);
      
      if (activeTab === "overdue" && !group.has_overdue) return false;
      if (activeTab === "upcoming" && !hasUpcomingWithinWeek) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const patientName = `${group.first_name} ${group.last_name}`.toLowerCase();
        const motherName = (group.mother_complete_name || "").toLowerCase();
        const vaccineMatch = group.vaccines.some(v => v.vaccine_type.toLowerCase().includes(q));
        return patientName.includes(q) || motherName.includes(q) || vaccineMatch;
      }
      return true;
    });
  }, [groupedRecalls, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredGroups.length / ITEMS_PER_PAGE);
  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGroups.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGroups, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const tomorrowsList = useMemo(() => {
    return groupedRecalls.filter(g => g.vaccines.some(v => v.diff_days === 1));
  }, [groupedRecalls]);

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="page-title text-3xl font-bold text-slate-900 tracking-tight">Vaccine Recall Registry</h1>
          <p className="page-description text-slate-500 font-medium text-sm mt-1">Monitor due vaccines and access contact information for patient follow-ups.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCallList(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 hover:-translate-y-0.5 transition-all">
            <PhoneCall size={20} weight="fill" />
            Tomorrow's Call List
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex bg-slate-100/80 p-1.5 rounded-xl w-full md:w-auto">
          {[{ id: "all", label: "All" }, { id: "overdue", label: "Overdue" }, { id: "upcoming", label: "Upcoming (7 Days)" }].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search patient or vaccine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm font-medium bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white focus:border-teal-500/50 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-3xl border border-slate-100">
          <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <CheckCircle size={32} weight="duotone" className="text-slate-300" />
          </div>
          <h4 className="font-bold text-slate-800 text-lg">Registry Optimized</h4>
          <p className="text-slate-400 text-sm mt-1">No pending recalls found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedGroups.map((group) => {
              const isOverdue = group.has_overdue;
              return (
                <motion.div key={group.child_id} variants={itemVariants} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col">
                  <div className={cn("absolute top-0 left-0 w-full h-1", isOverdue ? "bg-rose-500" : group.vaccines.some(v => v.diff_days <= 7) ? "bg-teal-500" : "bg-slate-300")} />
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border", isOverdue ? "bg-rose-50 text-rose-700 border-rose-100" : group.vaccines.some(v => v.diff_days <= 7) ? "bg-teal-50 text-teal-700 border-teal-100" : "bg-slate-50 text-slate-700 border-slate-100")}>
                      {isOverdue ? <WarningCircle size={14} weight="fill" /> : <Calendar size={14} weight="fill" />}
                      {isOverdue ? `Overdue (${Math.abs(group.worst_diff_days)}d)` 
                        : group.worst_diff_days === 0 ? "Due Today" 
                        : group.worst_diff_days > 0 ? `Due in ${group.worst_diff_days}d` 
                        : "Upcoming"}
                    </div>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      <Link to={`/patients/${group.child_id}`}>{group.first_name} {group.last_name}</Link>
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{group.age_in_months} Months Old</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-5 flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {group.vaccines.map((v, i) => (
                        <span key={i} className={cn("text-[10px] font-bold px-2 py-1 rounded-md border", v.status === "Overdue" ? "bg-white border-rose-200 text-rose-700" : "bg-white border-teal-200 text-teal-700")}>
                          {v.vaccine_type} · D{v.dose_number}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Users size={16} />
                      <p className="text-xs font-bold">{group.mother_complete_name}</p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <PhoneCall size={16} />
                      <p className="text-xs font-bold text-indigo-600">{group.contact_number || "NO RECORD"}</p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin size={16} />
                      <p className="text-xs font-bold truncate">{group.complete_address}</p>
                    </div>
                  </div>
                  <Link to={`/patients/${group.child_id}?tab=immunization`} className="mt-6 w-full py-3 bg-slate-900 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-all text-center uppercase tracking-widest">
                    Record Vaccine
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-8 py-4 rounded-2xl border border-slate-100 shadow-sm mt-8">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Showing {currentPage} of {totalPages} Pages
              </p>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all">
                  <CaretLeft size={20} weight="bold" />
                </button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all">
                  <CaretRight size={20} weight="bold" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showCallList && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col border border-slate-100">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <PhoneCall size={24} weight="duotone" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Tomorrow's Schedule</h3>
                  </div>
                </div>
                <button onClick={() => setShowCallList(false)} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                  <X size={24} weight="bold" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {tomorrowsList.length === 0 ? (
                  <div className="text-center py-20">
                    <CheckCircle size={40} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold text-sm">No follow-ups needed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tomorrowsList.map((group, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-base font-bold text-slate-900">{group.first_name} {group.last_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Guardian: {group.mother_complete_name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-indigo-600">{group.contact_number || "NO NUMBER"}</span>
                          <a href={`tel:${group.contact_number}`} className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
                            <PhoneCall size={20} weight="fill" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
