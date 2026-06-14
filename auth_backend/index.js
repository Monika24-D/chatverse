import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import AuthRouter from "./Routes/Auth.route.js";
import usersrouter from "./Routes/users.route.js";
import connectToMongoDB from "./db/connectToMongoDB.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(cookieParser());

/* =========================
   CORS CONFIG (FIXED)
========================= */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8082",
  "http://ec2-23-21-6-108.compute-1.amazonaws.com:3000",
  "http://ec2-23-21-6-108.compute-1.amazonaws.com:8082",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* =========================
   ROUTES
========================= */
app.use("/Auth", AuthRouter);
app.use("/users", usersrouter);

app.get("/", (req, res) => {
  res.send("Welcome to HHLD Chat App 🚀");
});

/* =========================
   HTTP SERVER
========================= */
const server = http.createServer(app);

/* =========================
   SOCKET.IO (FIXED)
========================= */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/* =========================
   SOCKET EVENTS
========================= */
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  const username = socket.handshake.query.username;
  console.log("Username:", username);

  /* -------------------------
     CHAT MESSAGE EVENT
  -------------------------- */
  socket.on("chat msg", (msg) => {
    console.log("Message received:", msg);

    // 🔥 BROADCAST MESSAGE
    io.emit("chat msg", msg);
  });

  /* -------------------------
     DISCONNECT
  -------------------------- */
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

/* =========================
   START SERVER
========================= */
server.listen(PORT, async () => {
  try {
    await connectToMongoDB();
    console.log(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error("MongoDB Error:", err);
  }
});