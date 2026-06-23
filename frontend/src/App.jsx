import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import RegisterComplaint from "./pages/RegisterComplaint";
import TrackComplaint from "./pages/TrackComplaint";
import AdminDashboard from "./pages/AdminDashboard";
import HeatMap from "./pages/HeatMap";
import Analytics from "./pages/Analytics";
import PublicVoting from "./pages/PublicVoting";
import WasteCollection from "./pages/WasteCollection";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import MyComplaints from "./pages/MyComplaints";
import DepartmentDashboard from "./pages/DepartmentDashboard";
import SubmitFeedback from "./pages/SubmitFeedback";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegisterComplaint />} />
            <Route path="/track" element={<TrackComplaint />} />
            <Route path="/heatmap" element={<HeatMap />} />
            <Route path="/vote" element={<PublicVoting />} />
            <Route path="/waste" element={<WasteCollection />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register-account" element={<Register />} />
            
            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-complaints"
              element={
                <ProtectedRoute>
                  <MyComplaints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback/:id"
              element={
                <ProtectedRoute>
                  <SubmitFeedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dept-dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin", "department_staff"]}>
                  <DepartmentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
  );
}
