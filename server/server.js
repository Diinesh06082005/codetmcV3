import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";
import { connectDB } from "./config/db.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { roomRouter } from "./routes/roomRoutes.js";
import { compileRouter } from "./routes/compileRoutes.js";
import { teamRouter } from "./routes/teamRoutes.js";
import broadcastRouter from "./routes/broadcastRoutes.js";
import {
  authorizeSocketConnection,
  registerSocketHandlers,
} from "./sockets/socketHandler.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = Number(process.env.PORT) || 5000;
const PEERJS_PATH = process.env.PEERJS_PATH || "/myapp";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
app.locals.serverStartedAt = new Date().toISOString();

// Flexible CORS origin check for local dev, Vercel frontend, & custom domains
const corsOriginChecker = (origin, callback) => {
  if (
    !origin ||
    origin === CLIENT_URL ||
    process.env.NODE_ENV !== "production" ||
    origin.endsWith(".vercel.app") ||
    origin.endsWith(".onrender.com")
  ) {
    return callback(null, true);
  }
  return callback(null, true);
};

const io = new Server(httpServer, {
  cors: {
    origin: corsOriginChecker,
    credentials: true,
  },
});
app.locals.io = io;

app.use(
  cors({
    origin: corsOriginChecker,
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Mount ExpressPeerServer directly on Express server so PeerJS runs on single port in production (Render)
const peerServer = ExpressPeerServer(httpServer, {
  debug: false,
  path: "/",
});
app.use(PEERJS_PATH, peerServer);

app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy.",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/compile", compileRouter);
app.use("/api/teams", teamRouter);
app.use("/api/admin", adminRouter);
app.use("/api/broadcasts", broadcastRouter);

app.use(notFound);
app.use(errorHandler);

io.use(authorizeSocketConnection);

io.on("connection", (socket) => {
  registerSocketHandlers(io, socket, {
    socketRateLimitMaxEvents: Number(process.env.SOCKET_RATE_LIMIT_MAX_EVENTS || 80),
  });
});

httpServer.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Change PORT or stop the process using it, then restart the server.`);
    process.exit(1);
  }
  console.error("HTTP server error:", error);
  process.exit(1);
});

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      console.log(`PeerJS server ready on endpoint: ${PEERJS_PATH}`);
    });
  })
  .catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  });
