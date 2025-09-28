const express = require("express")
const router = express.Router()
const pool = require("../config/db")

router.post("/users", async (req, res) => {
  const { clerkId } = req.body
  if (!clerkId) return res.status(400).json({ error: "clerkId is required" })

  try {
    // Check if user already exists
    const [rows] = await pool.query(
      "SELECT id FROM users WHERE clerk_id = ?",
      [clerkId]
    )

    if (rows.length > 0) {
      return res.status(200).json({ message: "User is already registered" })
    }

    // Insert new user
    const [result] = await pool.query(
      "INSERT INTO users (clerk_id) VALUES (?)",
      [clerkId]
    )

    console.log(`Inserted Clerk ID: ${clerkId}, ID: ${result.insertId}`)
    res.status(200).json({ message: "User was registered successfully" })
  } catch (error) {
    console.error("Error writing user to database:", error)
    res.status(500).json({ error: "Unable to register new user" })
  }
})

module.exports = router
