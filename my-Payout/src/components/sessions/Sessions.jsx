import React, { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import SessionsTable from "./SessionsTable";
import SessionFilterBar from "./SessionFilterBar";
import AddSessionModal from "./AddSessionModal";
import { Toaster } from "react-hot-toast";
import { updateSessionStatuses } from "../../utils/sessionStatusUpdater";
import toast from "react-hot-toast";
import dayjs from "../../utils/dayjs-config";

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: "last7",
    mentorName: "",
    sessionType: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch sessions with applied filters
  const fetchSessions = async () => {
    try {
      setLoading(true);

      // First update any sessions that should be marked as completed
      try {
        console.log("Checking for sessions that need status updates...");
        const updatedCount = await updateSessionStatuses();
        if (updatedCount > 0) {
          toast.success(`Updated ${updatedCount} sessions to Completed status`);
        }
      } catch (error) {
        console.error("Error updating session statuses:", error);
        toast.error("Failed to update session statuses");
      }

      const sessionsRef = collection(db, "sessions");
      const q = query(sessionsRef, orderBy("dateTime", "desc"));
      const querySnapshot = await getDocs(q);

      const sessionsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore timestamp to readable date string
          dateTimeString: dayjs(data.dateTime.toDate())
            .tz("Asia/Kolkata")
            .format("YYYY-MM-DD hh:mm A"),
        };
      });

      console.log("Fetched sessions:", sessionsData);

      // Apply filters
      let filteredSessions = sessionsData;

      // Date range filter
      if (filters.dateRange) {
        const now = dayjs().tz("Asia/Kolkata");
        let startDate;

        switch (filters.dateRange) {
          case "last7":
            startDate = now.subtract(7, "days").startOf("day");
            break;
          case "last15":
            startDate = now.subtract(15, "days").startOf("day");
            break;
          case "last30":
            startDate = now.subtract(30, "days").startOf("day");
            break;
          default:
            startDate = null;
        }

        if (startDate) {
          filteredSessions = filteredSessions.filter((session) => {
            const sessionDate = dayjs(session.dateTime.toDate()).tz(
              "Asia/Kolkata"
            );
            return sessionDate.isAfter(startDate);
          });
        }
      }

      // Mentor name filter
      if (filters.mentorName) {
        filteredSessions = filteredSessions.filter((session) =>
          session.mentorName
            .toLowerCase()
            .includes(filters.mentorName.toLowerCase())
        );
      }

      // Session type filter
      if (filters.sessionType) {
        filteredSessions = filteredSessions.filter(
          (session) => session.type === filters.sessionType
        );
      }

      console.log("Filtered sessions:", filteredSessions);
      setSessions(filteredSessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    fetchSessions();

    // Set up an interval to refresh data and update statuses every minute
    const intervalId = setInterval(() => {
      fetchSessions();
    }, 60000); // 60000 ms = 1 minute

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [filters]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Sessions Management
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Session
        </button>
      </div>

      <SessionFilterBar filters={filters} setFilters={setFilters} />
      <SessionsTable sessions={sessions} loading={loading} />

      {isModalOpen && (
        <AddSessionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSessionAdded={() => {
            setIsModalOpen(false);
            fetchSessions();
          }}
        />
      )}
    </div>
  );
}

export default Sessions;
