import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  MagnifyingGlass,
  Syringe,
  Calendar,
  MapPin,
  User,
  Users,
  CheckCircle,
  WarningCircle,
  ArrowLeft,
  CalendarBlank,
  PhoneCall
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

export default function VaccineRecallPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recalls, setRecalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all", "overdue", "upcoming"

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

  // Filter logic
  const filteredRecalls = recalls.filter((item) => {
    // 1. Tab filter
    if (activeTab === "overdue" && item.status !== "Overdue") return false;
    if (activeTab === "upcoming" && item.status !== "Upcoming") return false;

    // 2. Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const patientName = `${item.first_name} ${item.last_name}`.toLowerCase();
      const motherName = (item.mother_complete_name || "").toLowerCase();
      const fsn = (item.family_serial_number || "").toLowerCase();
      const vaccine = item.vaccine_type.toLowerCase();

      return patientName.includes(q) || motherName.includes(q) || fsn.includes(q) || vaccine.includes(q);
    }

    return true;
  });

  const handleNotify = (item) => {
    toast.success(
      "Notification Scheduled",
      `Follow-up notification initiated for ${item.first_name}'s mother (${item.mother_complete_name}).`
    );
  };

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
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Bell className="text-teal-600" weight="duotone" />
            Vaccine Recall Registry
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Clinical monitoring and follow-up notifications for scheduled pediatric immunization milestones
          </p>
        </div>
      </div>

      {/* Tabs and Search Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        {/* Tabs */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-xl w-full md:w-auto">
          {[
            { id: "all", label: "All Recalls", count: recalls.length },
            { id: "overdue", label: "Overdue", count: recalls.filter(r => r.status === "Overdue").length, color: "text-rose-600 bg-rose-50" },
            { id: "upcoming", label: "Upcoming (Next 7 Days)", count: recalls.filter(r => r.status === "Upcoming").length, color: "text-teal-700 bg-teal-50" }
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

        {/* Search */}
        <div className="relative w-full md:w-72">
          <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search name, mother, FSN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/80 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Main Recall List */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-400">Analyzing clinic schedule...</p>
          </div>
        ) : filteredRecalls.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/20">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <CalendarBlank size={32} className="text-slate-300" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No Recall Records Found</h4>
            <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
              All child immunization milestones for the selected range are complete or up to date.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Patient Info</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Target Vaccine</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Milestone Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Household / Address</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRecalls.map((recall, index) => {
                  const isOverdue = recall.status === "Overdue";

                  return (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Patient Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 border border-slate-100/50">
                            <User size={18} weight="bold" />
                          </div>
                          <div>
                            <Link
                              to={`/patients/${recall.child_id}`}
                              className="font-bold text-slate-900 hover:text-teal-600 transition-colors text-sm hover:underline"
                            >
                              {recall.first_name} {recall.last_name}
                            </Link>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                              {recall.age_in_months} Months Old
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Target Vaccine */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Syringe size={16} className="text-teal-500" />
                          <div>
                            <span className="font-bold text-slate-800 text-xs">
                              {recall.vaccine_type} Dose {recall.dose_number}
                            </span>
                            <span className="text-[9px] bg-slate-100 text-slate-500 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ml-2">
                              {recall.age_label}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Milestone Date */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Calendar size={14} className="text-slate-400" />
                            {new Date(recall.due_date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                              isOverdue
                                ? "bg-rose-50 border-rose-100/50 text-rose-700"
                                : "bg-teal-50 border-teal-100/50 text-teal-700"
                            )}
                          >
                            {isOverdue ? (
                              <>
                                <WarningCircle size={10} weight="fill" />
                                Overdue by {Math.abs(recall.diff_days)}d
                              </>
                            ) : (
                              <>
                                <CheckCircle size={10} weight="fill" />
                                {recall.diff_days === 0 ? "Due Today" : `Due in ${recall.diff_days}d`}
                              </>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Household / Address */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                            <Users size={12} className="text-slate-400" />
                            Mother: {recall.mother_complete_name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                            <MapPin size={12} className="text-slate-400" />
                            {recall.complete_address}
                          </p>
                          <span className="inline-block text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-widest mt-1">
                            FSN: {recall.family_serial_number}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleNotify(recall)}
                            title="Log Parent Contact"
                            className="p-2 bg-slate-50 hover:bg-teal-50 text-slate-500 hover:text-teal-600 rounded-lg border border-slate-100 hover:border-teal-100 transition-all duration-200"
                          >
                            <PhoneCall size={15} weight="bold" />
                          </button>
                          <Link
                            to={`/patients/${recall.child_id}?tab=immunization`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all duration-200 active:scale-95"
                          >
                            <Syringe size={14} weight="bold" />
                            Record Dose
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
