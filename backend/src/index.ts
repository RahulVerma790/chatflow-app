import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors"
import http from "http"
import { UserManager} from "./UserManager";
import { connectToDB } from "./db";

import authRoutes from "./features/auth/auth.routes";
import userRoutes from "./features/users/users.routes";
import roomRoutes from "./features/room/room.routes";
import { setupWebSocketServer } from "./websockets/websocketServer";
import { config } from "./config";

const app = express();
const server = http.createServer(app);
const userManager = new UserManager();

connectToDB();
app.use(express.json());
app.use(cors({ origin: config.clientUrl}));

app.use("/api/v1", authRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", roomRoutes);

setupWebSocketServer(server, userManager);

const PORT = config.PORT || 3000;

server.listen(PORT, function() {
    console.log((new Date()) + `Combined HTTP + WebSocket server running on PORT ${config.PORT}.`);
});
  