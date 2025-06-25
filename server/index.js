// index.js or server.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";

import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import userRoutes from "./routes/userRoute.js";
import { initSocket } from "./socket.js";

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

// Initialize Socket.IO
initSocket(server);

// DB & Server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch(err => console.error(err));
