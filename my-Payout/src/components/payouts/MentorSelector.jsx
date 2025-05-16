import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

function MentorSelector({ selectedMentor, onSelect }) {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMentors = async () => {
    setLoading(true);
    setError(null);
    try {
      const sessionsRef = collection(db, "sessions");
      const querySnapshot = await getDocs(sessionsRef);

      // Create a Set to store unique mentor names
      const uniqueMentors = new Set();

      querySnapshot.forEach((doc) => {
        const session = doc.data();
        if (session.mentorName) {
          uniqueMentors.add(session.mentorName);
        }
      });

      // Convert Set to array of mentor objects
      const mentorsList = Array.from(uniqueMentors).map((name) => ({
        id: name, // Using name as ID since that's what we have
        name: name,
      }));

      // Sort mentors by name
      mentorsList.sort((a, b) => a.name.localeCompare(b.name));

      if (mentorsList.length === 0) {
        setError("No mentors found. Please add some sessions first.");
      }

      setMentors(mentorsList);
    } catch (err) {
      console.error("Error fetching mentors:", err);
      setError("Failed to load mentors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label
          htmlFor="mentor"
          className="block text-sm font-medium text-gray-700"
        >
          Select Mentor
        </label>
        <button
          onClick={fetchMentors}
          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
      ) : error ? (
        <div className="text-red-600 text-sm p-2 bg-red-50 rounded border border-red-200">
          {error}
        </div>
      ) : (
        <select
          id="mentor"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={selectedMentor?.id || ""}
          onChange={(e) => {
            const mentor = mentors.find((m) => m.id === e.target.value);
            onSelect(mentor);
          }}
        >
          <option value="">Select a mentor</option>
          {mentors.map((mentor) => (
            <option key={mentor.id} value={mentor.id}>
              {mentor.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default MentorSelector;
