import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../slice/AuthSlice";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import toast from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formerror, setFormerror] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Query Firestore to check if the user exists
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("User not found. Please check your email.");
        return;
      }

      const userData = querySnapshot.docs[0].data();

      // Store user data in localStorage
      localStorage.setItem("userEmail", userData.email);
      localStorage.setItem("userRole", userData.role);
      localStorage.setItem("userName", userData.name || "");

      // Navigate based on role
      if (userData.role === "admin") {
        navigate("/admin");
      } else if (userData.role === "mentor") {
        navigate("/mentor");
      }

      toast.success("Login successful!");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 fixed inset-0">
      <div className="w-[400px] space-y-8 transform transition-all duration-500 ease-in-out hover:scale-[1.01]">
        <div className="bg-white p-12 rounded-xl shadow-2xl">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-600 mb-8">
              Please sign in to your account
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                transition duration-150 ease-in-out"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                transition duration-150 ease-in-out"
              />
            </div>

            {formerror && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{formerror}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                                bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                transition duration-150 ease-in-out transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out"
              >
                Sign up
              </a>
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
