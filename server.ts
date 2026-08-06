import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS for Google Sheets / external tools
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-User-Id, X-Telegram-User-Id");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Server-side storage configuration (using /tmp to avoid triggering tsx watcher restarts)
const DATA_FILE = path.join("/tmp", "tinynote_entries.json");

// In-memory fallback for serverless environments (e.g. Vercel)
let memoryStore: Record<string, Record<number, any>> = {};

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ users: memoryStore }), "utf-8");
    }
  } catch (err) {
    console.warn("FS non-critical warning (using in-memory store):", err);
  }
}

function readAllUsersData(): Record<string, Record<number, any>> {
  try {
    ensureDataFile();
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.users) {
        memoryStore = { ...memoryStore, ...parsed.users };
        return memoryStore;
      }
    }
  } catch (err) {
    console.warn("Error reading entries data file, using memoryStore:", err);
  }
  return memoryStore;
}

function getUserIdFromReq(req: express.Request): string {
  let rawId = "";
  const headerId = req.headers["x-user-id"] || req.headers["x-telegram-user-id"];
  if (headerId && typeof headerId === "string" && headerId.trim()) {
    rawId = headerId.trim();
  } else {
    const queryId = req.query.userId || req.query.user_id;
    if (queryId && typeof queryId === "string" && queryId.trim()) {
      rawId = queryId.trim();
    } else if (req.body && (req.body.userId || req.body.user_id)) {
      rawId = String(req.body.userId || req.body.user_id).trim();
    }
  }

  if (!rawId) return "guest_user";
  // Normalize numeric Telegram user IDs (e.g. 8839781890) to tg_8839781890
  if (/^\d+$/.test(rawId)) {
    return `tg_${rawId}`;
  }
  return rawId;
}

function readUserEntries(userId: string): Record<number, any> {
  const allData = readAllUsersData();
  return allData[userId] || {};
}

function writeUserEntries(userId: string, entries: Record<number, any>) {
  try {
    const allData = readAllUsersData();
    allData[userId] = entries;
    memoryStore[userId] = entries;
    ensureDataFile();
    if (fs.existsSync(DATA_FILE) || fs.existsSync("/tmp")) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ users: allData }, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Error writing entries data file, saved to memoryStore:", err);
  }
}

// REST API Endpoints (supporting both /api/path and /path for Vercel rewrites)
app.get(["/api/health", "/health"], (_req, res) => {
  res.json({ status: "ok", env: process.env.VERCEL ? "vercel" : "node", timestamp: new Date().toISOString() });
});

app.get(["/api/entries", "/entries"], (req, res) => {
  const userId = getUserIdFromReq(req);
  const entries = readUserEntries(userId);
  res.json({ success: true, userId, count: Object.keys(entries).length, entries });
});

// Endpoint for formatted array suitable for Google Sheets / CSV
app.get(["/api/entries/list", "/entries/list"], (req, res) => {
  const userId = getUserIdFromReq(req);
  const entries = readUserEntries(userId);
  const list = Object.values(entries).sort((a, b) => a.dayNumber - b.dayNumber);
  res.json(list);
});

// Endpoint to fetch all entries across all users for Google Sheets sync
app.get(["/api/entries/all", "/entries/all"], (_req, res) => {
  const allUsersData = readAllUsersData();
  const allEntries: any[] = [];
  
  Object.entries(allUsersData).forEach(([userId, userEntries]) => {
    if (userEntries && typeof userEntries === 'object') {
      Object.values(userEntries).forEach((item: any) => {
        allEntries.push({
          userId,
          ...item
        });
      });
    }
  });

  res.json({ success: true, count: allEntries.length, entries: allEntries });
});

app.post(["/api/entries", "/entries"], (req, res) => {
  const userId = getUserIdFromReq(req);
  const { dayNumber, text, gradientId, dateString } = req.body || {};
  if (typeof dayNumber !== "number") {
    res.status(400).json({ success: false, error: "Invalid day number" });
    return;
  }

  const entries = readUserEntries(userId);
  const newEntry = {
    id: `day-${dayNumber}`,
    dayNumber,
    text: text || "",
    gradientId: gradientId || "prism",
    createdAt: Date.now(),
    dateString: dateString || `Day ${dayNumber}`,
  };

  entries[dayNumber] = newEntry;
  writeUserEntries(userId, entries);
  res.json({ success: true, userId, entry: newEntry, entries });
});

app.delete(["/api/entries/:dayNumber", "/entries/:dayNumber"], (req, res) => {
  const userId = getUserIdFromReq(req);
  const dayNumber = parseInt(req.params.dayNumber, 10);
  if (isNaN(dayNumber)) {
    res.status(400).json({ success: false, error: "Invalid day number" });
    return;
  }

  const entries = readUserEntries(userId);
  delete entries[dayNumber];
  writeUserEntries(userId, entries);
  res.json({ success: true, userId, entries });
});

app.post(["/api/entries/reset", "/entries/reset"], (req, res) => {
  const userId = getUserIdFromReq(req);
  writeUserEntries(userId, {});
  res.json({ success: true, userId, entries: {} });
});

app.post(["/api/entries/demo", "/entries/demo"], (req, res) => {
  const userId = getUserIdFromReq(req);
  const { entries: demoEntries } = req.body || {};
  writeUserEntries(userId, demoEntries || {});
  res.json({ success: true, userId, entries: demoEntries || {} });
});

// Catch-all 404 JSON handler for API routes to prevent falling back to HTML
app.all("/api/*", (req, res) => {
  res.status(404).json({ success: false, error: `Endpoint ${req.path} not found` });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    try {
      const viteModule = "vite";
      const { createServer: createViteServer } = await import(/* webpackIgnore: true */ viteModule);
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn("Vite dev server skipped:", err);
    }
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`tinynote API Server running on http://localhost:${PORT}`);
  });
}

if (process.env.VERCEL !== "1") {
  startServer();
}

export default app;
