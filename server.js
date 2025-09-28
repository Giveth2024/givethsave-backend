require("dotenv").config()

const express = require("express")
const cors = require("cors")
const logger = require("./middleware/logger")
const { waitForNetwork } = require("./functions/network")
const errorHandler = require("./middleware/errorHandler")
const networkMiddleware = require("./middleware/checkNetwork")
const db = require("./config/db") // import connection

const { ensureUsersTable } = require("./functions/users")
const { ensureSavingsTable } = require("./functions/savings")
const { ensureGoalsTable } = require("./functions/goals")
const startAchievementsWatcher = require("./functions/achievements")
const { ensureRemindersTable } = require ("./functions/reminders.js")
const startAlarmWatcher = require("./functions/alarm")


const app = express()
const PORT = process.env.PORT || 5000

async function startServer() {
   await waitForNetwork() // 👈 don’t continue until internet is back

   try {
     // Apply network middleware globally
     app.use(networkMiddleware)
     
     // Ensure users table exists
     await ensureUsersTable()
     await ensureSavingsTable()
     await ensureGoalsTable()
     await ensureRemindersTable()
     startAchievementsWatcher()
     startAlarmWatcher() // 👈 start alarm system
     
     //Routes will be used here
     const achievementsRoutes = require("./routes/achievements")
     const userRoutes = require("./routes/users")
     const savingsRoutes = require("./routes/savings")
     const goalsRoutes = require("./routes/goals")
     const remindersRoutes = require("./routes/reminders")
     
     // Middleware
     app.use(cors())
     app.use(express.json())
     app.use(logger) // log every request
     
     // Routes
     app.get("/", (req, res) => {
       res.json({ success: true, message: "✅ Server is running!" })
     })
     app.use("/", userRoutes);
     app.use("/", savingsRoutes);
     app.use("/", goalsRoutes);
     app.use("/", achievementsRoutes);
     app.use("/", remindersRoutes)
     
     // Example route that throws an error
     app.get("/error", (req, res, next) => {
       next(new Error("Something went wrong!"))
     })
     
     // Error handler (must be last)
     app.use(errorHandler)
     
     app.listen(PORT, () => {
       console.log(`🚀 Server running on http://localhost:${PORT}`)
     })
    
   } catch (error) {
      console.error("❌ Failed to initialize database:", err.message)
      process.exit(1) // quit gracefully instead of crashing
   }
   
}

startServer();