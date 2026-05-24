import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, MagnifyingGlass, Funnel, Copy, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { DataTable } from "@/components/ui/DataTable";
import patientService from "@/services/patientService";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

import RegisterChildModal from "./components/RegisterChildModal";

function PatientsPage() {
  const { toast } = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination State
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, currentPage: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 15;

  useEffect(() => {
    fetchPatients();
  }, [currentPage]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else fetchPatients();
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.getAllPatients({
        search: searchTerm,
        page: currentPage,
        limit
      });

      setPatients(response.data || []);
      setMeta(response.meta || { total: 0, totalPages: 1, currentPage: 1 });
    } catch (error) {
      console.error("Failed to load patients");
      toast.error("Error", "Could not load patient records.");
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
    if (years === 0) return `${months} Mo`;
    return `${years}y ${months}m`;
  };

  const columns = [
    {
      header: "Patient Name",
      cell: (row) => (
        <div className="flex flex-col">
          <p className="font-bold text-slate-900 text-[14px] leading-tight">{row.first_name} {row.last_name}</p>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">ID: {row.child_id}</p>
        </div>
      )
    },
    {
      header: "Sex",
      cell: (row) => (
        <span className={cn(
          "px-3 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
          row.sex === 'M' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-pink-50 text-pink-700 border-pink-100"
        )}>
          {row.sex === 'M' ? "Male" : "Female"}
        </span>
      )
    },
    {
      header: "Age",
      cell: (row) => (
        <span className="text-slate-700 font-bold text-sm">
          {calculateAge(row.date_of_birth)}
        </span>
      )
    },
    {
      header: "Mother's Name",
      cell: (row) => (
        <span className="text-slate-600 font-medium text-sm">
          {row.mother_complete_name}
        </span>
      )
    },
    {
      header: "Family Serial Number",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-slate-700 font-bold text-sm truncate max-w-35 block">
            {row.family_serial_number}
          </span>
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              try {
                await navigator.clipboard.writeText(row.family_serial_number);
                toast.success("Copied", "Family serial number copied to clipboard.");
              } catch (error) {
                toast.error("Copy Failed", "Please copy manually.");
              }
            }}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-teal-600 transition-all"
          >
            <Copy size={16} weight="bold" />
          </button>
        </div>
      )
    },
    {
      header: "Action",
      cell: (row) => (
        <Link
          to={`/patients/${row.child_id}`}
          className="text-teal-600 font-bold text-xs hover:text-teal-800 underline decoration-2 underline-offset-4 transition-all"
        >
          VIEW PROFILE
        </Link>
      )
    }
  ];

  return (
    <div className="page-shell">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Child Patients</h1>
          <p className="page-description">Directory of registered barangay health records.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
        >
          <Plus size={18} weight="bold" />
          Register Child
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name or family serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-200 rounded-xl transition-all outline-none text-sm font-medium text-slate-900 border"
          />
        </div>
      </div>

      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
            </div>
          ) : (
            <DataTable columns={columns} data={patients} />
          )}
        </div>

        {/* Server-Side Pagination Controller */}
        {meta.totalPages > 1 && (
          <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between mt-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, meta.total)} of {meta.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all"
              >
                <CaretLeft size={16} weight="bold" />
              </button>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Page {currentPage} of {meta.totalPages}</span>
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={currentPage === meta.totalPages || loading}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all"
              >
                <CaretRight size={16} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </div>

      <RegisterChildModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchPatients}
      />
    </div>
  );
}

export default PatientsPage;
