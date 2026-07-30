import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side storage configuration
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "entries.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}), "utf-8");
  }
}

function readEntries(): Record<number, any> {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading entries data file:", err);
    return {};
  }
}

function writeEntries(entries: Record<number, any>) {
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing entries data file:", err);
  }
}

// REST API Endpoints
app.get("/api/entries", (_req, res) => {
  const entries = readEntries();
  res.json({ success: true, entries });
});

app.post("/api/entries", (req, res) => {
  const { dayNumber, text, gradientId, dateString } = req.body;
  if (typeof dayNumber !== "number") {
    res.status(400).json({ success: false, error: "Invalid day number" });
    return;
  }

  const entries = readEntries();
  const newEntry = {
    id: `day-${dayNumber}`,
    dayNumber,
    text: text || "",
    gradientId: gradientId || "prism",
    createdAt: Date.now(),
    dateString: dateString || `Day ${dayNumber}`,
  };

  entries[dayNumber] = newEntry;
  writeEntries(entries);
  res.json({ success: true, entry: newEntry, entries });
});

app.delete("/api/entries/:dayNumber", (req, res) => {
  const dayNumber = parseInt(req.params.dayNumber, 10);
  if (isNaN(dayNumber)) {
    res.status(400).json({ success: false, error: "Invalid day number" });
    return;
  }

  const entries = readEntries();
  delete entries[dayNumber];
  writeEntries(entries);
  res.json({ success: true, entries });
});

app.post("/api/entries/reset", (_req, res) => {
  writeEntries({});
  res.json({ success: true, entries: {} });
});

app.post("/api/entries/demo", (req, res) => {
  const { entries: demoEntries } = req.body;
  writeEntries(demoEntries || {});
  res.json({ success: true, entries: demoEntries || {} });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
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

startServer();
