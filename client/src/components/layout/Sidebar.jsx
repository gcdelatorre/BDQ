import { Link, useLocation } from "react-router-dom";
import { 
  SquaresFour, 
  UsersThree, 
  Pill, 
  ClipboardText, 
  ChartBar, 
  ClockCounterClockwise, 
  SignOut,
  FirstAid
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import LOGO1 from "@/assets/logo1.png";

const menuGroups = [
  {
    title: "General",
    items: [
      { label: "Dashboard", path: "/", icon: SquaresFour },
    ]
  },
  {
    title: "Clinical",
    items: [
      { label: "Patients", path: "/patients", icon: UsersThree },
      { label: "Pharmacy", path: "/pharmacy", icon: Pill },
      { label: "Inventory", path: "/inventory", icon: ClipboardText },
    ]
  },
  {
    title: "Insights",
    items: [
      { label: "Reports", path: "/reports", icon: ChartBar },
      { label: "Audit Logs", path: "/audit", icon: ClockCounterClockwise },
    ]
  }
];

export default function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-50">
      {/* Branding Area */}
      <div className="h-20 flex items-center px-8 my-2">
        <img 
          src={LOGO1} 
          alt="Meditech Logo" 
          className="h-10 w-auto object-contain" 
        />
      </div>

      {/* Grouped Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto space-y-6">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-4 text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-2">
              {group.title}
            </p>
            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-teal-50/50 text-teal-600 font-semibold" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon 
                    size={24} 
                    weight={isActive ? "duotone" : "regular"}
                    className={cn(
                      "transition-all",
                      isActive ? "text-teal-600" : "text-slate-400 group-hover:text-teal-600"
                    )}
                  />
                  <span className="text-[15px] group-hover:text-teal-600">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-50">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all group"
        >
          <SignOut size={20} weight="regular" className="group-hover:translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
