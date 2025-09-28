// functions/users.js
const db = require("../config/db")

async function ensureUsersTable() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clerk_Id VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    await db.query(createTableQuery) // using promise-based query
    console.log("✅ Users table ready")
  } catch (err) {
    console.error("❌ Error creating users table:", err)
  }
}

module.exports = { ensureUsersTable }

//When deleting user, Delete all his associalted tables.