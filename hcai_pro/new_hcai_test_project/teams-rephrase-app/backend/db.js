import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "mydb", // replace with your DB name
  password: "1234", // replace with your password
  port: 5432,
});

// Save encrypted message into Postgres DB
async function saveEncryptedMessage(encryptedMsg) {
  const query = "INSERT INTO encrypted_messages (encrypted_text) VALUES ($1) RETURNING id";
  const values = [encryptedMsg];
  try {
    const res = await pool.query(query, values);
    return res.rows[0].id; // return inserted record ID
  } catch (err) {
    console.error("DB insert error:", err);
    throw err;
  }
}

// Get all encrypted messages from DB
async function getMessages() {
  try {
    const res = await pool.query("SELECT * FROM encrypted_messages ORDER BY created_at DESC");
    return res.rows;
  } catch (err) {
    console.error("DB fetch error:", err);
    throw err;
  }
}

export { saveEncryptedMessage, getMessages };
export default pool;
