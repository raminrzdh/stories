# Trip & Hotel Story Panel 🏨✨

A premium, modern Online Travel Agency (OTA) frontend branded as **Trip**, featuring a specialized **Hotel Story Panel** for interactive hotel marketing and storytelling.

## 🚀 Overview
This repository contains a full-stack solution for managing and displaying interactive "stories" for hotels (similar to Instagram/Snapchat) integrated into a high-performance Persian (RTL) hotel booking platform.

---

## 🏗️ Project Structure
- **`hotel-story-panel/frontend`**: The modern Next.js 16+ (Turbopack) frontend for the **Trip** brand.
- **`hotel-story-panel/backend`**: High-performance Go (Gin) backend with PostgreSQL and JWT authentication.

---

## ✨ Features
### 📱 Public UI (Trip Brand)
- **100% RTL Architecture:** Built from the ground up for Persian language using the **Estedad** font.
- **Modern Search Experience:** Fast search results, minimal Shamsi (Jalali) calendar, and editable search headers.
- **Interactive Stories:** Integrated story circles in search results with full-screen view support.

### 🛠️ Hotel Story Management (Dashboard)
- **Story Builder:** Advanced editor with support for image/background-color slides and multiple text layers.
- **Content Management:** Effortless creation and organization of story groups and slides.
- **Analytics Suite:** Real-time tracking of:
  - **Impressions:** Visibility in search results.
  - **CTR (Click-Through Rate):** Actual story opens.
  - **Watch Depth:** Average number of slides viewed per session.

### 🛡️ Robustness & Security
- **JWT Authentication:** Secure admin access.
- **Deletion Safeguards:** Protection against accidental deletion of active story groups.
- **Dual-Language Support:** Seamless handling of both English and Persian city slugs in the API.

---

## 🛠️ Technology Stack
- **Frontend:** Next.js 16+, Tailwind CSS, Lucide React, ZDH-UI (Custom Native Components).
- **Backend:** Go (Golang), Gin Framework, PostgreSQL, Sqlx.
- **Design:** Modern Glassmorphism, Premium Typography, and Micro-animations.

---

## 🚦 Getting Started

### Backend Setup
1. Navigate to `hotel-story-panel/backend`.
2. Configure your PostgreSQL database in `internal/database/db.go` or via `DATABASE_URL` environment variable.
3. Run migrations: `go run cmd/migrate_v2/main.go`.
4. Start the server: `go run cmd/server/main.go`.

### Frontend Setup
1. Navigate to `hotel-story-panel/frontend`.
2. Install dependencies: `npm install`.
3. Run the development server: `npm run dev`.

---

## 📄 License
Internal Project. All rights reserved.
