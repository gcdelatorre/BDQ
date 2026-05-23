import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/DashboardPage/Dashboard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/AuthPage/Login"; 
import PatientsPage from "./pages/PatientsPage/PatientsPage";
import PatientProfile from "./pages/PatientsPage/PatientProfile";
import PharmacyPage from "./pages/PharmacyPage/PharmacyPage";
import InventoryPage from "./pages/InventoryPage/InventoryPage";
import AuditLogsPage from "./pages/AuditLogsPage/AuditLogsPage";
import VaccineRecallPage from "./pages/VaccineRecallPage/VaccineRecallPage";
import { Toaster } from "@/components/ui/sonner";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

/**
 * Role-based route guard.
 * If the user's role is NOT in the allowed list, redirect to Dashboard.
 */
const RoleRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="bottom-center" closeButton />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/patients" element={<PatientsPage />} />
                    <Route path="/patients/:id" element={<PatientProfile />} />
                    <Route path="/pharmacy" element={
                      <RoleRoute allowedRoles={["Nurse", "Midwife"]}>
                        <PharmacyPage />
                      </RoleRoute>
                    } />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/audit" element={
                      <RoleRoute allowedRoles={["Nurse", "Midwife"]}>
                        <AuditLogsPage />
                      </RoleRoute>
                    } />
                    <Route path="/recall" element={
                      <RoleRoute allowedRoles={["Nurse", "Midwife"]}>
                        <VaccineRecallPage />
                      </RoleRoute>
                    } />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}