import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";
import dayjs from "../../utils/dayjs-config";

function MentorDashboard() {
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalEarnings: 0,
    pendingPayments: 0
  });
  const mentorEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchMentorData = async () => {
      if (!mentorEmail) return;
      
      try {
        setLoading(true);
        // Fetch receipts
        const receiptsRef = collection(db, "receipts");
        const receiptsQuery = query(
          receiptsRef,
          where("mentorEmail", "==", mentorEmail),
          orderBy("createdAt", "desc")
        );
        const receiptsSnapshot = await getDocs(receiptsQuery);
        
        const payments = receiptsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        setRecentPayments(payments);

        // Fetch sessions for stats
        const sessionsRef = collection(db, "sessions");
        const sessionsQuery = query(
          sessionsRef,
          where("mentorEmail", "==", mentorEmail)
        );
        const sessionsSnapshot = await getDocs(sessionsQuery);
        
        let totalSessions = 0;
        let totalEarnings = 0;
        let pendingPayments = 0;

        sessionsSnapshot.docs.forEach(doc => {
          const session = doc.data();
          totalSessions++;
          if (session.receiptStatus !== "Receipt Generated") {
            const sessionPayout = (session.duration / 60) * session.ratePerHour;
            pendingPayments += sessionPayout;
          }
          const sessionPayout = (session.duration / 60) * session.ratePerHour;
          totalEarnings += sessionPayout;
        });

        setStats({
          totalSessions,
          totalEarnings,
          pendingPayments
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
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending Payments</h3>
          <p className="text-3xl font-bold text-yellow-600">{formatCurrency(stats.pendingPayments)}</p>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Recent Payments</h2>
        </div>
        <div className="p-6">
          {recentPayments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No payments found</p>
          ) : (
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">
                        Period: {dayjs(payment.timeRange.startDate.toDate()).format("DD MMM YYYY")} -{" "}
                        {dayjs(payment.timeRange.endDate.toDate()).format("DD MMM YYYY")}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Sessions: {payment.sessionList.length}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(payment.finalPayout)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {dayjs(payment.createdAt).format("DD MMM YYYY")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;
