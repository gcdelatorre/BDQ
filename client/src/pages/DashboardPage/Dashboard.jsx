import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import StatCards from "./components/StatCards";
import RecentDispensing from "./components/RecentDispensing";
import StockAlerts from "./components/StockAlerts";
import RecentActivities from "./components/RecentActivities";
import UpcomingRecalls from "./components/UpcomingRecalls";
import pharmacyService from "@/services/pharmacyService";
import patientService from "@/services/patientService";
import auditService from "@/services/auditService";
import clinicalService from "@/services/clinicalService";
import { useAuth } from "@/contexts/AuthContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const RECENT_TX_LIMIT = 10;
const RECENT_LOG_LIMIT = 8;

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    dispensingCount: 0,
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
      const [meds, patientsData, recentHistory, dispensingCount, activities, recallList] = await Promise.all([
        pharmacyService.getAllMedicines(),
        patientService.getAllPatients(),
        pharmacyService.getDispensingHistory(RECENT_TX_LIMIT),
        pharmacyService.getDispensingCount(),
        auditService.getAllLogs(),
        clinicalService.getVaccineRecallList()
      ]);

      const lowStockMeds = meds.filter(m => (m.total_stock || 0) <= m.reorder_level);
      
      // Handle paginated response from patientService
      const totalPatients = patientsData?.meta?.total ?? (Array.isArray(patientsData) ? patientsData.length : 0);

      setStats({
        totalPatients,
        dispensingCount: dispensingCount || 0,
        lowStockCount: lowStockMeds.length
      });

      setHistory(recentHistory);

      // auditService.getAllLogs() returns { message, data: [...] } — extract the array
      const activityList = Array.isArray(activities) ? activities : (activities?.data || []);
      setLogs(activityList.slice(0, RECENT_LOG_LIMIT));
      setRecalls(recallList || []);

      setAlerts(lowStockMeds.map(m => ({
        medicine_id: m.medicine_id,
        type: (m.total_stock || 0) === 0 ? "Out of Stock" : "Low Stock",
        message: `${m.medicine_name} (${m.total_stock || 0} ${m.unit_of_measure} remaining)`
      })));
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayName = user?.first_name
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
    : "there";

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="page-shell space-y-8"
    >
      <motion.div variants={containerVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div variants={containerVariants}>
          <p className="text-[11px] font-bold uppercase tracking-widest text-teal-600 mb-1">Overview</p>
          <h2 className="page-title">Welcome back, {displayName}</h2>
          <p className="page-description">Today&apos;s snapshot for the barangay health center.</p>
        </motion.div>
      </motion.div>

      <StatCards stats={stats} loading={loading} />

      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <RecentDispensing transactions={history} loading={loading} />
          <RecentActivities logs={logs} loading={loading} />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <StockAlerts alerts={alerts} loading={loading} />
          <UpcomingRecalls recalls={recalls} loading={loading} />
        </div>
      </motion.div>
    </motion.div>
  );
}
