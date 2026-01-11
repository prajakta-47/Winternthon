import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import summaryRoutes from "./routes/summary";
import teacherRoutes from "./routes/teacher";

// Import WebSocket manager - just import to initialize
import "./utils/websocket";  // This runs the WebSocket server

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/teacher", teacherRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "Personalized Learning Student Support System API",
    status: "running",
    websocket: "ws://localhost:8080"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server running on ws://localhost:8080`);
});