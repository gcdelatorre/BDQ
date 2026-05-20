import { Link } from "react-router-dom";
import { CalendarCheck, Bell, CaretRight } from "@phosphor-icons/react";
import { DashboardPanel } from "@/components/ui/card";

export default function UpcomingRecalls({ recalls = [], loading }) {
  const upcomingRecalls = recalls
    .filter((r) => r.status === "Upcoming")
    .slice(0, 3);

  return (
    <DashboardPanel
      title="Vaccine Recalls"
      icon={Bell}
      bodyClassName="!p-0"
      action={
        <Link to="/recall" className="link-subtle shrink-0">
          View all <CaretRight size={12} weight="bold" />
        </Link>
      }
    >
      <div className="px-6 py-5 min-h-[200px]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
          </div>
        ) : upcomingRecalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center mb-3 border border-slate-100">
              <CalendarCheck size={22} className="text-slate-300" />
            </div>
            <p className="font-bold text-sm text-slate-500">No upcoming recalls</p>
            <p className="text-xs text-slate-400 mt-1">Due within the next week</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {upcomingRecalls.map((recall) => (
              <li key={`${recall.child_id}-${recall.vaccine_type}-${recall.dose_number}`}>
                <Link
                  to="/recall"
                  className="flex gap-3 p-3 bg-teal-50/50 hover:bg-teal-50 border border-teal-100/60 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-teal-600 shrink-0 border border-teal-100/50 shadow-sm">
                    <CalendarCheck size={20} weight="duotone" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900 text-sm truncate">
                        {recall.first_name} {recall.last_name}
                      </p>
                      <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-black uppercase tracking-wider whitespace-nowrap shrink-0">
                        {recall.vaccine_type} #{recall.dose_number}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Due {new Date(recall.due_date).toLocaleDateString([], { month: "short", day: "numeric" })}
                      <span className="text-slate-400">
                        {" "}
                        ({recall.diff_days === 0 ? "Today" : `in ${recall.diff_days}d`})
                      </span>
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardPanel>
  );
}
