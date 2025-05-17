import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import dayjs from "../../utils/dayjs-config";
import ReceiptSummary from "./ReceiptSummary";

function ReceiptList({ selectedMentor }) {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    if (selectedMentor) {
      fetchReceipts();
    }
  }, [selectedMentor]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const receiptsRef = collection(db, "receipts");
      const q = query(
        receiptsRef,
        where("mentorEmail", "==", selectedMentor.email)
      );

      const querySnapshot = await getDocs(q);
      const receiptData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      receiptData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

      setReceipts(receiptData);
    } catch (error) {
      console.error("Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return dayjs(date.toDate()).format("DD MMM YYYY");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Generated Receipts
      </h2>

      {receipts.length === 0 ? (
        <p className="text-gray-600">No receipts found for this mentor.</p>
      ) : (
        <div className="space-y-4">
          {receipts.map((receipt) => (
            <div
              key={receipt.id}
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedReceipt(receipt)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    Receipt ID: {receipt.id}
                  </p>
                  <p className="text-sm text-gray-600">
                    Period: {formatDate(receipt.timeRange.startDate)} -{" "}
                    {formatDate(receipt.timeRange.endDate)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Sessions: {receipt.sessionList.length}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-800">
                    {formatCurrency(receipt.finalPayout)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Generated: {formatDate(receipt.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
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
                <ReceiptSummary receipt={selectedReceipt} />
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedReceipt(null)}
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

export default ReceiptList;
