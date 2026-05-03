export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Health Center Overview</h2>
        <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Top Row: 3 Columns - KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-32 flex flex-col justify-center">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Patients</p>
          <h3 className="text-3xl font-bold text-slate-900">--</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-32 flex flex-col justify-center">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Active Prescriptions</p>
          <h3 className="text-3xl font-bold text-slate-900">--</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-32 flex flex-col justify-center">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Low Stock Items</p>
          <h3 className="text-3xl font-bold text-red-600">--</h3>
        </div>
      </div>

      {/* Middle Row: 2/3 and 1/3 split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[300px]">
          <h4 className="font-bold text-slate-900 mb-4">Recent Dispensing</h4>
          <div className="text-slate-400 text-center py-20 italic">No recent transactions</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[300px]">
          <h4 className="font-bold text-slate-900 mb-4 text-red-600">Low Stock Alerts</h4>
          <div className="text-slate-400 text-center py-20 italic">Stock levels healthy</div>
        </div>
      </div>

      {/* Bottom Row: Full Width */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[300px]">
        <h4 className="font-bold text-slate-900 mb-4">Recent Activities</h4>
        <div className="text-slate-400 text-center py-20 italic">Activity log is empty</div>
      </div>
    </div>
  );
}
