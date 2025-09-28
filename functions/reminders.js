const pool = require("../config/db")

// Convert a local EAT time string to UTC before storing in DB
function eatToUtc(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number)
  const date = new Date()
  date.setUTCHours(hours - 3, minutes, 0, 0) // EAT is UTC+3
  return date.toTimeString().slice(0, 8) // "HH:MM:SS"
}

// Convert a UTC time string from DB to EAT for display
function utcToEat(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number)
  const date = new Date()
  date.setUTCHours(hours + 3, minutes, 0, 0)
  return date.toTimeString().slice(0, 5) // "HH:MM"
}

// Ensure Reminders table exists
async function ensureRemindersTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        time TIME NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        clerk_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("✅ Reminders table ready")
  } catch (err) {
    console.error("❌ Error ensuring reminders table:", err)
  }
}

// Get all reminders for a clerk (convert time to EAT)
async function getReminders(clerkId) {
  try {
    const [rows] = await pool.query("SELECT * FROM reminders WHERE clerk_id = ?", [clerkId])
    return rows.map(r => ({ ...r, time: utcToEat(r.time) })) // convert time to EAT
  } catch (err) {
    console.error("❌ Error fetching reminders:", err)
    throw err
  }
}

// Insert a new reminder (convert time from EAT → UTC)
async function createReminder({ title, amount, time, active, clerkId }) {
  try {
    const utcTime = eatToUtc(time)
    const [result] = await pool.query(
      "INSERT INTO reminders (title, amount, time, active, clerk_id) VALUES (?, ?, ?, ?, ?)",
      [title, amount, utcTime, active, clerkId]
    )
    return { id: result.insertId, title, amount, time, active, clerk_id: clerkId }
  } catch (err) {
    console.error("❌ Error creating reminder:", err)
    throw err
  }
}

// Update a reminder (convert time from EAT → UTC)
async function updateReminder(id, { title, amount, time, active, clerkId }) {
  try {
    const utcTime = eatToUtc(time)
    await pool.query(
      "UPDATE reminders SET title = ?, amount = ?, time = ?, active = ? WHERE id = ? AND clerk_id = ?",
      [title, amount, utcTime, active, id, clerkId]
    )
    return { id, title, amount, time, active, clerk_id: clerkId }
  } catch (err) {
    console.error("❌ Error updating reminder:", err)
    throw err
  }
}

// Delete a reminder
async function deleteReminder(id, clerkId) {
  try {
    await pool.query("DELETE FROM reminders WHERE id = ? AND clerk_id = ?", [id, clerkId])
    return { id }
  } catch (err) {
    console.error("❌ Error deleting reminder:", err)
    throw err
  }
}

// Export functions
module.exports = {
  ensureRemindersTable,
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder
}
