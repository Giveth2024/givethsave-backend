// functions/goals.js
const pool = require("../config/db")

async function ensureGoalsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clerk_id VARCHAR(255) NOT NULL,
        goal_name VARCHAR(255) NOT NULL,
        target_amount DECIMAL(12,2) NOT NULL,
        progress DECIMAL(12,2) DEFAULT 0,
        due_date DATE,
        status ENUM('Ongoing','Completed','Failed') DEFAULT 'Ongoing',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("✅ Goals table ready")
  } catch (err) {
    console.error("❌ Error ensuring goals table:", err)
  }
}

module.exports = { ensureGoalsTable }
