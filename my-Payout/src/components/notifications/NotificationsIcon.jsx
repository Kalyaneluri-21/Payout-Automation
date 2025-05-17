import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import ReceiptSummary from "../payouts/ReceiptSummary";

function NotificationsIcon({ userEmail }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    if (!userEmail) return;

    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("recipientEmail", "==", userEmail),
      where("read", "==", false),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const uniqueNotifications = new Map();

        snapshot.forEach((doc) => {
          const notification = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          };

          // For receipt notifications, use receipt ID as key to avoid duplicates
          const key = notification.receiptData?.id || notification.id;
          if (!uniqueNotifications.has(key)) {
            uniqueNotifications.set(key, notification);
          }
        });

        setNotifications(Array.from(uniqueNotifications.values()));
      },
      (error) => {
        console.error("Error fetching notifications:", error);
      }
    );

    return () => unsubscribe();
  }, [userEmail]);

  const handleNotificationClick = async (notification) => {
    try {
      // Mark notification as read
      await updateDoc(doc(db, "notifications", notification.id), {
        read: true,
        readAt: Timestamp.now(),
      });

      // If it's a receipt notification, show the receipt
      if (notification.type === "receipt" && notification.receiptData) {
        setSelectedReceipt(notification.receiptData);
      }
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Notifications
            </h3>
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No new notifications
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <p className="text-sm text-gray-800">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl m-4">
            <div className="p-6">
              <ReceiptSummary receipt={selectedReceipt} />
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-lg">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsIcon;
