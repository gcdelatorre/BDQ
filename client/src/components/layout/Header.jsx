import { MagnifyingGlass, Bell, Sun, User } from "@phosphor-icons/react";
import { useAuth } from "../../contexts/AuthContext";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-10 flex items-center justify-between border-b border-slate-100">
      <div className="relative w-96 group">
        <MagnifyingGlass className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
        <input
          type="text"
          placeholder="Search records, patients..."
          className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:border-teal-100 focus:ring-4 focus:ring-teal-50 rounded-2xl text-sm transition-all outline-none"
        />
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-slate-900 leading-tight">{user?.first_name} {user?.last_name}</p>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{user?.role}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 shadow-lg shadow-slate-200">
          <User size={20} />
        </div>
      </div>
    </header >
  );
}
