import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { roomRouter } from "./routes/roomRoutes.js";
import { compileRouter } from "./routes/compileRoutes.js";
import {
  authorizeSocketConnection,
  registerSocketHandlers,
} from "./sockets/socketHandler.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
app.locals.serverStartedAt = new Date().toISOString();

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});
app.locals.io = io;

app.use(
  cors({
    origin: CLIENT_URL,
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
app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy.",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/compile", compileRouter);
app.use("/api/admin", adminRouter);


app.use(notFound);
app.use(errorHandler);

io.use(authorizeSocketConnection);

io.on("connection", (socket) => {
  registerSocketHandlers(io, socket, {
    socketRateLimitMaxEvents: Number(process.env.SOCKET_RATE_LIMIT_MAX_EVENTS || 80),
  });
});

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
    
    // Start PeerJS Server on a separate port to avoid WebSocket upgrade conflicts with Socket.io
    import("peer").then(({ PeerServer }) => {
      PeerServer({ port: 5001, path: "/myapp" });
      console.log("PeerJS server running on port 5001");
    });
  })
  .catch((error) => {
    console.error("Server startup failed:", error.message);
  });
