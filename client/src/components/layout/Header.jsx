import { MagnifyingGlass, Bell, Sun, User } from "@phosphor-icons/react";
import { useAuth } from "../../contexts/AuthContext";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-10 flex items-center justify-between border-b border-slate-100">


      {/* User Profile */}
      <div className="flex items-center gap-3 pl-6 border-l border-slate-100 ml-auto">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-slate-900 leading-tight">{user?.first_name} {user?.last_name}</p>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{user?.role}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 border border-slate-200">
          <User size={20} />
        </div>
      </div>
    </header >
  );
}
