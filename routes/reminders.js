const express = require("express")
const router = express.Router()
const {
  ensureRemindersTable,
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder
} = require("../functions/reminders")

// Make sure the table exists
ensureRemindersTable()

// Middleware to get Clerk ID from request (assumes frontend sends it)
function clerkMiddleware(req, res, next) {
  const { clerkId } = req.body || req.query
  if (!clerkId) return res.status(400).json({ error: "Missing clerkId" })
  req.clerkId = clerkId
  next()
}

// Get all reminders for a clerk
router.get("/reminders", clerkMiddleware, async (req, res) => {
  try {
    const reminders = await getReminders(req.clerkId)
    res.json(reminders)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reminders" })
  }
})

// Create a new reminder
router.post("/reminders", clerkMiddleware, async (req, res) => {
  try {
    const { title, amount, time, active } = req.body
    if (!title || !amount || !time) {
      return res.status(400).json({ error: "Missing fields" })
    }
    const reminder = await createReminder({ title, amount, time, active, clerkId: req.clerkId })
    res.json(reminder)
  } catch (err) {
    res.status(500).json({ error: "Failed to create reminder" })
  }
})

// Update a reminder
router.put("/reminders/:id", clerkMiddleware, async (req, res) => {
  try {
    const { title, amount, time, active } = req.body
    const { id } = req.params
    const reminder = await updateReminder(id, { title, amount, time, active, clerkId: req.clerkId })
    res.json(reminder)
  } catch (err) {
    res.status(500).json({ error: "Failed to update reminder" })
  }
})

// Delete a reminder
router.delete("/reminders/:id", clerkMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const result = await deleteReminder(id, req.clerkId)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: "Failed to delete reminder" })
  }
})

module.exports = router
