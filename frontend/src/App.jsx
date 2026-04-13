import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/landing.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/login.jsx";
import Profile from './pages/profile.jsx';
import DonatePage from './pages/member/donationpage.jsx'; // Para sa Member
import AdminDonation from './pages/admin/admindonation.jsx'; // Para sa Admin

// Import all role-based components
import Home from './pages/home.jsx'; // Shared Dashboard (News Feed)
import ReportPage from './pages/reportpage.jsx'; // Member View
import BrgyDashboard from './pages/brgy/brgydashboard.jsx'; // Brgy Officer View
import MuniDashboard from './pages/municipal/municipaldashboard.jsx'; // Municipal Officer View
import AdminDashboard from "./pages/admin/admindashboard.jsx";

function App() {
  // Kunin ang user info mula sa localStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const userRole = userInfo?.role;

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* DASHBOARD (Shared Home - Announcements) */}
      <Route 
        path="/dashboard" 
        element={userInfo ? <Home /> : <Navigate to="/login" />} 
      />

      {/* THE SMART REPORT HUB (Strict Role Switching) */}
      <Route 
        path="/report" 
        element={
          !userInfo ? (
            <Navigate to="/login" />
          ) : userRole === 'admin' ? (
            <AdminDashboard /> // Admin View
          ) : userRole === 'municipal_officer' ? (
            <MuniDashboard /> // Municipal View
          ) : userRole === 'barangay_officer' ? (
            <BrgyDashboard /> // Barangay View
          ) : (
            <ReportPage />    // Member View (Default)
          )
        }  
      />

      <Route 
        path="/donate" 
        element={
          !userInfo ? <Navigate to="/login" /> : 
          userRole === 'admin' ? <AdminDonation /> : <DonatePage />
        } 
      />


      <Route path="/profile" element={userInfo ? <Profile /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;