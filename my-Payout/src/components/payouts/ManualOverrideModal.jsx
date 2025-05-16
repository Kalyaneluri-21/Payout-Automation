import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";

function ManualOverrideModal({ isOpen, onClose, currentAmount, onConfirm }) {
  const [newAmount, setNewAmount] = useState(currentAmount);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Log the override in the audit collection
      await addDoc(collection(db, "payout_overrides"), {
        originalAmount: currentAmount,
        newAmount: parseFloat(newAmount),
        reason,
        timestamp: serverTimestamp(),
        userId: "CURRENT_USER_ID", // Replace with actual user ID from auth context
      });

      onConfirm(parseFloat(newAmount), reason);
      onClose();
    } catch (err) {
      console.error("Error logging override:", err);
      setError("Failed to process override. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg
                className="h-6 w-6 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Manual Override
              </h3>

              <form onSubmit={handleSubmit} className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-sm font-medium text-gray-700"
                    >
                      New Amount (INR)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        step="0.01"
                        id="amount"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reason"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Reason for Override
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="reason"
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Please provide a detailed reason for this override..."
                        required
                      />
                    </div>
                  </div>

                  {error && <div className="text-red-600 text-sm">{error}</div>}
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Processing..." : "Confirm Override"}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManualOverrideModal;
