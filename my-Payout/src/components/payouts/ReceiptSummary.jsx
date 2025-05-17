import React from "react";
import dayjs from "../../utils/dayjs-config";

function ReceiptSummary({ receipt }) {
  const formatDate = (timestamp) => {
    // Check if the timestamp is a Firestore Timestamp
    if (timestamp && typeof timestamp.toDate === "function") {
      return dayjs(timestamp.toDate())
        .tz("Asia/Kolkata")
        .format("DD MMM YYYY, hh:mm A");
    }
    // If it's already a Date object
    if (timestamp instanceof Date) {
      return dayjs(timestamp).tz("Asia/Kolkata").format("DD MMM YYYY, hh:mm A");
    }
    // If it's a number (seconds since epoch)
    if (typeof timestamp === "number") {
      return dayjs
        .unix(timestamp)
        .tz("Asia/Kolkata")
        .format("DD MMM YYYY, hh:mm A");
    }
    return "Invalid Date";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Receipt Summary</h2>
        <p className="text-gray-600">Receipt ID: {receipt.id}</p>
        <p className="text-gray-600">
          Generated on: {formatDate(receipt.createdAt)}
        </p>
      </div>

      <div className="border-b pb-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">Mentor Information</h3>
        <p className="text-gray-700">Name: {receipt.mentorName}</p>
        <p className="text-gray-700">Email: {receipt.mentorEmail}</p>
        <p className="text-gray-700">
          Time Range: {formatDate(receipt.timeRange.startDate)} -{" "}
          {formatDate(receipt.timeRange.endDate)}
        </p>
      </div>

      <div className="border-b pb-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">Sessions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Date & Time
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Duration
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Payout
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {receipt.sessionList.map((session, index) => (
                <tr key={index} className="text-sm">
                  <td className="px-4 py-2">{formatDate(session.dateTime)}</td>
                  <td className="px-4 py-2">{session.duration} mins</td>
                  <td className="px-4 py-2">{session.type}</td>
                  <td className="px-4 py-2">
                    {formatCurrency(session.calculatedPayout)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-gray-700">
          <span>Total Payout (Before Deductions)</span>
          <span>{formatCurrency(receipt.totalPayout)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Platform Fee (10%)</span>
          <span>-{formatCurrency(receipt.deduction)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>GST (18%)</span>
          <span>-{formatCurrency(receipt.gst)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg mt-4 pt-4 border-t">
          <span>Final Payout</span>
          <span>{formatCurrency(receipt.finalPayout)}</span>
        </div>
      </div>
    </div>
  );
}

export default ReceiptSummary;
