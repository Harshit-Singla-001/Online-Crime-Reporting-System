# Online Crime Reporting System (OCRS)

An advanced web application built on the MERN stack (MongoDB, Express, React, Node.js) designed to facilitate secure online crime reporting, community safety awareness, and administrative moderation.

---

## 🌟 Key Features

### 👤 User Portal
- **Secure Registration & Login:** Verification via Aadhaar Number, PAN Number, Phone Number, and email. Includes support for CAPTCHA security and automatic lockout after multiple failed login attempts.
- **File FIRs:** Step-by-step reporting of incidents with category selection, date/time inputs, physical addresses, automated geolocation retrieval, suspect/witness descriptions, and optional evidence uploads (e.g., screenshots or photos).
- **Draft FIRs:** Proactively save FIRs as drafts locally to resume filing them at a later time.
- **My Reports Dashboard:** Track the live status (`Pending`, `Approved`, `Solved`, `Rejected`) and read official review feedback from the police administration.
- **Public FIR Database:** Search and browse approved public safety records and solved cases.
- **Safety Tips Center:** View community safety tips, browse by category, and vote (upvote/downvote) to rank helpful tips.
- **Contact & Feedback:** Directly submit queries, reports, or feedback to the system administrators.

### 🛡️ Administrative Control Panel
- **Comprehensive Statistics Dashboard:** Live tracking of total reported cases, solved cases, active users, and system metrics.
- **FIR Moderation Engine:** Review submitted FIRs, approve them for the public database, reject invalid cases, mark resolved cases as `Solved`, and write official administrator review comments.
- **User Moderation:** View registered users, check their account status, block malicious actors, or permanently delete accounts.
- **Feedback & Message Center:** Manage user contact queries, update message status, reply, and optionally report users from feedback messages if harassment is detected.
- **Safety Tips Management:** Create, update, and delete curated safety tips across multiple safety categories (e.g., cyber safety, women safety, traffic safety).
- **Global System Configurations:** Control core system behaviors globally via toggles for user registration, login CAPTCHA verification, and FIR filing capabilities.

### 🔒 Security Features
- **Rate Limiting:** Protects key authentication endpoints (sign-up, login, OTP, password reset) from brute-force attacks by limiting IP addresses to 20 requests per 15 minutes.
- **Failed Attempt Lockout:** Temporarily blocks user accounts for 7 days after 5 consecutive failed login attempts.
- **Captcha Verification:** Prevents bot submissions on login and registration screens via dynamic CAPTCHA validation.
- **Mnemonic Key Recovery:** Supports account password recovery using a secure, random 10-word mnemonic recovery phrase. The recovery flow features a drag-and-drop validation interface seeded with decoy words.
- **Secure Authentication:** Utilizes HTTP-only cookies and JSON Web Tokens (JWT) for secure session management and role-based access control.

---

## 🔑 Default Credentials

The database is pre-seeded with default administrator and sample user profiles for testing:

### 👮 Police Administrator (Staff)
- **Email:** `admin@crs.com`
- **Password:** `AdminPassword123!`
- **Recovery Mnemonic Key:** `apple tiger moon glass river stone light paper green chair`

### 👤 Sample Users (Public)
- **Emails:**
  - `john.doe@example.com`
  - `jane.smith@example.com`
  - `bob.johnson@example.com`
- **Password:** `Password123!`
- **Recovery Mnemonic Key:** `apple tiger moon glass river stone light paper green chair`

---

## 🏗️ Technology Stack

### Frontend
- **React (v19) & Vite:** Ultra-fast development server and optimized bundle compilation.
- **React Bootstrap (v2) & Bootstrap (v5):** Clean, modern, responsive CSS frameworks and UI components.
- **React Icons:** Dynamic, vector icons for high-definition visuals.
- **React Router DOM (v7):** Declarative, client-side routing.
- **Swiper:** Elegant sliders and carousel interactions.
- **Dnd Kit:** Secure drag-and-drop utility for mnemonic validation.

### Backend & Database
- **Express (v5) & Node.js:** Robust routing framework and asynchronous runtime.
- **MongoDB & Mongoose:** Scalable, schema-based ODM database structure.
- **JSON Web Tokens (JWT) & BcryptJS:** High-entropy password hashing and secure token generation.
- **Express Rate Limit:** Protection against DDoS and brute-force intrusion attempts.
- **Nodemailer:** Transports email verification codes (OTPs) and notifications.
- **Svg-Captcha:** Dynamic visual security image generator.
- **MongoDB Memory Server:** Dynamic fallback configuration that automatically boots an in-memory database instance if a connection to MongoDB Atlas or local MongoDB service fails.

---

## 🚀 Setup & Execution Guide

### Prerequisites
- Node.js installed (LTS recommended)
- Optional: A running local MongoDB instance or MongoDB Atlas Connection String (the application automatically defaults to an In-Memory MongoDB Server if none are available)

### Configuration
1. **Frontend Environment:** Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
2. **Backend Environment:** Create a `.env` file inside the `server` directory (reference `server/.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/crs
   JWT_SECRET=your_super_secret_jwt_key
   EMAIL_USER=your_smtp_username
   EMAIL_PASS=your_smtp_password
   SENDER_EMAIL=your_sender_email_address
   FRONTEND_URL=http://localhost:5173
   ```

### Installation & Execution

1. **Install Frontend Dependencies & Run Dev Server:**
   From the project root folder:
   ```powershell
   npm install
   npm run dev
   ```

2. **Install Backend Dependencies & Run Server:**
   Open a separate terminal window, navigate to the `server` directory, and run:
   ```powershell
   cd server
   npm install
   npm run dev
   ```

3. **Verify Connection:**
   The client will run on [http://localhost:5173](http://localhost:5173) and the API will listen on [http://localhost:5000](http://localhost:5000).

---

## 🛠️ Recent System Improvements

- **Mnemonic Password Recovery for Staff & Administrators:** Fixed an issue where staff/admin accounts could not reset passwords because the forgot-password flow searched only the `User` database model. The API has been corrected to search both `User` and `Staff` tables, enabling full account recovery for all roles.