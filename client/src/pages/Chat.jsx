// ChatPage.jsx
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import API from "../api";
import socket from "../socket";
import VideoCall from "./VideoCall";

import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  AppBar,
  Toolbar,
} from "@mui/material";

export default function ChatPage() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [videoCallActive, setVideoCallActive] = useState(false);

  const navigate = useNavigate();

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

  const startVideoCall = () => {
    setVideoCallActive(true);
  };

  const goToAiChat = () => {
    navigate("/ai-chat");
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f5f5f5" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: { xs: "100%", md: "25%" },
          borderRight: "1px solid #ccc",
          bgcolor: "#fff",
          p: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          💬 Contacts
        </Typography>

        <Button
          variant="contained"
          fullWidth
          sx={{ mb: 2, bgcolor: "#7b1fa2", ":hover": { bgcolor: "#6a1b9a" } }}
          onClick={goToAiChat}
        >
          🧐 Chat with AI
        </Button>

        <List dense>
          {users
            .filter((u) => String(u._id) !== String(currentUserId))
            .map((user) => (
              <ListItem
                key={user._id}
                button
                selected={selectedUserId === user._id}
                onClick={() => {
                  setSelectedUserId(user._id);
                  setVideoCallActive(false);
                }}
              >
                <ListItemText primary={user.email} />
              </ListItem>
            ))}
        </List>
      </Box>

      {/* Chat Section */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#e0e0e0",
        }}
      >
        {/* Topbar with Selected User */}
        <AppBar
          position="static"
          sx={{ bgcolor: "#1976d2", color: "white", px: 2 }}
          elevation={1}
        >
          <Toolbar disableGutters>
            <Typography variant="h6">
              {selectedUserId
                ? users.find((u) => u._id === selectedUserId)?.email ||
                  "Loading..."
                : "Select a contact"}
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            p: 2,
          }}
        >
          {chat.map((msg, i) => (
            <Paper
              key={i}
              sx={{
                alignSelf:
                  msg.sender._id === currentUserId
                    ? "flex-end"
                    : "flex-start",
                bgcolor:
                  msg.sender._id === currentUserId ? "#1976d2" : "#ffffff",
                color:
                  msg.sender._id === currentUserId ? "#fff" : "text.primary",
                px: 2,
                py: 1,
                borderRadius: 2,
                maxWidth: "70%",
              }}
              elevation={1}
            >
              {msg.content}
            </Paper>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Input Area */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
            px: 2,
            pb: 2,
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ bgcolor: "#fff", borderRadius: 1 }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            sx={{ bgcolor: "#1976d2", ":hover": { bgcolor: "#1565c0" } }}
          >
            📩 Send
          </Button>
          <Button variant="contained" color="success" onClick={startVideoCall}>
            📹 Video Call
          </Button>
        </Box>

        {videoCallActive && currentUserId && selectedUserId && (
          <VideoCall
            currentUserId={currentUserId}
            selectedUserId={selectedUserId}
            onClose={() => setVideoCallActive(false)}
          />
        )}
      </Box>
    </Box>
  );
}