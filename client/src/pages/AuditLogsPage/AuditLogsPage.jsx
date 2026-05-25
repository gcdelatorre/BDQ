import { useState, useEffect } from "react";
import {
  ClockCounterClockwise,
  MagnifyingGlass,
  UserCircle,
  Tag,
  ShieldCheck,
  Pulse,
  CaretLeft,
  CaretRight,
  ChartLineUp,
  PlusCircle,
  NotePencil
} from "@phosphor-icons/react";
import auditService from "@/services/auditService";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

export default function AuditLogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, currentPage: 1 });
  const [stats, setStats] = useState({
    total_signals: 0,
    today_count: 0,
    creations: 0,
    modifications: 0
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [currentPage, filterAction, startDate, endDate]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else fetchLogs();
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const fetchStats = async () => {
    try {
      const data = await auditService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Stats Fetch Error:", error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await auditService.getAllLogs({
        page: currentPage,
        limit,
        actionType: filterAction,
        search: searchQuery,
        startDate,
        endDate
      });

      setLogs(response.data || []);
      setMeta(response.meta || { total: 0, totalPages: 1, currentPage: 1 });
    } catch (error) {
      console.error("Audit Fetch Error:", error);
      toast.error("Telemetry Error", "Failed to retrieve security logs from server.");
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (type) => {
    switch (type) {
      case "CREATE": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "UPDATE": return "bg-blue-50 text-blue-700 border-blue-100";
      case "DELETE": return "bg-rose-50 text-rose-700 border-rose-100";
      case "LOGIN": return "bg-purple-50 text-purple-700 border-purple-100";
      default: return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="page-title">Security Audit Logs</h2>
          <p className="page-description text-slate-500 font-medium text-sm mt-1">Immutable record of all system activity and data mutations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setCurrentPage(1); fetchLogs(); fetchStats(); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-100 text-slate-600 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all text-[11px] uppercase tracking-widest"
          >
            <ClockCounterClockwise size={18} weight="bold" />
            Refresh Logs
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center border border-teal-100 shadow-sm">
            <Pulse size={24} weight="duotone" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Total Activities</p>
            <h3 className="text-xl font-black text-slate-900 leading-none">{stats.total_signals}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm">
            <ChartLineUp size={24} weight="duotone" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Activities Today</p>
            <h3 className="text-xl font-black text-slate-900 leading-none">{stats.today_count}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 shadow-sm">
            <ShieldCheck size={24} weight="duotone" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Clinical Records</p>
            <h3 className="text-xl font-black text-slate-900 leading-none">{stats.clinical_records}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100 shadow-sm">
            <UserCircle size={24} weight="duotone" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">New Patients</p>
            <h3 className="text-xl font-black text-slate-900 leading-none">{stats.new_patients}</h3>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative group">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search user or detail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-200 rounded-xl outline-none text-sm font-medium text-slate-900 border"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none shadow-sm focus:border-teal-500 transition-all appearance-none"
          >
            <option value="ALL">All Operations</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none shadow-sm focus:border-teal-500 transition-all"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none shadow-sm focus:border-teal-500 transition-all"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time & Date</th>
                <th className="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Authorized User</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Action</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activity Details</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-bold text-sm">Synchronizing security logs...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <ShieldCheck size={48} weight="duotone" className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold text-sm text-center">No audit logs found.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-bold text-slate-900 leading-tight">
                          {new Date(log.timestamp).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                        <p className="text-[11px] font-bold text-teal-600 uppercase tracking-widest">
                          {new Date(log.timestamp).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true 
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-white transition-colors">
                          <UserCircle size={20} />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-slate-900 leading-none mb-1">{log.username || "System"}</p>
                          <p className="text-[7px] font-normal text-slate-400 uppercase leading-none">Role: {log.user_role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border",
                        getActionColor(log.action_type)
                      )}>
                        {log.action_type}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-[12px] font-medium text-slate-600 max-w-sm leading-relaxed">
                        {log.details}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Tag size={14} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.table_name}</span>
                        {log.entity_id && (
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg font-bold text-slate-500 border border-slate-200">#{log.entity_id}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Controller */}
        {meta.totalPages > 1 && (
          <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, meta.total)} of {meta.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-teal-600 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <CaretLeft size={18} weight="bold" />
              </button>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Page {currentPage} of {meta.totalPages}</span>
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={currentPage === meta.totalPages || loading}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-teal-600 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <CaretRight size={18} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
