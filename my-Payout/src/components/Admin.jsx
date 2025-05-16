import React from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../slice/AuthSlice";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";

function Admin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    dispatch(logoutUser());
    navigate("/");
  }

  // Function to determine if a link is active
  const isActive = (path) => {
    if (path === "/admin" && location.pathname === "/admin") {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">
                  Admin Dashboard
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/admin"
                  className={`${
                    isActive("/admin") && location.pathname === "/admin"
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/sessions"
                  className={`${
                    isActive("/admin/sessions")
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Sessions
                </Link>
                {/* Add more navigation links here */}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - This is where nested routes will render */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Admin;
