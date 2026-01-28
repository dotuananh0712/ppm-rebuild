import "dotenv/config";
import express from "express";
import path from "path";
import { createServer } from "http";
import routes from "./routes";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Create HTTP server
const server = createServer(app);

async function startServer() {
  // In development, use Vite for frontend HMR
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(server, app);
  } else {
    // In production, serve static files
    const publicPath = path.join(process.cwd(), "dist", "public");
    app.use(express.static(publicPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(publicPath, "index.html"));
    });
  }

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer().catch(console.error);

export default app;
