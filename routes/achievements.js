const express = require("express")
const pool = require("../config/db")
const checkUser = require("../middleware/checkUser")

const router = express.Router()

// Get all achievements + total saved
router.get("/achievements", checkUser, async (req, res) => {
  const { clerkId } = req.query

  try {
    const [rows] = await pool.query(
      `SELECT a.*, u.clerk_id 
       FROM achievements a
       JOIN goals g ON a.goal_id = g.id
       JOIN users u ON g.clerk_id = u.clerk_id
       WHERE u.clerk_id = ?`,
      [clerkId]
    )

    // Calculate total saved from progress column
    const totalSaved = rows.reduce((sum, r) => sum + parseFloat(r.progress || 0), 0)

    res.json({
      achievements: rows,
      totalSaved
    })
  } catch (err) {
    console.error("Error fetching achievements:", err)
    res.status(500).json({ error: "Unable to fetch achievements" })
  }
})

// routes/achievements.js
// routes/achievements.js
router.get("/achievements/total-saved", checkUser, async (req, res) => {
  const { clerkId } = req.query;

  if (!clerkId) return res.status(400).json({ error: "clerkId is required" });

  try {
    const [rows] = await pool.query(
      "SELECT SUM(target_amount) as total FROM achievements",
    );
    const totalSaved = rows[0]?.total || 0;
    res.status(200).json({ totalSaved });
  } catch (err) {
    console.error("Error fetching total saved:", err);
    res.status(500).json({ error: "Unable to fetch total saved" });
  }
});



module.exports = router
