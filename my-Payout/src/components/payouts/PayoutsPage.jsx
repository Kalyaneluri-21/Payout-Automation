import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  updateDoc,
  doc,
  addDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import dayjs from "../../utils/dayjs-config";
import MentorSelector from "./MentorSelector";
import DateRangePicker from "./DateRangePicker";
import PayoutSummaryCard from "./PayoutSummaryCard";
import PayoutCalculatorPanel from "./PayoutCalculatorPanel";
import ManualOverrideModal from "./ManualOverrideModal";
import ReceiptSummary from "./ReceiptSummary";
import toast from "react-hot-toast";
import ReceiptList from "./ReceiptList";

function PayoutsPage() {
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [dateRange, setDateRange] = useState(() => {
    // Initialize with IST dates
    const now = dayjs().tz();
    const startDate = now.subtract(7, "days").startOf("day");
    const endDate = now.endOf("day");

    console.log("Initializing date range:", {
      startDate: startDate.format("YYYY-MM-DD HH:mm:ss"),
      endDate: endDate.format("YYYY-MM-DD HH:mm:ss"),
      timezone: "Asia/Kolkata",
    });

    return {
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
      preset: "7",
    };
  });
  const [payoutData, setPayoutData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    if (selectedMentor && dateRange.startDate && dateRange.endDate) {
      fetchPayoutData();
    }
  }, [selectedMentor, dateRange]);

  const fetchPayoutData = async () => {
    setLoading(true);
    try {
      const sessionsRef = collection(db, "sessions");

      // Convert dates to Firestore timestamps while preserving IST timezone
      const startTimestamp = Timestamp.fromDate(
        dayjs(dateRange.startDate).tz("Asia/Kolkata").toDate()
      );
      const endTimestamp = Timestamp.fromDate(
        dayjs(dateRange.endDate).tz("Asia/Kolkata").toDate()
      );

      console.log("Query date range:", {
        startDate: dayjs(dateRange.startDate).format("YYYY-MM-DD HH:mm:ss"),
        endDate: dayjs(dateRange.endDate).format("YYYY-MM-DD HH:mm:ss"),
        startTimestamp,
        endTimestamp,
        timezone: "Asia/Kolkata",
      });

      const q = query(
        sessionsRef,
        where("mentorEmail", "==", selectedMentor.email),
        where("status", "==", "Completed"),
        where("dateTime", ">=", startTimestamp),
        where("dateTime", "<=", endTimestamp)
      );

      console.log("Query debug:", {
        mentorEmail: selectedMentor.email,
        status: "Completed",
        dateRange: {
          start: dayjs(dateRange.startDate).format("YYYY-MM-DD HH:mm:ss"),
          end: dayjs(dateRange.endDate).format("YYYY-MM-DD HH:mm:ss"),
        },
      });

      const querySnapshot = await getDocs(q);

      console.log("Query results:", {
        totalResults: querySnapshot.size,
        allDocs: querySnapshot.docs.map((doc) => ({
          id: doc.id,
          dateTime: doc.data().dateTime?.toDate()
            ? dayjs(doc.data().dateTime.toDate())
                .tz("Asia/Kolkata")
                .format("YYYY-MM-DD HH:mm:ss")
            : null,
          status: doc.data().status,
          mentorEmail: doc.data().mentorEmail,
          ratePerHour: doc.data().ratePerHour,
          duration: doc.data().duration,
        })),
      });

      if (querySnapshot.size === 0) {
        setPayoutData({
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
          // Convert Firestore timestamp to IST date
          dateTime: doc.data().dateTime?.toDate
            ? dayjs(doc.data().dateTime.toDate()).tz("Asia/Kolkata").toDate()
            : null,
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
      // First query to get completed sessions for this mentor
      const q = query(
        sessionsRef,
        where("mentorEmail", "==", selectedMentor.email),
        where("status", "==", "Completed")
      );

      const querySnapshot = await getDocs(q);

      // Filter sessions by date range and receipt status client-side
      const startTimestamp = Timestamp.fromDate(dateRange.startDate);
      const endTimestamp = Timestamp.fromDate(dateRange.endDate);

      const eligibleSessions = querySnapshot.docs.filter((doc) => {
        const data = doc.data();
        return (
          data.dateTime >= startTimestamp &&
          data.dateTime <= endTimestamp &&
          data.receiptStatus !== "Receipt Generated"
        );
      });

      if (eligibleSessions.length === 0) {
        toast.info("No eligible sessions found for receipt generation");
        return;
      }

      // Prepare session data for receipt
      const sessionList = eligibleSessions.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          dateTime: data.dateTime,
          duration: data.duration,
          type: data.type,
          calculatedPayout:
            data.calculatedPayout || (data.duration / 60) * data.ratePerHour,
        };
      });

      // Calculate totals
      const totalPayout = sessionList.reduce(
        (sum, session) => sum + session.calculatedPayout,
        0
      );
      const deduction = totalPayout * 0.1; // 10% platform fee
      const gst = totalPayout * 0.18; // 18% GST
      const finalPayout = totalPayout - deduction - gst;

      // Create receipt document
      const receiptData = {
        mentorName: selectedMentor.name,
        mentorEmail: selectedMentor.email,
        timeRange: {
          startDate: startTimestamp,
          endDate: endTimestamp,
        },
        totalPayout,
        deduction,
        gst,
        finalPayout,
        sessionList,
        createdAt: Timestamp.now(),
      };

      // Add receipt to Firestore
      const receiptRef = await addDoc(collection(db, "receipts"), receiptData);

      // Update session documents
      const updatePromises = eligibleSessions.map((docSnapshot) =>
        updateDoc(doc(db, "sessions", docSnapshot.id), {
          receiptStatus: "Receipt Generated",
          receiptGeneratedAt: Timestamp.now(),
          receiptId: receiptRef.id,
        })
      );

      await Promise.all(updatePromises);

      toast.success(
        `Generated receipt for ${eligibleSessions.length} sessions`
      );

      // Show receipt summary
      setReceiptData({
        ...receiptData,
        id: receiptRef.id,
      });
      setShowReceiptModal(true);

      fetchPayoutData(); // Refresh the data
    } catch (error) {
      console.error("Error generating receipt:", error);
      toast.error("Failed to generate receipt");
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
          {loading ? "Generating..." : "Generate Receipt"}
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
          <div className="mt-8">
            <ReceiptList selectedMentor={selectedMentor} />
          </div>
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

      {/* Receipt Modal */}
      {showReceiptModal && receiptData && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <ReceiptSummary receipt={receiptData} />
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowReceiptModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PayoutsPage;
