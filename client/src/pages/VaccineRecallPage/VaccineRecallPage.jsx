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
  CaretRight
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

  // 1. Group recalls by patient FIRST, so tabs/counts are accurate per patient
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
          worst_diff_days: Infinity, // For determining overall status
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

  // 2. Filter grouped records based on tabs and search
  const filteredGroups = useMemo(() => {
    return groupedRecalls.filter((group) => {
      // Tab filter
      if (activeTab === "overdue" && !group.has_overdue) return false;
      if (activeTab === "upcoming" && !group.has_upcoming) return false;

      // Search filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const patientName = `${group.first_name} ${group.last_name}`.toLowerCase();
        const motherName = (group.mother_complete_name || "").toLowerCase();
        const fsn = (group.family_serial_number || "").toLowerCase();
        // Check if any vaccine matches
        const vaccineMatch = group.vaccines.some(v => v.vaccine_type.toLowerCase().includes(q));

        return patientName.includes(q) || motherName.includes(q) || fsn.includes(q) || vaccineMatch;
      }
      return true;
    });
  }, [groupedRecalls, activeTab, searchQuery]);

  // 3. Pagination logic
  const totalPages = Math.ceil(filteredGroups.length / ITEMS_PER_PAGE);
  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGroups.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGroups, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Tomorrow's patients (diff_days === 1)
  const tomorrowsList = useMemo(() => {
    return groupedRecalls.filter(g => g.vaccines.some(v => v.diff_days === 1));
  }, [groupedRecalls]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-12"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="page-title">Vaccine Recall Registry</h1>
          <p className="page-description">
            Monitor due vaccines and access contact information for patient follow-ups.
          </p>
        </div>

        <button
          onClick={() => setShowCallList(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
        >
          <PhoneCall size={20} weight="fill" />
          Tomorrow's Call List
        </button>
      </div>

      {/* Tabs and Search Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex bg-slate-100/80 p-1.5 rounded-xl w-full md:w-auto">
          {[
            { id: "all", label: "All Patients", count: groupedRecalls.length },
            { id: "overdue", label: "Overdue", count: groupedRecalls.filter(g => g.has_overdue).length, color: "text-rose-600 bg-rose-50" },
            { id: "upcoming", label: "Upcoming", count: groupedRecalls.filter(g => g.has_upcoming).length, color: "text-teal-700 bg-teal-50" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {tab.label}
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black",
                activeTab === tab.id
                  ? (tab.color || "bg-slate-100 text-slate-700")
                  : "bg-slate-200/50 text-slate-500"
              )}>
                {tab.count}
              </span>
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
            className="w-full pl-10 pr-4 py-3 text-sm font-medium bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/80 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-3xl border border-slate-100">
          <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400">Loading recall data...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <CheckCircle size={40} weight="duotone" className="text-slate-300" />
          </div>
          <h4 className="font-bold text-slate-800 text-lg">All caught up!</h4>
          <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
            No patients are currently due or overdue for vaccines based on your filters.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedGroups.map((group, index) => {
              const isDefaulter = group.worst_diff_days < -30;
              const isOverdue = group.has_overdue;

              return (
                <motion.div
                  key={group.child_id}
                  variants={itemVariants}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col"
                >
                  {/* Status Indicator Line at the top */}
                  <div className={cn(
                    "absolute top-0 left-0 w-full h-1",
                    isDefaulter ? "bg-rose-600" : isOverdue ? "bg-orange-400" : "bg-teal-500"
                  )} />

                  {/* Header: Date Status & Action */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold",
                      isDefaulter ? "bg-rose-50 text-rose-700"
                        : isOverdue ? "bg-orange-50 text-orange-700"
                          : "bg-teal-50 text-teal-700"
                    )}>
                      {isOverdue ? <WarningCircle size={14} weight="fill" /> : <Calendar size={14} weight="fill" />}
                      {isDefaulter ? `Defaulter (${Math.abs(group.worst_diff_days)}d late)`
                        : isOverdue ? `Overdue by ${Math.abs(group.worst_diff_days)}d`
                          : group.worst_diff_days === 0 ? "Due Today" : `Due in ${group.worst_diff_days}d`}
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 hover:text-teal-600 transition-colors">
                      <Link to={`/patients/${group.child_id}`}>{group.first_name} {group.last_name}</Link>
                    </h3>
                    <p className="text-sm font-semibold text-slate-500 mt-1">
                      {group.age_in_months} Months Old
                    </p>
                  </div>

                  {/* Target Vaccines List */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-5 flex-1 space-y-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Scheduled Vaccines</p>
                    <div className="flex flex-wrap gap-2">
                      {group.vaccines.map((v, i) => (
                        <span key={i} className={cn(
                          "text-xs font-bold px-2 py-1 rounded-md border",
                          v.status === "Overdue" ? "bg-white border-orange-200 text-orange-700" : "bg-white border-teal-200 text-teal-700"
                        )}>
                          {v.vaccine_type} D{v.dose_number}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Mother/Guardian</p>
                        <p className="text-sm font-bold text-slate-700">{group.mother_complete_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneCall size={16} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Contact Number</p>
                        <p className="text-sm font-bold text-indigo-600">{group.contact_number || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Address</p>
                        <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]" title={group.complete_address}>
                          {group.complete_address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Record Action */}
                  <Link
                    to={`/patients/${group.child_id}?tab=immunization`}
                    className="mt-6 w-full py-3 bg-slate-900 hover:bg-teal-600 text-white rounded-xl text-sm font-bold shadow-sm transition-all text-center flex justify-center items-center gap-2 active:scale-95"
                  >
                    <Syringe size={16} weight="bold" />
                    Record Vaccine Now
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm mt-8">
              <p className="text-sm font-bold text-slate-500">
                Showing <span className="text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredGroups.length)}</span> of <span className="text-slate-900">{filteredGroups.length}</span> patients
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <CaretLeft size={20} weight="bold" />
                </button>
                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={cn(
                        "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all",
                        currentPage === idx + 1 ? "bg-teal-600 text-white" : "text-slate-500 hover:bg-slate-100"
                      )}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <CaretRight size={20} weight="bold" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tomorrow's Call List Modal */}
      <AnimatePresence>
        {showCallList && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <PhoneCall size={22} weight="duotone" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold">Call List</p>
                    <h3 className="text-lg font-bold text-slate-900">Tomorrow's Schedule</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCallList(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                  aria-label="Close call list"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {tomorrowsList.length === 0 ? (
                  <div className="flex h-60 flex-col items-center justify-center text-center">
                    <CheckCircle size={40} weight="duotone" className="text-slate-300 mb-3" />
                    <p className="text-sm text-slate-500 font-medium">No calls needed for tomorrow.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-130 overflow-y-auto custom-scrollbar pr-2">
                    {tomorrowsList.map((group, idx) => (
                      <div key={idx} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        {/* Patient Row Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {group.first_name} {group.last_name}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Mother: {group.mother_complete_name}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-indigo-600 border border-slate-200 self-start sm:self-center">
                            <PhoneCall size={14} weight="fill" />
                            {group.contact_number || "No number listed"}
                          </span>
                        </div>

                        {/* Content Grid */}
                        <div className="mt-3 grid gap-2 sm:grid-cols-1">
                          <div className="rounded-2xl bg-white p-3 border border-slate-200">
                            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold mb-2">
                              Required Vaccines
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {group.vaccines
                                .filter((v) => v.diff_days === 1)
                                .map((v, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex font-bold text-xs text-teal-700 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-100"
                                  >
                                    {v.vaccine_type} D{v.dose_number}
                                  </span>
                                ))}
                            </div>
                          </div>
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
