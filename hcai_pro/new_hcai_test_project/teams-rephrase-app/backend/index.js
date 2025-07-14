import pool from "./db.js";

async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Connected at:", res.rows[0].now);
  } catch (err) {
    console.error("Connection error:", err);
  }
}

testConnection();
