import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/layout/Header";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Sessions from "./components/sessions/Sessions";
import PayoutsPage from "./components/payouts/PayoutsPage";
import { Toaster } from "react-hot-toast";
import AdminDashboard from "./components/admin/AdminDashboard";
import MentorDashboard from "./components/mentor/MentorDashboard";
import MentorSessions from "./components/sessions/MentorSessions";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header userRole="admin" />
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="payouts" element={<PayoutsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function MentorLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header userRole="mentor" />
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Routes>
            <Route index element={<MentorDashboard />} />
            <Route path="sessions" element={<MentorSessions />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  const currentUser = {
    email: localStorage.getItem("userEmail") || "",
    role: localStorage.getItem("userRole") || "",
  };

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/mentor/*" element={<MentorLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
