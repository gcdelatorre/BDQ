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

export default function Dashboard() {
  // Mock data for now - will be replaced with real data from services later
  const mockAlerts = [
    { type: "Critical Stock", message: "Aspirin 75mg (Batch 002)" },
    { type: "Low Stock", message: "Paracetamol 500mg" }
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 pb-10"
    >
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Pharmacy Management</h2>
        <p className="text-slate-500 text-sm font-medium">Real-time inventory and prescription oversight</p>
      </div>

      {/* KPI Row */}
      <StatCards />

      {/* Middle Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <RecentDispensing />
        <StockAlerts alerts={mockAlerts} />
      </div>

      {/* Bottom Row */}
      <RecentActivities />
    </motion.div>
  );
}
