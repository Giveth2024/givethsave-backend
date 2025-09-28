// functions/savings.js
const pool = require("../config/db")

// Ensure savings table exists
async function ensureSavingsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS savings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clerk_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        tags VARCHAR(255),
        fees DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (clerk_id) REFERENCES users(clerk_id) ON DELETE CASCADE
      )
    `)
    console.log("✅ Savings table ready")
  } catch (err) {
    console.error("❌ Error ensuring savings table:", err)
  }
}

module.exports = { ensureSavingsTable }
