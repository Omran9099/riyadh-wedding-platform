require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("FATAL: MONGO_URI is not set in environment");
  process.exit(1);
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.set("io", io);

app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/health", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  res.json({
    ok: true,
    service: "wedding-marketplace-api",
    mongo: states[dbState] ?? "unknown",
  });
});

async function start() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected:", MONGO_URI.replace(/\/\/.*@/, "//***@"));

    io.on("connection", (socket) => {
      console.log(`Socket client connected: ${socket.id}`);
      socket.on("disconnect", () => {
        console.log(`Socket client disconnected: ${socket.id}`);
      });
    });

    httpServer.listen(PORT, () => {
      console.log(`API listening on http://127.0.0.1:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

process.on("SIGINT", async () => {
  io.close();
  httpServer.close();
  await mongoose.connection.close();
  process.exit(0);
});

start();
