const pool = require("../config/db")
const { sendSMS, sendEmail } = require("./notify")

// Keep track of which reminders have already been triggered today
let triggeredToday = new Set()

function getTodayKey(reminder) {
  // Unique key: reminder ID + today’s date
  const today = new Date().toISOString().split("T")[0]
  return `${reminder.id}-${today}`
}

async function checkReminders() {
  try {
    const [rows] = await pool.query("SELECT * FROM reminders WHERE active = 1")

    const now = new Date()
    const currentTime = now.toTimeString().split(" ")[0].slice(0, 5) // HH:MM

    rows.forEach(r => {
      const reminderTime = r.time.slice(0, 5) // DB format: HH:MM:SS → HH:MM
      const key = getTodayKey(r)

      if (reminderTime === currentTime && !triggeredToday.has(key)) {
        console.log(`
==============================
🔔 ALARM TRIGGERED!
📌 Reminder ID: ${r.id}
📝 Title: ${r.title}
💰 Amount: ${r.amount}
⏰ Time: ${r.time}
==============================
        `)

        triggeredToday.add(key) // mark as triggered for today
      
        // Fire notifications 🚀
        sendSMS(`Reminder: ${r.title} at ${r.time}, UGX ${r.amount}`)
        sendEmail(
          "Daily Reminder Alert",
          `<u>${r.title} - Amount: UGX ${r.amount} at ${r.time}</u>`
  )
      }
    })
  } catch (err) {
    console.error("❌ Error reading reminders:", err.message)
  }
}

// Reset triggered list at midnight
function resetDailyTriggers() {
  triggeredToday.clear()
  console.log("🕛 Reset daily reminders trigger list.")
}

function startAlarmWatcher() {
  console.log("🚀 Alarm watcher started (checking every 5s)...")
  setInterval(checkReminders, 5000)

  // Reset triggers daily at midnight
  const now = new Date()
  const msUntilMidnight =
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now
  setTimeout(() => {
    resetDailyTriggers()
    setInterval(resetDailyTriggers, 24 * 60 * 60 * 1000) // repeat daily
  }, msUntilMidnight)
}

module.exports = startAlarmWatcher
