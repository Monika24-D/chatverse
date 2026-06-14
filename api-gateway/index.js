import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8082",
      "http://ec2-23-21-6-108.compute-1.amazonaws.com:3000",
      "http://ec2-23-21-6-108.compute-1.amazonaws.com:8082",
    ],
    credentials: true,
  })
);

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://localhost:8000",
    changeOrigin: true,
  })
);

app.use(
  "/api/users",
  createProxyMiddleware({
    target: "http://localhost:8000",
    changeOrigin: true,
  })
);

app.use(
  "/api/msgs",
  createProxyMiddleware({
    target: "http://localhost:5000",
    changeOrigin: true,
  })
);

const PORT = 8083;

app.listen(PORT, () => {
  console.log(`API Gateway listening on ${PORT}`);
});