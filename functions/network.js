const dns = require("dns")

function checkInternetConnection() {
  return new Promise((resolve) => {
    dns.lookup("google.com", (err) => {
      resolve(!err) // true if online, false if not
    })
  })
}

async function waitForNetwork() {
  let connected = false
  while (!connected) {
    connected = await checkInternetConnection()
    if (!connected) {
      console.log("🌐 Waiting for network...")
      await new Promise((res) => setTimeout(res, 5000)) // retry every 5s
    }
  }
  console.log("✅ Network available!")
}

module.exports = { checkInternetConnection, waitForNetwork }
