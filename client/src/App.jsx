import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/DashboardPage/Dashboard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/AuthPage/Login"; 

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

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/patients" element={<div>Patient Directory Page</div>} />
                    <Route path="/pharmacy" element={<div>Pharmacy Dispensing Page</div>} />
                    <Route path="/inventory" element={<div>Inventory Management Page</div>} />
                    <Route path="/reports" element={<div>Reports Page</div>} />
                    <Route path="/audit" element={<div>Audit Logs Page</div>} />
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