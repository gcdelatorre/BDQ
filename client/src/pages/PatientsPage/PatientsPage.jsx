import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, MagnifyingGlass, Funnel } from "@phosphor-icons/react";
import { DataTable } from "@/components/ui/DataTable";
import patientService from "@/services/patientService";
import { cn } from "@/lib/utils";

import RegisterChildModal from "./components/RegisterChildModal";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (error) {
      console.error("Failed to load patients");
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
      header: "Status", 
      cell: (row) => (
        <span className={cn(
          "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
          row.se_status === 'NHTS' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-600 border-slate-200"
        )}>
          <div className={cn("w-1.5 h-1.5 rounded-full", row.se_status === 'NHTS' ? "bg-emerald-500" : "bg-slate-400")} />
          {row.se_status}
        </span>
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

  const filteredPatients = patients.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.family_serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Child Patients</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Directory of registered barangay health records.</p>
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
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-200 rounded-xl transition-all outline-none text-sm font-medium text-slate-900"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-xl font-bold border border-slate-100 hover:bg-slate-50 transition-all text-[11px] tracking-wider uppercase">
          <Funnel size={18} weight="bold" />
          Filters
        </button>
      </div>

      <div className="bg-white p-2 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
          </div>
        ) : (
          <DataTable columns={columns} data={filteredPatients} />
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
