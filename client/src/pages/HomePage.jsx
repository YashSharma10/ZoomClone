import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const startMeeting = () => {
    const roomId = crypto.randomUUID();
    navigate(`/meeting/${roomId}`);
  };

  return (
    <div className="bg-white text-gray-900 font-sans">
      <header className="flex justify-between items-center p-6 shadow-md">
        <h1 className="text-2xl font-bold text-blue-600">ZoomClone</h1>
        <div className="space-x-4">
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Login
          </Link>
          <Link to="/signup">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Sign Up
            </button>
          </Link>
        </div>
      </header>

      <section className="flex flex-col lg:flex-row items-center px-6 py-16 max-w-7xl mx-auto">
        <div className="lg:w-1/2 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">
            Connect. Collaborate. Communicate.
          </h2>
          <p className="text-lg text-gray-600">
            Host meetings and video calls easily with ZoomClone.
          </p>
          <button
            onClick={startMeeting}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Start a Meeting
          </button>
        </div>
        <div className="lg:w-1/2 mt-10 lg:mt-0">
          <img
            src="https://img.freepik.com/free-vector/video-conferencing-concept-illustration_114360-4766.jpg"
            alt="Video"
            className="w-full"
          />
        </div>
      </section>

      <footer className="bg-blue-600 text-white p-6 text-center">
        © {new Date().getFullYear()} ZoomClone. All rights reserved.
      </footer>
    </div>
  );
}
