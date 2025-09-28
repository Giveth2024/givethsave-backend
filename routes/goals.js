// routes/goals.js
const express = require("express")
const router = express.Router()
const pool = require("../config/db")
const checkUser = require("../middleware/checkUser")

// Get all goals with entry counts
router.get("/goals", checkUser, async (req, res) => {
  const { clerkId } = req.query

  try {
    const [rows] = await pool.query(
      `SELECT g.*, 
              COUNT(s.id) AS total_entries,
              COALESCE(SUM(s.amount - s.fees),0) AS progress
       FROM goals g
       LEFT JOIN savings s ON g.clerk_id = s.clerk_id AND g.goal_name = s.category
       WHERE g.clerk_id = ?
       GROUP BY g.id
       ORDER BY g.created_at DESC`,
      [clerkId]
    )
    res.json(rows)
  } catch (err) {
    console.error("Error fetching goals:", err)
    res.status(500).json({ error: "Unable to fetch goals" })
  }
})

// Fetch all goal names for a user
router.get("/goal-names", checkUser, async (req, res) => {
  const { clerkId } = req.query
  try {
    const [rows] = await pool.query(
      `SELECT id, goal_name 
       FROM goals 
       WHERE clerk_id = ?
       ORDER BY created_at DESC`,
      [clerkId]
    )
    res.json(rows)
  } catch (err) {
    console.error("Error fetching goal names:", err)
    res.status(500).json({ error: "Unable to fetch goal names" })
  }
})


// Add a new goal
// Create Goal
router.post("/goals", checkUser, async (req, res) => {
  const { goalName, targetAmount, dueDate, clerkId } = req.body
  try {
    const [result] = await pool.query(
      `INSERT INTO goals (goal_name, target_amount, due_date, clerk_id, status) 
       VALUES (?, ?, ?, ?, 'Ongoing')`,
      [goalName, targetAmount, dueDate, clerkId]
    )
    res.status(201).json({ id: result.insertId, goalName, targetAmount, dueDate, status: "Ongoing", totalEntries: 0, progress: 0 })
  } catch (err) {
    console.error("Error inserting goal:", err)
    res.status(500).json({ error: "Unable to create goal" })
  }
})

// Update goal progress and status
router.put("/goals/update-progress/:id", checkUser, async (req, res) => {
  const { id } = req.params
  const { clerkId, progress, status } = req.body

  if (progress == null || !status) {
    return res.status(400).json({ error: "Progress and status are required" })
  }

  try {
    await pool.query(
      "UPDATE goals SET progress = ?, status = ? WHERE id = ? AND clerk_id = ?",
      [progress, status, id, clerkId]
    )
    res.json({ message: "Goal updated successfully" })
  } catch (err) {
    console.error("Error updating goal:", err)
    res.status(500).json({ error: "Unable to update goal" })
  }
})

// GET /goals/ongoing?clerkId=...
router.get("/goals/ongoing", checkUser, async (req, res) => {
  const { clerkId } = req.query;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM goals WHERE clerk_id = ? AND status = 'Ongoing' ORDER BY created_at DESC LIMIT 1",
      [clerkId]
    );
    res.json(rows[0] || null); // send null if no ongoing goals
  } catch (err) {
    console.error("Error fetching ongoing goals:", err);
    res.status(500).json({ error: "Unable to fetch ongoing goals" });
  }
});


// Update a goal (also sync with savings table)
router.put("/goals/:id", checkUser, async (req, res) => {
  const { id } = req.params
  const { goal_name, target_amount, due_date, status, clerkId, oldGoalName } = req.body

  try {
    await pool.query(
      `UPDATE goals 
       SET goal_name = ?, target_amount = ?, due_date = ?, status = ?
       WHERE id = ? AND clerk_id = ?`,
      [goal_name, target_amount, due_date, status || "Ongoing", id, clerkId]
    )

    // Sync category names in savings table if goal name changed
    if (oldGoalName && oldGoalName !== goal_name) {
      await pool.query(
        `UPDATE savings SET category = ? WHERE clerk_id = ? AND category = ?`,
        [goal_name, clerkId, oldGoalName]
      )
    }

    res.json({ message: "Goal updated successfully" })
  } catch (err) {
    console.error("Error updating goal:", err)
    res.status(500).json({ error: "Unable to update goal" })
  }
})

// Delete a goal
// Delete a goal and related savings
router.delete("/goals/:id", checkUser, async (req, res) => {
  const { id } = req.params
  const { clerkId } = req.body

  try {
    // 1. Get the goal name first
    const [goalRows] = await pool.query(
      "SELECT goal_name FROM goals WHERE id = ? AND clerk_id = ?",
      [id, clerkId]
    )

    if (goalRows.length === 0) {
      return res.status(404).json({ error: "Goal not found" })
    }

    const goalName = goalRows[0].goal_name

    // 2. Delete the goal
    await pool.query("DELETE FROM goals WHERE id = ? AND clerk_id = ?", [id, clerkId])

    // 3. Delete all savings with category matching the goal name
    await pool.query("DELETE FROM savings WHERE category = ? AND clerk_id = ?", [goalName, clerkId])

    res.json({ message: "Goal and related savings deleted successfully" })
  } catch (err) {
    console.error("Error deleting goal and related savings:", err)
    res.status(500).json({ error: "Unable to delete goal" })
  }
})


module.exports = router
