const pool = require("../config/db")

// Ensure achievements table exists
async function ensureAchievementsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      goal_id INT NOT NULL,
      goal_name VARCHAR(255) NOT NULL,
      target_amount DECIMAL(15,2) NOT NULL,
      progress DECIMAL(15,2) NOT NULL,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_goal (goal_id)
    )
  `)
}

// Move completed goals into achievements
async function syncAchievements() {
  try {
    // Get all completed goals
    const [completedGoals] = await pool.query(`
      SELECT id, goal_name, target_amount, progress
      FROM goals
      WHERE progress >= target_amount
    `)

    if (completedGoals.length > 0) {
      for (const goal of completedGoals) {
        // Insert into achievements (ignore duplicates)
        await pool.query(`
          INSERT IGNORE INTO achievements (goal_id, goal_name, target_amount, progress)
          VALUES (?, ?, ?, ?)
        `, [goal.id, goal.goal_name, goal.target_amount, goal.progress])
      }
      console.log("✅ Synced achievements:", completedGoals.length)
    }
  } catch (err) {
    console.error("❌ Error syncing achievements:", err)
  }
}

// Start periodic check every 5 seconds
async function startAchievementsWatcher() {
  await ensureAchievementsTable()
  setInterval(syncAchievements, 5000) // every 5s
}

module.exports = startAchievementsWatcher
