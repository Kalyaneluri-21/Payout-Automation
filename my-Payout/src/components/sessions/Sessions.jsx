import React, { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import SessionsTable from "./SessionsTable";
import SessionFilterBar from "./SessionFilterBar";
import AddSessionModal from "./AddSessionModal";
import { Toaster } from "react-hot-toast";

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
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const sessionsRef = collection(db, "sessions");
        const q = query(sessionsRef, orderBy("dateTime", "desc"));
        const querySnapshot = await getDocs(q);

        const sessionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Apply filters
        let filteredSessions = sessionsData;

        // Date range filter
        if (filters.dateRange) {
          const now = new Date();
          let startDate;

          switch (filters.dateRange) {
            case "last7":
              startDate = new Date(now.setDate(now.getDate() - 7));
              break;
            case "last15":
              startDate = new Date(now.setDate(now.getDate() - 15));
              break;
            case "last30":
              startDate = new Date(now.setDate(now.getDate() - 30));
              break;
            default:
              startDate = null;
          }

          if (startDate) {
            filteredSessions = filteredSessions.filter(
              (session) => new Date(session.dateTime.toDate()) >= startDate
            );
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

        setSessions(filteredSessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Sessions Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and track all mentor sessions
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Session
            </button>
          </div>

          {/* Filters */}
          <SessionFilterBar filters={filters} setFilters={setFilters} />

          {/* Table */}
          <SessionsTable sessions={sessions} loading={loading} />
        </div>
      </div>

      {/* Add Session Modal */}
      <AddSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSessionAdded={() => {
          // Refresh sessions list after adding
          setFilters({ ...filters });
        }}
      />

      {/* Toast Container */}
      <Toaster position="top-right" />
    </div>
  );
}

export default Sessions;
