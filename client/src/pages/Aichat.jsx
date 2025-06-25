import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import API from "../api";

export default function AiChatPage() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded._id || decoded.id);
      } catch (error) {
        console.error("Token decode error:", error);
      }
    }
  }, []);

  // Fetch chat history
  useEffect(() => {
    if (!currentUserId) return;

    const fetchHistory = async () => {
      try {
        const res = await API.get("/ai-chat/history");
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch AI chat history", err);
      }
    };

    fetchHistory();
  }, [currentUserId]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const updatedChat = [...chat, { role: "user", content: message }];
    setChat(updatedChat);
    setMessage("");
    setLoading(true);

    try {
      const res = await API.post("/ai-chat", {
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          ...updatedChat,
        ],
      });

      const aiReply = res.data.reply;
      setChat((prev) => [...prev, { role: "assistant", content: aiReply }]);

      // Refresh history after a new chat is stored
      const historyRes = await API.get("/ai-chat/history");
      setHistory(historyRes.data);
    } catch (err) {
      console.error("AI Chat Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (session) => {
    setSelectedChatId(session._id);
    setChat(session.messages);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar with history */}
      <div className="w-full md:w-1/4 border-r p-4 overflow-y-auto bg-white">
        <h2 className="text-xl font-bold mb-4">AI Assistant</h2>
        <p className="text-sm text-gray-600 mb-4">Past Conversations</p>

        {history.length === 0 && (
          <p className="text-gray-500 text-sm">No past chats yet.</p>
        )}

        <div className="space-y-2">
          {history.map((session) => (
            <div
              key={session._id}
              onClick={() => handleSelectHistory(session)}
              className={`cursor-pointer p-2 rounded text-sm border ${
                selectedChatId === session._id ? "bg-purple-100" : "hover:bg-gray-100"
              }`}
            >
              {new Date(session.createdAt).toLocaleString()}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-1 p-2 md:p-4 flex flex-col bg-gray-100">
        <div className="flex-1 overflow-y-auto rounded p-2 md:p-4 space-y-2">
          {chat.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-md w-fit max-w-[80%] ${
                msg.role === "user"
                  ? "ml-auto bg-blue-500 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="bg-gray-300 text-black p-2 rounded-md w-fit">
              AI is thinking...
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <input
            className="flex-1 border px-3 py-2 rounded"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask something..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
