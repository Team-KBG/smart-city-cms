import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import RegisterComplaint from "./pages/RegisterComplaint";
import TrackComplaint from "./pages/TrackComplaint";
import AdminDashboard from "./pages/AdminDashboard";
import HeatMap from "./pages/HeatMap";
import Analytics from "./pages/Analytics";
import PublicVoting from "./pages/PublicVoting";
import WasteCollection from "./pages/WasteCollection";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Citizen routes (login required) */}
          <Route
            path="/register"
            element={
              <ProtectedRoute>
                <RegisterComplaint />
              </ProtectedRoute>
            }
          />

          <Route
            path="/track"
            element={
              <ProtectedRoute>
                <TrackComplaint />
              </ProtectedRoute>
            }
          />

          <Route
            path="/heatmap"
            element={
              <ProtectedRoute>
                <HeatMap />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vote"
            element={
              <ProtectedRoute>
                <PublicVoting />
              </ProtectedRoute>
            }
          />

          <Route
            path="/waste"
            element={
              <ProtectedRoute>
                <WasteCollection />
              </ProtectedRoute>
            }
          />

          {/* Admin-only routes */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute adminOnly={true}>
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="empty-state" style={{ marginTop: "80px" }}>
      <div className="empty-icon">🔍</div>
      <h3>Page Not Found</h3>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/" className="btn btn-primary" style={{ marginTop: "16px", textDecoration: "none" }}>
        Go Home
      </a>
    </div>
  );
}