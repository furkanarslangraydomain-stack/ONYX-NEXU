import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { Supervisor } from "./src/lib/agents";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());

  // WebSocket connection handling
  wss.on("connection", (ws) => {
    console.log("Client connected to status stream");
    
    const supervisor = new Supervisor((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'START_PROJECT') {
          console.log("Starting project:", data.payload);
          await supervisor.planProject(data.payload);
        }
      } catch (err) {
        console.error("WS Message Error:", err);
      }
    });

    ws.send(JSON.stringify({ type: 'INIT', message: "Connected to ONYX-Nexus Supervisor" }));
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
