import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  updateDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import dayjs from "dayjs";
import MentorSelector from "./MentorSelector";
import DateRangePicker from "./DateRangePicker";
import PayoutSummaryCard from "./PayoutSummaryCard";
import PayoutCalculatorPanel from "./PayoutCalculatorPanel";
import ManualOverrideModal from "./ManualOverrideModal";
import toast from "react-hot-toast";

function PayoutsPage() {
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [dateRange, setDateRange] = useState(() => {
    const now = dayjs();
    return {
      startDate: now.subtract(7, "days").startOf("day").toDate(),
      endDate: now.endOf("day").toDate(),
      preset: "7",
    };
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
      // Create query matching the index structure exactly
      const q = query(
        sessionsRef,
        where("mentorEmail", "==", selectedMentor.email),
        where("status", "==", "Calculated"),
        where("dateTime", ">=", Timestamp.fromDate(dateRange.startDate)),
        where("dateTime", "<=", Timestamp.fromDate(dateRange.endDate))
      );

      console.log("Query debug:", {
        mentorEmail: selectedMentor.email,
        status: "Calculated",
        dateRange: {
          start: dateRange.startDate.toISOString(),
          end: dateRange.endDate.toISOString(),
        },
      });

      const querySnapshot = await getDocs(q);

      console.log("Query results:", {
        totalResults: querySnapshot.size,
        allDocs: querySnapshot.docs.map((doc) => ({
          id: doc.id,
          dateTime: doc.data().dateTime?.toDate()?.toISOString(),
          status: doc.data().status,
          mentorEmail: doc.data().mentorEmail,
          ratePerHour: doc.data().ratePerHour,
          duration: doc.data().duration,
        })),
      });

      if (querySnapshot.size === 0) {
        setPayoutData({
          totalSessions: 0,
          totalHours: 0,
          grossPayout: 0,
          deductions: 0,
          gst: 0,
          netPayable: 0,
          sessions: [],
          eligibleSessions: [],
        });
        return;
      }

      const allSessions = [];
      const eligibleSessions = [];
      let totalHours = 0;
      let grossPayout = 0;

      querySnapshot.forEach((doc) => {
        const session = {
          id: doc.id,
          ...doc.data(),
        };
        allSessions.push(session);

        // Only include sessions without generated receipts for payout calculation
        if (session.receiptStatus !== "Receipt Generated") {
          eligibleSessions.push(session);
          const durationInHours = session.duration / 60;
          totalHours += durationInHours;
          const sessionPayout = session.ratePerHour * durationInHours;
          grossPayout += sessionPayout;
        }
      });

      const deductions = grossPayout * 0.1; // 10% platform fee
      const gst = grossPayout * 0.18; // 18% GST
      const netPayable = grossPayout - deductions - gst;

      setPayoutData({
        totalSessions: allSessions.length,
        totalHours: parseFloat(totalHours.toFixed(2)),
        grossPayout: parseFloat(grossPayout.toFixed(2)),
        deductions: parseFloat(deductions.toFixed(2)),
        gst: parseFloat(gst.toFixed(2)),
        netPayable: parseFloat(netPayable.toFixed(2)),
        sessions: allSessions,
        eligibleSessions: eligibleSessions,
      });
    } catch (error) {
      console.error("Error fetching payout data:", error);
      toast.error("Failed to fetch payout data");
    } finally {
      setLoading(false);
    }
  };

  const generateReceipts = async () => {
    if (!selectedMentor || !dateRange.startDate || !dateRange.endDate) {
      toast.error("Please select a mentor and date range first");
      return;
    }

    setLoading(true);
    try {
      const sessionsRef = collection(db, "sessions");
      const q = query(
        sessionsRef,
        where("mentorEmail", "==", selectedMentor.email),
        where("dateTime", ">=", Timestamp.fromDate(dateRange.startDate)),
        where("dateTime", "<=", Timestamp.fromDate(dateRange.endDate)),
        where("status", "==", "Completed")
      );

      const querySnapshot = await getDocs(q);
      const updatePromises = [];

      querySnapshot.forEach((docSnapshot) => {
        const sessionData = docSnapshot.data();
        if (sessionData.receiptStatus !== "Receipt Generated") {
          updatePromises.push(
            updateDoc(doc(db, "sessions", docSnapshot.id), {
              receiptStatus: "Receipt Generated",
              receiptGeneratedAt: Timestamp.now(),
            })
          );
        }
      });

      if (updatePromises.length === 0) {
        toast.info("No eligible sessions found for receipt generation");
        return;
      }

      await Promise.all(updatePromises);
      toast.success(`Generated receipts for ${updatePromises.length} sessions`);
      fetchPayoutData(); // Refresh the data
    } catch (error) {
      console.error("Error generating receipts:", error);
      toast.error("Failed to generate receipts");
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideConfirm = (newAmount, reason) => {
    setPayoutData((prevData) => ({
      ...prevData,
      netPayable: newAmount,
      isOverridden: true,
      overrideReason: reason,
    }));
    setIsOverrideModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Payout Calculator</h1>
        <button
          onClick={generateReceipts}
          disabled={loading || !selectedMentor}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Receipts"}
        </button>
      </div>

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
