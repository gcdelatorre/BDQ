import { motion } from "framer-motion";
import StatCards from "./components/StatCards";
import RecentDispensing from "./components/RecentDispensing";
import StockAlerts from "./components/StockAlerts";
import RecentActivities from "./components/RecentActivities";
import UpcomingRecalls from "./components/UpcomingRecalls";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

import { useState, useEffect } from "react";
import pharmacyService from "@/services/pharmacyService";
import patientService from "@/services/patientService";
import auditService from "@/services/auditService";
import clinicalService from "@/services/clinicalService";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePrescriptions: 0,
    lowStockCount: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [recalls, setRecalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [meds, patients, history, activities, recallList] = await Promise.all([
        pharmacyService.getAllMedicines(),
        patientService.getAllPatients(),
        pharmacyService.getDispensingHistory(),
        auditService.getAllLogs(),
        clinicalService.getVaccineRecallList()
      ]);

      const lowStockMeds = meds.filter(m => (m.total_stock || 0) <= m.reorder_level);

      setStats({
        totalPatients: patients.length,
        activePrescriptions: history.length,
        lowStockCount: lowStockMeds.length
      });

      setHistory(history);
      setLogs(activities || []);
      setRecalls(recallList || []);

      setAlerts(lowStockMeds.map(m => ({
        type: (m.total_stock || 0) === 0 ? "Out of Stock" : "Low Stock",
        message: `${m.medicine_name} (${m.total_stock || 0} ${m.unit_of_measure} remaining)`
      })));

    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back, Admin! 👋</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Here is what's happening in the barangay health center today.</p>
        </div>
      </div>

      {/* KPI Row */}
      <StatCards stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Primary Info) */}
        <div className="lg:col-span-8 space-y-6">
          <RecentDispensing transactions={history} />
          <RecentActivities logs={logs} />
        </div>

        {/* Right Column (Alerts & Reminders) */}
        <div className="lg:col-span-4 space-y-6">
          <StockAlerts alerts={alerts} loading={loading} />
          <UpcomingRecalls recalls={recalls} loading={loading} />
        </div>
      </div>
    </motion.div>
  );
}
