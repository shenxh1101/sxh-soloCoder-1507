import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import VehicleList from "@/pages/VehicleList";
import VehicleDetail from "@/pages/VehicleDetail";
import VehicleForm from "@/pages/VehicleForm";
import RecordList from "@/pages/RecordList";
import RecordForm from "@/pages/RecordForm";
import ReminderList from "@/pages/ReminderList";
import FollowUpCenter from "@/pages/FollowUpCenter";
import Statistics from "@/pages/Statistics";
import SettingsPage from "@/pages/SettingsPage";
import PrintPage from "@/pages/PrintPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/print/:id" element={<PrintPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vehicles" element={<VehicleList />} />
          <Route path="/vehicles/new" element={<VehicleForm />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
          <Route path="/vehicles/:id/edit" element={<VehicleForm />} />
          <Route path="/records" element={<RecordList />} />
          <Route path="/records/new" element={<RecordForm />} />
          <Route path="/reminders" element={<ReminderList />} />
          <Route path="/follow-ups" element={<FollowUpCenter />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
