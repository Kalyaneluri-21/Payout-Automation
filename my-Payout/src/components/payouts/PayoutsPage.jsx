import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import dayjs from "dayjs";
import MentorSelector from "./MentorSelector";
import DateRangePicker from "./DateRangePicker";
import PayoutSummaryCard from "./PayoutSummaryCard";
import PayoutCalculatorPanel from "./PayoutCalculatorPanel";
import ManualOverrideModal from "./ManualOverrideModal";

function PayoutsPage() {
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(6, "day").startOf("day").toDate(),
    endDate: dayjs().endOf("day").toDate(),
    preset: "7",
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
      console.log("Selected Mentor:", selectedMentor);
      console.log("Date Range:", {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        preset: dateRange.preset,
      });

      const sessionsRef = collection(db, "sessions");
      const q = query(
        sessionsRef,
        where("mentorName", "==", selectedMentor.id),
        where("dateTime", ">=", Timestamp.fromDate(dateRange.startDate)),
        where("dateTime", "<=", Timestamp.fromDate(dateRange.endDate))
      );

      console.log("Executing Firestore query...");
      const querySnapshot = await getDocs(q);
      console.log("Query completed. Found sessions:", querySnapshot.size);

      if (querySnapshot.size === 0) {
        console.log("No sessions found for the selected criteria");
        setPayoutData({
          totalSessions: 0,
          totalHours: 0,
          grossPayout: 0,
          deductions: 0,
          gst: 0,
          netPayable: 0,
          sessions: [],
        });
        return;
      }

      const sessions = [];
      let totalHours = 0;
      let grossPayout = 0;

      querySnapshot.forEach((doc) => {
        const session = doc.data();
        console.log("Processing session:", {
          id: doc.id,
          mentorName: session.mentorName,
          duration: session.duration,
          ratePerHour: session.ratePerHour,
          dateTime: session.dateTime?.toDate()?.toISOString(),
        });

        sessions.push({
          id: doc.id,
          ...session,
        });

        // Convert duration from minutes to hours
        const durationInHours = session.duration / 60;
        totalHours += durationInHours;

        // Calculate payout for this session
        const sessionPayout = session.ratePerHour * durationInHours;
        grossPayout += sessionPayout;
      });

      const deductions = grossPayout * 0.1; // 10% platform fee
      const gst = grossPayout * 0.18; // 18% GST
      const netPayable = grossPayout - deductions - gst;

      console.log("Final calculations:", {
        totalSessions: sessions.length,
        totalHours,
        grossPayout,
        deductions,
        gst,
        netPayable,
      });

      setPayoutData({
        totalSessions: sessions.length,
        totalHours: parseFloat(totalHours.toFixed(2)),
        grossPayout: parseFloat(grossPayout.toFixed(2)),
        deductions: parseFloat(deductions.toFixed(2)),
        gst: parseFloat(gst.toFixed(2)),
        netPayable: parseFloat(netPayable.toFixed(2)),
        sessions: sessions,
      });
    } catch (error) {
      console.error("Error fetching payout data:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
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
