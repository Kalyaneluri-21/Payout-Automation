import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { format, isPast, isToday, startOfDay } from "date-fns";
import { useSelector } from "react-redux";

function MentorDashboard() {
  const [sessions, setSessions] = useState([]);
  const [mentorName, setMentorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get logged-in user's email from Redux state
  const { user } = useSelector((state) => state.auth);
  const loggedInMentorEmail = user?.email;

  const getSessionStatus = (sessionDateTime) => {
    const now = new Date();
    if (isToday(sessionDateTime)) {
      // If session is today, compare with current time
      return isPast(sessionDateTime) ? "Completed" : "Scheduled";
    }
    // For other days, compare with start of day
    return isPast(startOfDay(sessionDateTime)) ? "Completed" : "Scheduled";
  };

  useEffect(() => {
    const fetchMentorSessions = async () => {
      if (!loggedInMentorEmail) {
        setError("No logged in user found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Create a query for sessions matching the mentor's email
        const sessionsRef = collection(db, "sessions");
        const q = query(
          sessionsRef,
          where("mentorEmail", "==", loggedInMentorEmail)
        );

        const querySnapshot = await getDocs(q);
        const sessionData = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Calculate session status based on date and time
          const sessionDateTime = data.dateTime.toDate();
          const status = getSessionStatus(sessionDateTime);

          sessionData.push({
            id: doc.id,
            ...data,
            status,
          });

          // Set mentor name from the first session (if not already set)
          if (!mentorName && data.mentorName) {
            setMentorName(data.mentorName);
          }
        });

        // Sort sessions by date (newest first)
        sessionData.sort((a, b) => b.dateTime.toDate() - a.dateTime.toDate());
        setSessions(sessionData);
      } catch (err) {
        console.error("Error fetching mentor sessions:", err);
        setError("Failed to load sessions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMentorSessions();
  }, [mentorName, loggedInMentorEmail]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mentor Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {mentorName || "Mentor"}!
        </h1>
        <p className="text-gray-600 mt-1">{loggedInMentorEmail}</p>
      </div>

      {/* Sessions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Sessions</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date & Time
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Session Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Duration
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No sessions found
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(session.dateTime.toDate(), "MMM d, yyyy")}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(session.dateTime.toDate(), "h:mm a")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {session.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.duration} mins
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          session.status
                        )}`}
                      >
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;
