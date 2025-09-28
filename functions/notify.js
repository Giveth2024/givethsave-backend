const axios = require("axios")
const nodemailer = require("nodemailer")

// Send SMS
async function sendSMS(message) {
  try {
    const response = await axios.post("https://textbelt.com/text", {
      phone: process.env.PHONE_NUMBER,
      message,
      key: "textbelt", // free test key
    })
    console.log("📱 SMS Response:", response.data)
  } catch (err) {
    console.error("❌ Error sending SMS:", err.message)
  }
}

// Send Email
async function sendEmail(subject, html) {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // Gmail App Password
      },
    })

    let mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // could use another recipient
      subject,
      html,
    }

    let info = await transporter.sendMail(mailOptions)
    console.log("📧 Email sent:", info.response)
  } catch (err) {
    console.error("❌ Error sending email:", err.message)
  }
}

module.exports = { sendSMS, sendEmail }
