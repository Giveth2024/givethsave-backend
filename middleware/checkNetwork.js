// middleware/checkNetwork.js
const dns = require("dns")

// Helper function to check DNS resolution
function checkInternetConnection() {
  return new Promise((resolve) => {
    dns.lookup("google.com", (err) => {
      resolve(!err) // true if resolved, false if error
    })
  })
}

async function networkMiddleware(req, res, next) {
  const hasInternet = await checkInternetConnection()

  if (!hasInternet) {
    console.error("🌐 No network connection. Blocking requests...")
    return res.status(503).json({
      error: "Service unavailable. Network connection lost. Please try again later.",
    })
  }

  // ✅ Network is available
  next()
}

module.exports = networkMiddleware
