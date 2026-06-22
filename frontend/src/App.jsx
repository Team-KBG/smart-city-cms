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

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterComplaint />} />
          <Route path="/track" element={<TrackComplaint />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/heatmap" element={<HeatMap />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/vote" element={<PublicVoting />} />
          <Route path="/waste" element={<WasteCollection />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
