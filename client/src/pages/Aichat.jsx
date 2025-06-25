// AiChatPage.jsx
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import API from "../api";
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

export default function AiChatPage() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

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
        messages: updatedChat,
      });

      const aiReply = res.data.reply;
      const finalChat = [...updatedChat, { role: "assistant", content: aiReply }];
      setChat(finalChat);

      // Do NOT manually store history here; backend handles it.

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

  const handleNewChat = () => {
    setSelectedChatId(null);
    setChat([]);
    setMessage("");
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
          🤖 AI Assistant
        </Typography>

        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate("/chat")}
          sx={{ mb: 1 }}
        >
          🔙 Back to Chat
        </Button>

        <Button
          variant="contained"
          fullWidth
          onClick={handleNewChat}
          sx={{ mb: 2, bgcolor: "#1976d2" }}
        >
          ✨ New Chat
        </Button>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Past Conversations
        </Typography>

        <List dense>
          {history.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No past chats yet.
            </Typography>
          ) : (
            history.map((session) => (
              <ListItem
                key={session._id}
                button
                selected={selectedChatId === session._id}
                onClick={() => handleSelectHistory(session)}
              >
                <ListItemText
                  primary={new Date(session.createdAt).toLocaleString()}
                />
              </ListItem>
            ))
          )}
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
        <AppBar
          position="static"
          sx={{ bgcolor: "#1976d2", color: "white", px: 2 }}
          elevation={1}
        >
          <Toolbar disableGutters>
            <Typography variant="h6">AI Chat</Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: 2, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
          {chat.map((msg, index) => (
            <Paper
              key={index}
              sx={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                bgcolor: msg.role === "user" ? "#1976d2" : "#ffffff",
                color: msg.role === "user" ? "#fff" : "text.primary",
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

          {loading && (
            <Paper sx={{ bgcolor: "#fff", px: 2, py: 1, borderRadius: 2 }}>
              AI is thinking...
            </Paper>
          )}
        </Box>

        <Divider />

        <Box sx={{ p: 2, display: "flex", gap: 1, flexDirection: { xs: "column", sm: "row" } }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask something..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ bgcolor: "#fff", borderRadius: 1 }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={loading}
            sx={{ bgcolor: "#1976d2", ":hover": { bgcolor: "#1565c0" } }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
}