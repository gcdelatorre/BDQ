import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Router>
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
    </Router>
  );
}