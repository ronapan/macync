/**
 * MaCync Main Routing Module
 * Implementation of Role-Based Access Control (RBAC) and Dynamic View Management.
 * This file serves as the Central Traffic Controller for the entire Frontend.
 */

import { Routes, Route, Navigate } from "react-router-dom";

// ==========================================
// 1. CORE & IDENTITY PAGES
// ==========================================
import Landing from "./pages/landing.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/login.jsx";
import Profile from './pages/profile.jsx';

// ==========================================
// 2. SHARED CONTENT PAGES
// ==========================================
import Home from './pages/home.jsx'; // Provincial News Feed & Announcements

// ==========================================
// 3. MODULE HUB COMPONENTS (REPORTING)
// ==========================================
import ReportPage from './pages/reportpage.jsx'; // Member Reporting Center
import BrgyDashboard from './pages/brgy/brgydashboard.jsx'; // Barangay Validation Center
import MuniDashboard from './pages/municipal/municipaldashboard.jsx'; // Municipal Coordination Center
import AdminDashboard from "./pages/admin/admindashboard.jsx"; // Provincial Executive Command

// ==========================================
// 4. MODULE HUB COMPONENTS (DONATIONS)
// ==========================================
import DonatePage from './pages/member/donationpage.jsx'; // Member Donation Submission
import AdminDonation from './pages/admin/admindonation.jsx'; // Provincial Treasury & Audit

function App() {
  /**
   * Session Management: 
   * Retrieves encrypted user profile and authorization level from Local Storage.
   */
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const userRole = userInfo?.role;

  return (
    <Routes>
      {/* --------------------------------------------------------- */}
      {/* PUBLIC ACCESS ROUTES                                      */}
      {/* --------------------------------------------------------- */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* --------------------------------------------------------- */}
      {/* PRIVATE ROUTES (Guarded by Session Verification)         */}
      {/* --------------------------------------------------------- */}

      /**
       * Dashboard Route (Shared Hub)
       * Displays real-time provincial environmental news feed for all authenticated roles.
       */
      <Route 
        path="/dashboard" 
        element={userInfo ? <Home /> : <Navigate to="/login" />} 
      />

      /**
       * Smart Reporting Hub (Context-Aware Routing)
       * Dynamically renders a specialized dashboard based on the User's RBAC role.
       * Logic: Admin  Municipal Officer  Barangay Officer  Member.
       */
      <Route 
        path="/report" 
        element={
          !userInfo ? (
            <Navigate to="/login" />
          ) : userRole === 'admin' ? (
            <AdminDashboard /> 
          ) : userRole === 'municipal_officer' ? (
            <MuniDashboard /> 
          ) : userRole === 'barangay_officer' ? (
            <BrgyDashboard /> 
          ) : (
            <ReportPage /> // Default Member Experience
          )
        }  
      />

      /**
       * Smart Donation Hub (Context-Aware Routing)
       * Separates the financial transaction entry (Member) from the Provincial Audit (Admin).
       */
      <Route 
        path="/donate" 
        element={
          !userInfo ? (
            <Navigate to="/login" /> 
          ) : userRole === 'admin' ? (
            <AdminDonation /> 
          ) : (
            <DonatePage /> // Member Donation Interface
          )
        } 
      />

      /**
       * Identity Management Route
       * Allows authenticated users to manage personal registry information and addresses.
       */
      <Route path="/profile" element={userInfo ? <Profile /> : <Navigate to="/login" />} />

      {/* --------------------------------------------------------- */}
      {/* FALLBACK REDIRECTS                                        */}
      {/* --------------------------------------------------------- */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;