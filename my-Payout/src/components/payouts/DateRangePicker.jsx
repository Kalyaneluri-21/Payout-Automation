import React from "react";
import dayjs from "dayjs";

function DateRangePicker({ dateRange, onChange }) {
  const presets = [
    { label: "Last 7 days", value: "7" },
    { label: "Last 15 days", value: "15" },
    { label: "Last 30 days", value: "30" },
    { label: "Custom", value: "custom" },
  ];

  const handlePresetChange = (preset) => {
    if (preset === "custom") {
      onChange({
        ...dateRange,
        preset,
      });
      return;
    }

    const days = parseInt(preset);
    const endDate = dayjs();
    const startDate = endDate.subtract(days, "day");

    onChange({
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
      preset,
    });
  };

  const handleDateChange = (field, value) => {
    onChange({
      ...dateRange,
      [field]: value ? new Date(value) : null,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-4">
          {presets.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                dateRange.preset === value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => handlePresetChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {dateRange.preset === "custom" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={
                dateRange.startDate
                  ? dayjs(dateRange.startDate).format("YYYY-MM-DD")
                  : ""
              }
              onChange={(e) => handleDateChange("startDate", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={
                dateRange.endDate
                  ? dayjs(dateRange.endDate).format("YYYY-MM-DD")
                  : ""
              }
              onChange={(e) => handleDateChange("endDate", e.target.value)}
              min={
                dateRange.startDate
                  ? dayjs(dateRange.startDate).format("YYYY-MM-DD")
                  : ""
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
