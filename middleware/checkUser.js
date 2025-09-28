// middleware/checkUser.js
const pool = require("../config/db")

async function checkUser(req, res, next) {
  const clerkId = req.query.clerkId || req.body.clerkId
  if (!clerkId) {
    return res.status(400).json({ error: "clerkId is required" })
  }

  try {
    const [rows] = await pool.query("SELECT id FROM users WHERE clerk_id = ?", [clerkId])
    if (rows.length === 0) {
      return res.status(400).json({ error: "User is not registered" })
    }
    next()
  } catch (err) {
    console.error("Error checking user:", err)
    res.status(500).json({ error: "Unable to verify user" })
  }
}

module.exports = checkUser
