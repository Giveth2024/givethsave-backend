// routes/savings.js
const express = require("express")
const router = express.Router()
const pool = require("../config/db")
const checkUser = require("../middleware/checkUser")

// Add Saving
router.post("/savings", checkUser, async (req, res) => {
  const { amount, category, tags, fees, notes, clerkId } = req.body

  if (!clerkId || !amount || !category) {
    return res.status(400).json({ error: "clerkId, amount, and category are required" })
  }

  try {
    const now = new Date()
    const date = now.toISOString().split("T")[0] // YYYY-MM-DD
    const time = now.toTimeString().slice(0, 5)  // HH:MM (24hr)

    await pool.query(
      `INSERT INTO savings (clerk_id, date, time, amount, category, tags, fees, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [clerkId, date, time, amount, category, tags || null, fees || 0, notes || null]
    )

    res.status(200).json({ message: "Saving added successfully" })
  } catch (err) {
    console.error("Error inserting saving:", err)
    res.status(500).json({ error: "Unable to add saving" })
  }
})

// Fetch Savings
router.get("/savings", checkUser, async (req, res) => {
  const { clerkId } = req.query

  try {
    const [rows] = await pool.query(
      "SELECT * FROM savings WHERE clerk_id = ? ORDER BY date DESC, time DESC",
      [clerkId]
    )
    res.status(200).json(rows)
  } catch (err) {
    console.error("Error fetching savings:", err)
    res.status(500).json({ error: "Unable to fetch savings" })
  }
})

// Update Saving
router.put("/savings/:id", checkUser, async (req, res) => {
  const { id } = req.params
  const { amount, category, tags, fees, notes, clerkId } = req.body

  try {
    await pool.query(
      `UPDATE savings 
       SET amount = ?, category = ?, tags = ?, fees = ?, notes = ? 
       WHERE id = ? AND clerk_id = ?`,
      [amount, category, tags || null, fees || 0, notes || null, id, clerkId]
    )
    res.status(200).json({ message: "Saving updated successfully" })
  } catch (err) {
    console.error("Error updating saving:", err)
    res.status(500).json({ error: "Unable to update saving" })
  }
})

// Delete Saving
router.delete("/savings/:id", checkUser, async (req, res) => {
  const { id } = req.params
  const { clerkId } = req.body

  try {
    await pool.query("DELETE FROM savings WHERE id = ? AND clerk_id = ?", [id, clerkId])
    res.status(200).json({ message: "Saving deleted successfully" })
  } catch (err) {
    console.error("Error deleting saving:", err)
    res.status(500).json({ error: "Unable to delete saving" })
  }
})

module.exports = router
