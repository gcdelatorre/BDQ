import { cn } from "@/lib/utils";

export default function ProfileTabNav({ tabs, activeTab, onChange }) {
  return (
    <div className="overflow-x-auto -mx-1 px-1 pb-1 scrollbar-thin">
      <div className="inline-flex min-w-full sm:min-w-0 p-1 bg-slate-100/80 rounded-2xl border border-slate-100 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[11px] whitespace-nowrap transition-colors shrink-0",
                isActive
                  ? "bg-white text-teal-600 shadow-sm border border-slate-100"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
              )}
            >
              <Icon size={16} weight={isActive ? "duotone" : "bold"} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
