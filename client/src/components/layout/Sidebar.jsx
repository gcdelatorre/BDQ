import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Pill, 
  ClipboardList, 
  History, 
  BarChart3, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuSections = [
  {
    title: "Clinical",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/" },
      { icon: Users, label: "Patients", path: "/patients" },
    ]
  },
  {
    title: "Operations",
    items: [
      { icon: Pill, label: "Pharmacy", path: "/pharmacy" },
      { icon: ClipboardList, label: "Inventory", path: "/inventory" },
    ]
  },
  {
    title: "Finance & Insights",
    items: [
      { icon: BarChart3, label: "Reports", path: "/reports" },
      { icon: History, label: "Audit Logs", path: "/audit" },
    ]
  }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-20">
      <div className="p-8">
        <h1 className="text-xl font-bold text-teal-600 flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center text-white text-xs">
            BDQ
          </div>
          BDQ Health
        </h1>
      </div>

      <nav className="flex-1 px-6 space-y-8 overflow-y-auto">
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h3 className="text-[11px] uppercase font-bold text-slate-700 tracking-widest px-4">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-[16px]",
                      isActive 
                        ? "bg-teal-50/50 text-teal-600 font-semibold" 
                        : "text-slate-950 hover:bg-slate-50 hover:text-slate-900"
                    )}  
                  >
                    <item.icon className={cn(
                      "w-5 h-5",
                      isActive ? "text-teal-700" : "text-slate-500 group-hover:text-teal-600"
                    )} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-50">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
