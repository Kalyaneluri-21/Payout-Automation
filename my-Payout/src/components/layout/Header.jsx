import React from "react";
import { Link, useLocation } from "react-router-dom";
import NotificationsIcon from "../notifications/NotificationsIcon";

function Header({ userRole }) {
  const location = useLocation();
  const userEmail = localStorage.getItem("userEmail");

  const isActive = (path) => {
    if (userRole === "admin") {
      return location.pathname === `/admin${path}`;
    }
    return location.pathname === `/mentor${path}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    window.location.href = "/";
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 mr-8">
              {userRole === "admin" ? "Admin Dashboard" : "Mentor Dashboard"}
            </h1>
            <nav className="flex space-x-4">
              {userRole === "admin" ? (
                <>
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("")
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/sessions"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/sessions")
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Sessions
                  </Link>
                  <Link
                    to="/admin/payouts"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/payouts")
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Payouts
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/mentor"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("")
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/mentor/sessions"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/sessions")
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    My Sessions
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {userRole === "mentor" && (
              <NotificationsIcon userEmail={userEmail} />
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
