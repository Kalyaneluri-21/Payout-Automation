import React, { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMentors: 0,
    pendingPayouts: 0
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const sessionsRef = collection(db, "sessions");
        const sessionsSnapshot = await getDocs(sessionsRef);
        
        let totalSessions = 0;
        let pendingPayouts = 0;
        const uniqueMentors = new Set();

        sessionsSnapshot.docs.forEach(doc => {
          const session = doc.data();
          totalSessions++; // Count all sessions
          
          // Add mentor email to unique set
          if (session.mentorEmail) {
            uniqueMentors.add(session.mentorEmail);
          }

          // Calculate pending payouts for completed sessions without receipts
          if (session.status === "Completed" && session.receiptStatus !== "Receipt Generated") {
            const sessionPayout = (session.duration / 60) * session.ratePerHour;
            pendingPayouts += sessionPayout;
          }
        });

        setStats({
          totalSessions,
          totalMentors: uniqueMentors.size,
          pendingPayouts
        });

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900">
              Total Sessions
            </h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalSessions}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900">
              Total Mentors
            </h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalMentors}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900">
              Pending Payouts
            </h3>
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(stats.pendingPayouts)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
