import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import XSSDemo from './pages/public/XSSDemo';
import CustomerHome from './pages/customer/CustomerHome';
import CompanyDashboard from './pages/company/CompanyDashboard';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import './global.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/xss-demo" element={<XSSDemo />} />
        
        {/* Customer Routes */}
        <Route path="/customer" element={<CustomerHome />} />
        
        {/* Company Routes */}
        <Route path="/company" element={<CompanyDashboard />} />
        
        {/* Worker Routes */}
        <Route path="/worker" element={<WorkerDashboard />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
