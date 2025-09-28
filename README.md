Sure! Here's a **comprehensive `README.md`** for your backend project:

````markdown
# GivethSave Backend

This is the backend for the **GivethSave** application, built with **Node.js**, **Express**, and **MySQL**. It handles user data, savings, goals, achievements, and daily reminders. The backend exposes REST APIs for the frontend to interact with the database and manages scheduled notifications via alarms.

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
- [Environment Variables](#environment-variables)  
- [Database Setup](#database-setup)  
- [API Routes](#api-routes)  
- [Alarm & Notifications](#alarm--notifications)  
- [Scripts](#scripts)  
- [License](#license)  

---

## Features

- CRUD operations for:
  - Users
  - Savings
  - Goals
  - Achievements
  - Daily Reminders
- Sends notifications via **SMS** (Textbelt) and **Email** (NodeMailer) at scheduled reminder times.
- Automatically creates necessary database tables if they don’t exist.
- Clerk authentication integrated for user-specific data.

---

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **dotenv** - Environment variable management
- **nodemailer** - Email notifications
- **axios** - SMS notifications
- **Clerk** - Authentication
- **nodemon** - Development server auto-reload

---

## Getting Started

### Prerequisites

- Node.js v22+
- MySQL server
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd backend
````

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your environment variables (see [Environment Variables](#environment-variables)).

4. Start the server:

   ```bash
   npm run dev
   ```

---

## Environment Variables

Create a `.env` file and set the following variables:

```env
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
PORT=5000

TEXTBELT_PHONE=your_phone_number
TEXTBELT_KEY=textbelt
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_gmail_app_password
```

---

## Database Setup

Tables are automatically created when the server starts. Tables include:

* `users`
* `savings`
* `goals`
* `achievements`
* `reminders`

You can also manually check with MySQL:

```sql
SHOW TABLES;
SELECT * FROM reminders;
```

---

## API Routes

| Method | Endpoint       | Description                |
| ------ | -------------- | -------------------------- |
| GET    | /users         | Get all users              |
| POST   | /users         | Create new user            |
| GET    | /savings       | Get all savings for a user |
| POST   | /savings       | Create new saving          |
| PUT    | /goals/:id     | Update goal                |
| DELETE | /reminders/:id | Delete a reminder          |
| POST   | /reminders     | Create a new reminder      |
| PUT    | /reminders/:id | Update a reminder          |

> All reminder routes require `clerkId` for user authentication.

---

## Alarm & Notifications

* The **alarm.js** module checks reminders every 5 seconds.
* If the current time matches a reminder and it is active, it triggers:

  * **Email notification** using NodeMailer
  * **SMS notification** using Textbelt (via Axios)
* Only active reminders are triggered once at their scheduled time.

---

## Scripts

* `npm run dev` - Start development server with **nodemon**
* `npm start` - Start production server
* `npm test` - Run tests (if implemented)

---

## License

This project is licensed under the MIT License.

---

Made with ❤️ by Giveth