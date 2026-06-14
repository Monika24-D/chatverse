import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import msgRoutes from "./routes/msgs.route.js";
import connectToMongoDB from "./db/connectToMongoDB.js";
import { addMsgToConversation } from "./controllers/msgs.controller.js";
import { subscribe, publish } from "./redis/msgsPubSub.js";

const app = express();

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8082",
  "http://ec2-23-21-6-108.compute-1.amazonaws.com:3000",
  "http://ec2-23-21-6-108.compute-1.amazonaws.com:8082",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Chat Server Running 🚀");
});

app.use("/msgs", msgRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = new Map();

const emitOnlineUsers = () => {
  const onlineUsers = Array.from(userSocketMap.keys());
  io.emit("online users", onlineUsers);
};

io.on("connection", (socket) => {
  const username = socket.handshake.query.username;

  console.log(`Connected: ${username} on PORT ${PORT}`);

  if (username) {
    userSocketMap.set(username, socket.id);
  }

  emitOnlineUsers();

  const channel = `chat_${username}`;

  subscribe(channel, (msg) => {
    const parsed = JSON.parse(msg);

    const receiverSocket = userSocketMap.get(parsed.receiver);

    if (receiverSocket) {
      io.to(receiverSocket).emit("chat msg", parsed);
    }
  });

  socket.on("typing", ({ sender, receiver }) => {
    const receiverSocket = userSocketMap.get(receiver);

    if (receiverSocket) {
      io.to(receiverSocket).emit("typing", { sender });
    }
  });

  socket.on("chat msg", async (msg) => {
    try {
      const enrichedMsg = {
        ...msg,
        time: new Date().toISOString(),
      };

      await addMsgToConversation([msg.sender, msg.receiver], {
        text: msg.text,
        sender: msg.sender,
        receiver: msg.receiver,
        time: enrichedMsg.time,
      });

      await publish(
        `chat_${msg.receiver}`,
        JSON.stringify(enrichedMsg)
      );

      const receiverSocket = userSocketMap.get(msg.receiver);

      if (receiverSocket) {
        io.to(receiverSocket).emit("chat msg", enrichedMsg);
      }
    } catch (err) {
      console.log("Socket error:", err);
    }
  });

  socket.on("disconnect", () => {
    userSocketMap.delete(username);
    emitOnlineUsers();
  });
});

server.listen(PORT, "0.0.0.0", async () => {
  try {
    await connectToMongoDB();
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.log(err);
  }
});