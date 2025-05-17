import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import toast from "react-hot-toast";
import { isPast, isToday, startOfDay } from "date-fns";

function AddSessionModal({ isOpen, onClose, onSessionAdded }) {
  const [formData, setFormData] = useState({
    mentorName: "",
    mentorEmail: "",
    dateTime: "",
    type: "",
    duration: "",
    ratePerHour: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const getSessionStatus = (sessionDateTime) => {
    const now = new Date();
    if (isToday(sessionDateTime)) {
      // If session is today, compare with current time
      return isPast(sessionDateTime) ? "Completed" : "Scheduled";
    }
    // For other days, compare with start of day
    return isPast(startOfDay(sessionDateTime)) ? "Completed" : "Scheduled";
  };

  const calculatePayout = (duration, ratePerHour) => {
    // Convert duration to hours and calculate payout
    const durationInHours = duration / 60;
    return Math.round(durationInHours * ratePerHour);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate form
      const newErrors = {};
      if (!formData.mentorName) {
        newErrors.mentorName = "Mentor name is required";
      }
      if (!formData.mentorEmail) {
        newErrors.mentorEmail = "Mentor email is required";
      } else if (!validateEmail(formData.mentorEmail)) {
        newErrors.mentorEmail = "Please enter a valid email address";
      }
      if (!formData.dateTime) {
        newErrors.dateTime = "Date and time are required";
      }
      if (!formData.type) {
        newErrors.type = "Session type is required";
      }
      if (!formData.duration) {
        newErrors.duration = "Duration is required";
      }
      if (!formData.ratePerHour) {
        newErrors.ratePerHour = "Rate per hour is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        throw new Error("Please fill in all required fields correctly");
      }

      // Calculate payout
      const calculatedPayout = calculatePayout(
        Number(formData.duration),
        Number(formData.ratePerHour)
      );

      const sessionDateTime = new Date(formData.dateTime);
      const status = getSessionStatus(sessionDateTime);

      // Prepare session data
      const sessionData = {
        ...formData,
        dateTime: sessionDateTime,
        duration: Number(formData.duration),
        ratePerHour: Number(formData.ratePerHour),
        calculatedPayout,
        status,
        receiptStatus: "Receipt Not Generated",
        createdAt: serverTimestamp(),
      };

      // Add to Firestore
      await addDoc(collection(db, "sessions"), sessionData);

      // Show success message
      toast.success("Session added successfully");

      // Reset form and close modal
      setFormData({
        mentorName: "",
        mentorEmail: "",
        dateTime: "",
        type: "",
        duration: "",
        ratePerHour: "",
      });
      setErrors({});
      onSessionAdded();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add New Session</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mentor Name */}
          <div>
            <label
              htmlFor="mentorName"
              className="block text-sm font-medium text-gray-700"
            >
              Mentor Name
            </label>
            <input
              type="text"
              id="mentorName"
              value={formData.mentorName}
              onChange={(e) =>
                setFormData({ ...formData, mentorName: e.target.value })
              }
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.mentorName ? "border-red-500" : ""
              }`}
            />
            {errors.mentorName && (
              <p className="mt-1 text-sm text-red-600">{errors.mentorName}</p>
            )}
          </div>

          {/* Mentor Email */}
          <div>
            <label
              htmlFor="mentorEmail"
              className="block text-sm font-medium text-gray-700"
            >
              Mentor Email
            </label>
            <input
              type="email"
              id="mentorEmail"
              value={formData.mentorEmail}
              onChange={(e) =>
                setFormData({ ...formData, mentorEmail: e.target.value })
              }
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.mentorEmail ? "border-red-500" : ""
              }`}
            />
            {errors.mentorEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.mentorEmail}</p>
            )}
          </div>

          {/* Date & Time */}
          <div>
            <label
              htmlFor="dateTime"
              className="block text-sm font-medium text-gray-700"
            >
              Date & Time
            </label>
            <input
              type="datetime-local"
              id="dateTime"
              value={formData.dateTime}
              onChange={(e) =>
                setFormData({ ...formData, dateTime: e.target.value })
              }
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.dateTime ? "border-red-500" : ""
              }`}
            />
            {errors.dateTime && (
              <p className="mt-1 text-sm text-red-600">{errors.dateTime}</p>
            )}
          </div>

          {/* Session Type */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Session Type
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.type ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Type</option>
              <option value="Live">Live</option>
              <option value="Review">Review</option>
              <option value="Eval">Eval</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700"
            >
              Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              min="0"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.duration ? "border-red-500" : ""
              }`}
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
            )}
          </div>

          {/* Rate per Hour */}
          <div>
            <label
              htmlFor="ratePerHour"
              className="block text-sm font-medium text-gray-700"
            >
              Rate per Hour (₹)
            </label>
            <input
              type="number"
              id="ratePerHour"
              value={formData.ratePerHour}
              onChange={(e) =>
                setFormData({ ...formData, ratePerHour: e.target.value })
              }
              min="0"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.ratePerHour ? "border-red-500" : ""
              }`}
            />
            {errors.ratePerHour && (
              <p className="mt-1 text-sm text-red-600">{errors.ratePerHour}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-5">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddSessionModal;
