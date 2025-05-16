import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import MentorSelector from "./MentorSelector";
import DateRangePicker from "./DateRangePicker";
import PayoutSummaryCard from "./PayoutSummaryCard";
import PayoutCalculatorPanel from "./PayoutCalculatorPanel";
import ManualOverrideModal from "./ManualOverrideModal";

function PayoutsPage() {
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    preset: "7", // '7', '15', '30', or 'custom'
  });
  const [payoutData, setPayoutData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);

  useEffect(() => {
    if (selectedMentor && dateRange.startDate && dateRange.endDate) {
      fetchPayoutData();
    }
  }, [selectedMentor, dateRange]);

  const fetchPayoutData = async () => {
    setLoading(true);
    try {
      const sessionsRef = collection(db, "sessions");
      const q = query(
        sessionsRef,
        where("mentorName", "==", selectedMentor.name),
        where("dateTime", ">=", dateRange.startDate),
        where("dateTime", "<=", dateRange.endDate)
      );

      const querySnapshot = await getDocs(q);
      const sessions = [];
      let totalHours = 0;
      let grossPayout = 0;

      querySnapshot.forEach((doc) => {
        const session = doc.data();
        sessions.push(session);
        totalHours += session.duration / 60; // Convert minutes to hours
        grossPayout += session.calculatedPayout;
      });

      const deductions = grossPayout * 0.1; // 10% platform fee
      const gst = grossPayout * 0.18; // 18% GST
      const netPayable = grossPayout - deductions - gst;

      setPayoutData({
        totalSessions: sessions.length,
        totalHours,
        grossPayout,
        deductions,
        gst,
        netPayable,
        sessions,
      });
    } catch (error) {
      console.error("Error fetching payout data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideConfirm = (newAmount, reason) => {
    // This will be implemented to handle manual overrides
    console.log("Override confirmed:", { newAmount, reason });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Payout Calculator
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
        <MentorSelector
          selectedMentor={selectedMentor}
          onSelect={setSelectedMentor}
        />
        <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : payoutData ? (
        <>
          <PayoutCalculatorPanel data={payoutData} />
          <PayoutSummaryCard
            data={payoutData}
            onOverride={() => setIsOverrideModalOpen(true)}
          />
          <ManualOverrideModal
            isOpen={isOverrideModalOpen}
            onClose={() => setIsOverrideModalOpen(false)}
            currentAmount={payoutData.netPayable}
            onConfirm={handleOverrideConfirm}
          />
        </>
      ) : (
        <div className="text-center text-gray-600 mt-8">
          Select a mentor and date range to calculate payout
        </div>
      )}
    </div>
  );
}

export default PayoutsPage;
