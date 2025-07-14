import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import crypto from "crypto";
import Database from "better-sqlite3";
import { saveEncryptedMessage } from "./db.js";

dotenv.config();
const app = express();

/* ───────── middleware ───────── */
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

/* ───────── SQLite: create / migrate table ───────── */
const db = new Database("usage.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS usage (
    id         INTEGER PRIMARY KEY,
    ts         INTEGER NOT NULL,
    user       TEXT,
    tone       TEXT,
    original   TEXT,
    rephrased  TEXT
  );
`);
/* add new columns if DB was created by an old version */
const existingCols = db
  .prepare("PRAGMA table_info(usage)")
  .all()
  .map((r) => r.name);
["tone", "original", "rephrased"]
  .filter((c) => !existingCols.includes(c))
  .forEach((col) => db.exec(`ALTER TABLE usage ADD COLUMN ${col} TEXT;`));

/* ───────── /rephrase → FastAPI proxy ───────── */
app.post("/rephrase", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    // FastAPI returns {original, tone, rephrased}
    const { data } = await axios.post("http://localhost:8000/rephrase", {
      message,
    });

    // 🔧 NEW: pass FastAPI's full payload straight back
    res.json(data);
  } catch (err) {
    console.error("❌ FastAPI error:", err?.response?.data || err.message);
    res.status(500).json({
      error: "Rephrase failed",
      details: err?.response?.data || err.message,
    });
  }
});

/* ───────── /encrypt (unchanged) ───────── */  
app.post("/encrypt", (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const algorithm = "aes-256-cbc";
    const key = crypto
      .createHash("sha256")
      .update(String(process.env.ENCRYPTION_KEY))
      .digest("base64")
      .substr(0, 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(message, "utf8", "hex");
    encrypted += cipher.final("hex");

    const encryptedData = iv.toString("hex") + ":" + encrypted;
    saveEncryptedMessage(encryptedData);
    return res.json({ status: "success", encrypted: encryptedData });
  } catch (err) {
    console.error("Encryption error:", err.message);
    return res
      .status(500)
      .json({ error: "Encryption failed", details: err.message });
  }
});

/* ───────── /usage → store one accepted suggestion ───────── */
app.post("/usage", (req, res) => {
  const { ts, user, tone, original, rephrased } = req.body;
  if (!ts || !user)
    return res.status(400).json({ error: "ts & user required" });

  db.prepare(
    `INSERT INTO usage (ts, user, tone, original, rephrased)
     VALUES (?, ?, ?, ?, ?)`
  ).run(ts, user, tone ?? null, original ?? null, rephrased ?? null);

  return res.sendStatus(204);
});

/* ───────── /stats/daily → simple daily counts ───────── */
app.get("/stats/daily", (_, res) => {
  const rows = db
    .prepare(
      `
      SELECT date(ts/1000,'unixepoch') AS day,
             COUNT(*)                  AS total,
             COUNT(DISTINCT user)      AS unique_users
      FROM usage
      GROUP BY day
      ORDER BY day
    `
    )
    .all();
  res.json(rows);
});
/* ───────── /stats/daily-tone → counts per tone ───────── */
app.get("/stats/daily-tone", (_, res) => {
  const rows = db
    .prepare(
      `
      SELECT date(ts/1000,'unixepoch') AS day,
             COALESCE(tone,'neutral')  AS tone,
             COUNT(*)                  AS total
      FROM usage
      GROUP BY day, tone
      ORDER BY day
    `
    )
    .all();
  res.json(rows);
});


const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Node.js server running at http://localhost:${PORT}`)
);
