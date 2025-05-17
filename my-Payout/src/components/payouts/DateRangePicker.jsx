import React from "react";
import dayjs from "../../utils/dayjs-config";

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
    const now = dayjs().tz("Asia/Kolkata");
    const endDate = now.endOf("day");
    const startDate = now.subtract(days - 1, "day").startOf("day");

    console.log("DateRangePicker - Preset Change:", {
      preset,
      startDate: startDate.format("YYYY-MM-DD HH:mm:ss"),
      endDate: endDate.format("YYYY-MM-DD HH:mm:ss"),
      timezone: "Asia/Kolkata",
    });

    onChange({
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
      preset,
    });
  };

  const handleDateChange = (field, value) => {
    // Parse the date in IST timezone
    const date = value ? dayjs.tz(value, "Asia/Kolkata") : null;

    // Set start date to start of day and end date to end of day in IST
    const adjustedDate =
      date && (field === "startDate" ? date.startOf("day") : date.endOf("day"));

    console.log("DateRangePicker - Date Change:", {
      field,
      inputValue: value,
      adjustedDate: adjustedDate?.format("YYYY-MM-DD HH:mm:ss"),
      timezone: "Asia/Kolkata",
    });

    onChange({
      ...dateRange,
      [field]: adjustedDate ? adjustedDate.toDate() : null,
      preset: "custom",
    });
  };

  // Format date for display in IST
  const formatDate = (date) => {
    return date ? dayjs.tz(date, "Asia/Kolkata").format("YYYY-MM-DD") : "";
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
              value={formatDate(dateRange.startDate)}
              max={formatDate(dateRange.endDate)}
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
              value={formatDate(dateRange.endDate)}
              min={formatDate(dateRange.startDate)}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
