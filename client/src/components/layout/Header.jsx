import { Search, Bell, Sun, User } from "lucide-react";

export default function Header() {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between border-b border-slate-100">
      <div className="relative w-96 group">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
        <input
          type="text"
          placeholder="Search patients, appointments, records..."
          className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:border-teal-100 focus:ring-4 focus:ring-teal-50 rounded-xl text-sm transition-all outline-none"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
            <Sun className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        <div className="h-8 w-[1px] bg-slate-100"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-tight">Admin User</p>
            <p className="text-xs text-slate-500">System Administrator</p>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
