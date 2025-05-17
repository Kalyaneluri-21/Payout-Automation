import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

function MentorDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalEarnings: 0,
    futurePayments: 0
  });
  const mentorEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchMentorData = async () => {
      if (!mentorEmail) return;
      
      try {
        setLoading(true);
        // Fetch sessions for stats
        const sessionsRef = collection(db, "sessions");
        const sessionsQuery = query(
          sessionsRef,
          where("mentorEmail", "==", mentorEmail)
        );
        const sessionsSnapshot = await getDocs(sessionsQuery);
        
        let totalSessions = 0;
        let totalEarnings = 0;
        let futurePayments = 0;

        sessionsSnapshot.docs.forEach(doc => {
          const session = doc.data();
          totalSessions++; // Count all sessions assigned to mentor
          
          const sessionPayout = (session.duration / 60) * session.ratePerHour;
          
          if (session.receiptStatus === "Receipt Generated") {
            totalEarnings += sessionPayout; // Only count earnings from receipt generated sessions
          } else {
            futurePayments += sessionPayout; // Count payments for sessions without receipts
          }
        });

        setStats({
          totalSessions,
          totalEarnings,
          futurePayments
        });

      } catch (error) {
        console.error("Error fetching mentor data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorData();
  }, [mentorEmail]);

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Welcome to Your Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Sessions</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalSessions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Earnings</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalEarnings)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Future Payments</h3>
          <p className="text-3xl font-bold text-yellow-600">{formatCurrency(stats.futurePayments)}</p>
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;
