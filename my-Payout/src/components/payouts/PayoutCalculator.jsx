import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import MentorSelector from "./MentorSelector";
import DateRangePicker from "./DateRangePicker";
import PayoutSummaryCard from "./PayoutSummaryCard";
import ManualOverrideModal from "./ManualOverrideModal";

const PLATFORM_FEE_PERCENTAGE = 10;
const GST_PERCENTAGE = 18;

function PayoutCalculator() {
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [dateRange, setDateRange] = useState("last7");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculations, setCalculations] = useState({
    totalSessions: 0,
    totalHours: 0,
    grossPayout: 0,
    platformDeductions: 0,
    gst: 0,
    netPayable: 0,
  });
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [existingPayout, setExistingPayout] = useState(null);

  // Fetch sessions when mentor or date range changes
  useEffect(() => {
    const fetchSessions = async () => {
      if (!selectedMentor) return;

      setLoading(true);
      try {
        const startDate = getStartDate(dateRange);
        const sessionsRef = collection(db, "sessions");
        const q = query(
          sessionsRef,
          where("mentorId", "==", selectedMentor.id),
          where("dateTime", ">=", startDate)
        );

        const querySnapshot = await getDocs(q);
        const sessionData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSessions(sessionData);
        calculatePayout(sessionData);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [selectedMentor, dateRange]);

  // Calculate payout details
  const calculatePayout = (sessionData) => {
    const totalSessions = sessionData.length;
    const totalMinutes = sessionData.reduce(
      (sum, session) => sum + session.duration,
      0
    );
    const totalHours = totalMinutes / 60;
    const grossPayout = sessionData.reduce(
      (sum, session) => sum + (session.duration / 60) * session.ratePerHour,
      0
    );

    const platformDeductions = (grossPayout * PLATFORM_FEE_PERCENTAGE) / 100;
    const gst = (grossPayout * GST_PERCENTAGE) / 100;
    const netPayable = grossPayout - platformDeductions - gst;

    setCalculations({
      totalSessions,
      totalHours,
      grossPayout,
      platformDeductions,
      gst,
      netPayable,
    });
  };

  // Get start date based on selected range
  const getStartDate = (range) => {
    const now = new Date();
    switch (range) {
      case "last7":
        return new Date(now.setDate(now.getDate() - 7));
      case "last15":
        return new Date(now.setDate(now.getDate() - 15));
      case "last30":
        return new Date(now.setDate(now.getDate() - 30));
      default:
        return range.startDate || new Date(now.setDate(now.getDate() - 7));
    }
  };

  const handleOverrideConfirm = async (newAmount, reason) => {
    // Implementation for manual override
    // Will be completed in ManualOverrideModal component
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Payout Calculator
          </h1>

          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <MentorSelector
              selectedMentor={selectedMentor}
              onMentorSelect={setSelectedMentor}
            />
            <DateRangePicker
              selectedRange={dateRange}
              onRangeSelect={setDateRange}
            />
          </div>

          {/* Summary Section */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : selectedMentor ? (
            <PayoutSummaryCard
              calculations={calculations}
              onOverrideClick={() => setIsOverrideModalOpen(true)}
            />
          ) : (
            <div className="text-center text-gray-500 py-12">
              Select a mentor to view payout calculations
            </div>
          )}
        </div>
      </div>

      {/* Manual Override Modal */}
      <ManualOverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        currentAmount={calculations.netPayable}
        onConfirm={handleOverrideConfirm}
      />
    </div>
  );
}

export default PayoutCalculator;
