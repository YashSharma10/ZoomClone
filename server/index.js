import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import userRoutes from "./routes/userRoute.js";
import Message from "./models/Message.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("No token"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);
  socket.join(socket.userId);

  socket.on("private-message", async ({ to, content }) => {
    if (to === socket.userId) {
      return socket.emit("error", { message: "You cannot message yourself." });
    }
    const newMsg = await Message.create({
      sender: socket.userId,
      receiver: to,
      content,
    });

    const payload = {
      _id: newMsg._id,
      content,
      sender: { _id: socket.userId },
      receiver: { _id: to },
      timestamp: newMsg.timestamp,
    };

    io.to(to).emit("private-message", payload);
    io.to(socket.userId).emit("private-message", payload);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch(err => console.error(err));