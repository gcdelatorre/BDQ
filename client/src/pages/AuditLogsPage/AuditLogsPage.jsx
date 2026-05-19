import { useState, useEffect } from "react";
import { 
  ClockCounterClockwise, 
  MagnifyingGlass, 
  Funnel, 
  UserCircle, 
  Tag, 
  Calendar,
  ShieldCheck,
  FileText,
  Pulse,
  ArrowRight
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import auditService from "@/services/auditService";
import { useToast } from "@/hooks/useToast";
import { cn, formatRelativeTime } from "@/lib/utils";

export default function AuditLogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await auditService.getAllLogs();
      setLogs(data);
    } catch (error) {
      console.error("Audit Fetch Error:", error);
      toast.error("Access Denied", "Only administrators can view audit logs.");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === "ALL" || log.action_type === filterAction;
    return matchesSearch && matchesAction;
  });

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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Security Audit Logs</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Immutable record of all system activity and data mutations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLogs}
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
            <h3 className="text-xl font-black text-slate-900 leading-none">{logs.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm">
            <Calendar size={24} weight="duotone" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Today's Logs</p>
            <h3 className="text-xl font-black text-slate-900 leading-none">
              {logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100 shadow-sm">
            <ShieldCheck size={24} weight="duotone" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Security Level</p>
            <h3 className="text-xl font-black text-slate-900 leading-none text-emerald-600">Active</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100 shadow-sm">
            <UserCircle size={24} weight="duotone" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Active Users</p>
            <h3 className="text-xl font-black text-slate-900 leading-none">
              {new Set(logs.map(l => l.username)).size}
            </h3>
          </div>
        </div>
      </div>

      {/* Standard Search Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by username or activity details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-200 rounded-xl transition-all outline-none text-sm font-medium text-slate-900 border"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Action Type:</span>
          <select 
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none shadow-sm focus:border-teal-500 transition-all"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time & Date</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized User</th>
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
                    <p className="text-slate-400 font-bold text-sm">Loading security logs...</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <ShieldCheck size={48} weight="duotone" className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold text-sm text-center">No audit logs found.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="space-y-0.5">
                        <p className="text-[14px] font-bold text-slate-900 leading-tight">{formatRelativeTime(log.timestamp)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-white transition-colors">
                          <UserCircle size={20} />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-slate-900 leading-none mb-1">{log.username || "System"}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Role: {log.user_role}</p>
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
                      <p className="text-[13px] font-medium text-slate-600 max-w-sm leading-relaxed">
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
      </div>
    </div>
  );
}
