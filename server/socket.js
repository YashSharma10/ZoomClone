// socket.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "./models/Message.js";

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Auth middleware
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

    // Private messaging
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

    // ======================
    // WebRTC Signaling Events
    // ======================

    // Initiate call
    socket.on("call-user", ({ to, offer, callType }) => {
      io.to(to).emit("incoming-call", {
        from: socket.userId,
        offer,
        callType, // "video" or "voice"
      });
    });

    // Answer call
    socket.on("answer-call", ({ to, answer }) => {
      io.to(to).emit("call-answered", {
        from: socket.userId,
        answer,
      });
    });

    // Exchange ICE candidates
    socket.on("ice-candidate", ({ to, candidate }) => {
      io.to(to).emit("ice-candidate", {
        from: socket.userId,
        candidate,
      });
    });

    // End call
    socket.on("end-call", ({ to }) => {
      io.to(to).emit("call-ended", {
        from: socket.userId,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });
}
