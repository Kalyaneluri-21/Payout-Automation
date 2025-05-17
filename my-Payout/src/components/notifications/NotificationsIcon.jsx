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
import dayjs from "../../utils/dayjs-config";
import toast from "react-hot-toast";

function NotificationsIcon({ userEmail }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userEmail) {
      console.log("NotificationsIcon: No user email provided");
      return;
    }

    console.log("NotificationsIcon: Setting up notifications listener for", userEmail);

    const notificationsRef = collection(db, "notifications");
    
    // Create the query with error handling for missing index
    let q;
    try {
      q = query(
        notificationsRef,
        where("recipientEmail", "==", userEmail),
        orderBy("createdAt", "desc")
      );
    } catch (error) {
      console.error("NotificationsIcon: Error creating query:", error);
      // Fallback query without ordering if index doesn't exist
      q = query(
        notificationsRef,
        where("recipientEmail", "==", userEmail)
      );
    }

    console.log("NotificationsIcon: Query created, subscribing to updates...");

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("NotificationsIcon: Received snapshot update, docs count:", snapshot.size);
        const uniqueNotifications = new Map();
        let count = 0;

        // Convert snapshot to array and sort by createdAt if needed
        let docs = snapshot.docs;
        if (!q._query.orderBy) {
          docs = docs.sort((a, b) => b.data().createdAt?.seconds - a.data().createdAt?.seconds);
        }

        docs.forEach((doc) => {
          const notification = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          };
          console.log("NotificationsIcon: Processing notification:", {
            id: notification.id,
            type: notification.type,
            read: notification.read,
            recipientEmail: notification.recipientEmail
          });

          if (!notification.read) {
            count++;
          }

          // For receipt notifications, use receipt ID as key to avoid duplicates
          const key = notification.receiptData?.id || notification.id;
          if (!uniqueNotifications.has(key)) {
            uniqueNotifications.set(key, notification);
          }
        });

        console.log("NotificationsIcon: Setting notifications state with count:", count);
        setUnreadCount(count);
        setNotifications(Array.from(uniqueNotifications.values()));
      },
      (error) => {
        console.error("NotificationsIcon: Error fetching notifications:", error);
        // Show error message to user
        toast.error("Failed to load notifications. Please try refreshing the page.");
        // Create a link to create the index if that's the issue
        if (error.code === 'failed-precondition') {
          console.log("To fix this error, create an index here:", error.message.split("here: ")[1]);
        }
      }
    );

    return () => {
      console.log("NotificationsIcon: Cleaning up notifications listener");
      unsubscribe();
    };
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

      // Close dropdown when viewing receipt
      setShowDropdown(false);
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    try {
      const d = dayjs(date);
      return d.fromNow();
    } catch (error) {
      console.error("Error formatting date:", error);
      return dayjs(date).format("DD MMM YYYY");
    }
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
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
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
                No notifications
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      notification.read
                        ? "bg-gray-50 hover:bg-gray-100"
                        : "bg-blue-50 hover:bg-blue-100"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">
                          {notification.message}
                        </p>
                        {notification.type === "receipt" && (
                          <p className="text-sm font-semibold text-green-600 mt-1">
                            Amount: {formatCurrency(notification.receiptData.finalPayout)}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
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
