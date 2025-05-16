import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Admin from "./components/Admin";
import Mentor from "./components/Mentor";
import Sessions from "./components/sessions/Sessions";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/mentor" element={<Mentor />} />
      <Route path="/admin" element={<Admin />}>
        <Route
          index
          element={<div className="p-6">Welcome to Admin Dashboard</div>}
        />
        <Route path="sessions" element={<Sessions />} />
      </Route>
    </Routes>
  );
}

export default App;
