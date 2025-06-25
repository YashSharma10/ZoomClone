import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import API from "../api";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

export default function Dashboard({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const decoded = jwtDecode(token);
        const res = await API.get("/users");
        const currentUser = res.data.find(
          (u) => u._id === decoded._id || u._id === decoded.id
        );

        if (currentUser) {
          setUser(currentUser);
        } else {
          throw new Error("User not found in list");
        }
      } catch (err) {
        console.error("Error fetching user data", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate, isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full text-center relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Your Profile</h1>
        {user ? (
          <div className="text-gray-700 space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.name || "N/A"}</p>
            <p><strong>User ID:</strong> {user._id}</p>
          </div>
        ) : (
          <p>Loading user data...</p>
        )}

        <button
          onClick={handleLogout}
          className="mt-6 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}