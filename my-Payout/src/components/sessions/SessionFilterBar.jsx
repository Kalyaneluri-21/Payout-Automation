import React from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

function SessionFilterBar({ filters, setFilters }) {
  const [mentors, setMentors] = React.useState([]);

  // Fetch unique mentor names
  React.useEffect(() => {
    const fetchMentors = async () => {
      try {
        const sessionsRef = collection(db, "sessions");
        const snapshot = await getDocs(sessionsRef);
        const uniqueMentors = [
          ...new Set(snapshot.docs.map((doc) => doc.data().mentorName)),
        ];
        setMentors(uniqueMentors.sort());
      } catch (error) {
        console.error("Error fetching mentors:", error);
      }
    };

    fetchMentors();
  }, []);

  return (
    <div className="p-4 border-b border-gray-200 bg-white space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-4">
        {/* Date Range Filter */}
        <div className="w-full sm:w-auto">
          <label
            htmlFor="dateRange"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Date Range
          </label>
          <select
            id="dateRange"
            value={filters.dateRange}
            onChange={(e) =>
              setFilters({ ...filters, dateRange: e.target.value })
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="last7">Last 7 Days</option>
            <option value="last15">Last 15 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Mentor Filter */}
        <div className="w-full sm:w-auto">
          <label
            htmlFor="mentorName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mentor
          </label>
          <select
            id="mentorName"
            value={filters.mentorName}
            onChange={(e) =>
              setFilters({ ...filters, mentorName: e.target.value })
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Mentors</option>
            {mentors.map((mentor) => (
              <option key={mentor} value={mentor}>
                {mentor}
              </option>
            ))}
          </select>
        </div>

        {/* Session Type Filter */}
        <div className="w-full sm:w-auto">
          <label
            htmlFor="sessionType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Session Type
          </label>
          <select
            id="sessionType"
            value={filters.sessionType}
            onChange={(e) =>
              setFilters({ ...filters, sessionType: e.target.value })
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Types</option>
            <option value="Live">Live</option>
            <option value="Review">Review</option>
            <option value="Eval">Eval</option>
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={() =>
          setFilters({ dateRange: "last7", mentorName: "", sessionType: "" })
        }
        className="w-full sm:w-auto mt-2 sm:mt-0 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Clear Filters
      </button>
    </div>
  );
}

export default SessionFilterBar;
