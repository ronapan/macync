import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/landing.jsx";
import Register from "./pages/register.jsx";
import Login from "./pages/login.jsx";
import Profile from "./pages/profile.jsx";

import DonatePage from "./pages/member/donationpage.jsx";
import AdminDonation from "./pages/admin/admindonation.jsx";

import Home from "./pages/home.jsx";
import ReportPage from "./pages/reportpage.jsx";
import BrgyDashboard from "./pages/brgy/brgydashboard.jsx";
import MuniDashboard from "./pages/municipal/municipaldashboard.jsx";
import AdminDashboard from "./pages/admin/admindashboard.jsx";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getUserInfo() {
  try {
    return JSON.parse(localStorage.getItem("userInfo")) ?? null;
  } catch {
    return null;
  }
}

// Redirects to /login if not authenticated
function PrivateRoute({ children }) {
  const userInfo = getUserInfo();
  return userInfo ? children : <Navigate to="/login" replace />;
}

// Renders the correct component based on the user's role
function RoleBasedRoute({ roleMap, fallback = null }) {
  const userInfo = getUserInfo();

  if (!userInfo) return <Navigate to="/login" replace />;

  const component = roleMap[userInfo.role] ?? fallback;

  if (!component) return <Navigate to="/dashboard" replace />;

  return component;
}

// ─── App ─────────────────────────────────────────────────────────────────────

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* SHARED DASHBOARD — accessible by all logged-in users */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      {/* REPORT — role-based view */}
      <Route
        path="/report"
        element={
          <RoleBasedRoute
            roleMap={{
              admin: <AdminDashboard />,
              municipal_officer: <MuniDashboard />,
              barangay_officer: <BrgyDashboard />,
              member: <ReportPage />,
            }}
            fallback={<ReportPage />} // default para sa ibang roles
          />
        }
      />

      {/* DONATE — role-based view */}
      <Route
        path="/donate"
        element={
          <RoleBasedRoute
            roleMap={{
              admin: <AdminDonation />,
              municipal_officer: <AdminDonation />, // i-adjust kung kailangan
              barangay_officer: <AdminDonation />,  // i-adjust kung kailangan
              member: <DonatePage />,
            }}
            fallback={<DonatePage />} // default
          />
        }
      />

      {/* PROFILE */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      {/* CATCH-ALL — para hindi mag-404 sa Vercel */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;