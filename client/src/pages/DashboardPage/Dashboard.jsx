import { motion } from "framer-motion";
import StatCards from "./components/StatCards";
import RecentDispensing from "./components/RecentDispensing";
import StockAlerts from "./components/StockAlerts";
import RecentActivities from "./components/RecentActivities";

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

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePrescriptions: 0,
    lowStockCount: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [meds, patients, history] = await Promise.all([
        pharmacyService.getAllMedicines(),
        patientService.getAllPatients(),
        pharmacyService.getDispensingHistory()
      ]);

      const lowStockMeds = meds.filter(m => (m.total_stock || 0) <= m.reorder_level);

      setStats({
        totalPatients: patients.length,
        activePrescriptions: history.length,
        lowStockCount: lowStockMeds.length
      });

      setHistory(history);

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
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">BDQ Health Portal</h2>
        <p className="text-slate-500 text-sm font-medium">Real-time pediatric monitoring and healthcare management</p>
      </div>

      {/* KPI Row */}
      <StatCards stats={stats} />

      {/* Middle Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentDispensing transactions={history} />
        <StockAlerts alerts={alerts} loading={loading} />
      </div>

      {/* Bottom Row */}
      <RecentActivities />
    </motion.div>
  );
}
