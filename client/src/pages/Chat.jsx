import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import API from "../api";
import socket from "../socket";

export default function ChatPage() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;

    API.get(`/chat/${selectedUserId}`)
      .then((res) => setChat(res.data))
      .catch((err) => console.error(err));

    socket.on("private-message", (msg) => {
      if (
        msg.sender._id === selectedUserId ||
        msg.receiver._id === selectedUserId
      ) {
        setChat((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("private-message");
    };
  }, [selectedUserId]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("private-message", {
        to: selectedUserId,
        content: message,
      });
      setMessage("");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Contacts Sidebar */}
      <div className="w-1/4 border-r p-4 overflow-y-auto bg-white">
        <h2 className="text-xl font-bold mb-4">Contacts</h2>
        {users
          .filter((u) => String(u._id) !== String(currentUserId))
          .map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUserId(user._id)}
              className={`cursor-pointer p-2 rounded ${
                selectedUserId === user._id ? "bg-blue-100" : ""
              }`}
            >
              {user.email}
            </div>
          ))}
      </div>

      {/* Chat Section */}
      <div className="flex-1 p-4 flex flex-col bg-gray-100">
        <div className="flex-1 overflow-y-auto rounded p-4 space-y-2">
          {chat.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded-md w-fit max-w-[60%] ${
                msg.sender._id === currentUserId
                  ? "ml-auto bg-blue-500 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>

        <div className="flex mt-4 gap-2">
          <input
            className="flex-1 border px-2 py-2 rounded"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
