import React from "react";

function PayoutSummaryCard({ data, onOverride }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const SummaryItem = ({ label, value, isHighlighted = false }) => (
    <div
      className={`flex justify-between items-center py-3 ${
        isHighlighted ? "font-semibold" : ""
      }`}
    >
      <span className="text-gray-600">{label}</span>
      <span
        className={`${
          isHighlighted ? "text-blue-600 text-lg" : "text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Payout Summary</h2>
        <button
          onClick={onOverride}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Manual Override
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-gray-600">Gross Payout</span>
          <span className="text-gray-900 font-medium">
            ₹{data.grossPayout.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-gray-600">Platform Fee (10%)</span>
          <span className="text-red-600 font-medium">
            -₹{data.deductions.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-gray-600">GST (18%)</span>
          <span className="text-yellow-600 font-medium">
            -₹{data.gst.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center py-4 bg-gray-50 rounded-lg px-4 mt-6">
          <div>
            <span className="text-lg font-semibold text-gray-900">
              Net Payable Amount
            </span>
            {data.isOverridden && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Overridden
              </span>
            )}
          </div>
          <span className="text-2xl font-bold text-green-600">
            ₹{data.netPayable.toFixed(2)}
          </span>
        </div>

        {data.isOverridden && data.overrideReason && (
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">Override reason:</span>{" "}
            {data.overrideReason}
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="bg-blue-50 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700">
                Click "Manual Override" to adjust the final payout amount if
                needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PayoutSummaryCard;
