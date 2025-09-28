// middleware/logger.js
function logger(req, res, next) {
  const start = Date.now()

  res.on("finish", () => {
    const now = new Date()
    const timestamp = now.toLocaleString("en-UG", { timeZone: "Africa/Kampala" })
    const duration = Date.now() - start

    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`
    )
  })

  next()
}

module.exports = logger
