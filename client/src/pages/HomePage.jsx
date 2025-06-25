import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaRocket, FaVideo, FaComments, FaMicrophone, FaRobot } from "react-icons/fa";

export default function HomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/chat");
  };

  return (
    <div className="bg-[#f0f2f5] min-h-screen text-gray-900 font-sans overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex justify-center items-center px-6 py-6 shadow-md bg-white"
      >
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-3xl font-extrabold text-blue-700 tracking-wider"
        >
          SparkConnect
        </motion.h1>
      </motion.header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 py-20 max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-5xl font-extrabold text-gray-900 mb-6"
        >
          Unite. Collaborate. Innovate.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-lg text-gray-600 max-w-2xl"
        >
          All-in-one platform for real-time chat, video calls, voice communication,
          screen sharing, and AI-powered conversations.
        </motion.p>

        <motion.button
          onClick={handleGetStarted}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6, type: "spring", stiffness: 200 }}
          className="mt-10 px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full text-lg shadow-lg hover:scale-105 transition-transform"
        >
          🚀 Get Started
        </motion.button>
      </section>

      {/* Features Animation Showcase */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-2 md:grid-cols-4 gap-10 text-center">
          <motion.div whileHover={{ scale: 1.1 }} className="p-6 bg-[#f9fafb] rounded-xl shadow-md">
            <FaVideo className="text-blue-600 text-4xl mx-auto mb-2 animate-pulse" />
            <h3 className="font-bold text-lg">Video Call</h3>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} className="p-6 bg-[#f9fafb] rounded-xl shadow-md">
            <FaMicrophone className="text-green-600 text-4xl mx-auto mb-2 animate-bounce" />
            <h3 className="font-bold text-lg">Voice Chat</h3>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} className="p-6 bg-[#f9fafb] rounded-xl shadow-md">
            <FaComments className="text-purple-600 text-4xl mx-auto mb-2 animate-pulse" />
            <h3 className="font-bold text-lg">Live Messaging</h3>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} className="p-6 bg-[#f9fafb] rounded-xl shadow-md">
            <FaRobot className="text-yellow-600 text-4xl mx-auto mb-2 animate-bounce" />
            <h3 className="font-bold text-lg">AI Assistant</h3>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="bg-blue-700 text-white text-center py-6 mt-10"
      >
        <p className="text-sm">© {new Date().getFullYear()} SparkConnect. All rights reserved.</p>
      </motion.footer>
    </div>
  );
}