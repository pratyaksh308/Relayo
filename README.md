[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=22275475&assignment_repo_type=AssignmentRepo)
# Project Name: Relayo
### Team ID: Group 11

## 🏢 Corporate Simulation Guidelines
**Approved by:** Prof. Anushrav Mudgal  
**Objective:** To develop a production-grade software solution using industry-standard DevOps and Agile methodologies.

---

## 🚀 About Relayo
Relayo is a full-stack real-time chat web application designed for secure, organizational communication. Originally built as a robust direct messaging platform, it bridges the gap between student prototypes and production-ready applications with its focus on security, local networking, and instant delivery.

### ✨ Key Features
* **Real-Time Communication:** Instant messaging and typing indicators powered by WebSockets (Socket.io).
* **Robust Security:** JWT-based authentication, bcrypt password hashing, protected React routes, and strict role-based room access control.
* **Local File Sharing:** Secure, local `multipart/form-data` file uploads via Multer with automatic 5MB limits and MIME type filtering (images, PDFs, documents).
* **Smart UI/UX:** Dynamic message grouping (5-minute windows), smart auto-scroll, date separators, inline image previews, and dedicated file download cards.
* **LAN/Hotspot Demo Ready:** Environment variable-driven architecture ensuring seamless presentation capability across laptops and mobile devices on the same Wi-Fi network.

### 💻 Tech Stack
* **Frontend:** React, Vite, React Router, Axios, CSS
* **Backend:** Node.js, Express.js, Socket.io, Multer (File Storage)
* **Database:** MongoDB, Mongoose

---

## 👥 The Team
| Role | Name | GitHub Username | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **Team Lead** | Pratyaksha Kumar Jha | @pratyaksh308 | Architecture & Merge Approvals |
| **Developer** | Jayant Tomar | @ijayant91-netizen | Backend / API |
| **Developer** | Aayushman Rawat | @ayushmanrwt | Frontend / UI |
| **Developer** | Dron Makkar  | @dodo20-alt | Database & Testing |
| **DevOps** | Om Nawani | @omnawan | CI/CD & Documentation |

---

## ⚙️ Setup & Installation Instructions

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create a .env file and add your configuration
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key

# Start the backend server
npm run dev
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create a .env file (see .env.example)
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Start the frontend dev server
npm run dev
```
*(Note for Live Demos: Update `localhost` in the frontend `.env` to your computer's IPv4 address to access the app via a mobile phone on the same Wi-Fi).*

---

## 🛠 Project Management (The "Top View")
We use **GitHub Projects** for task tracking.
* **The Golden Rule:** *If a task is not on the Board, it does not exist.*
* **Columns:** Backlog, Todo, In Progress, In Review, Done.

---

## 🔄 Development Workflow (Git Flow)
We strictly follow **Branch Protection Rules**. Direct pushes to `main` are **FORBIDDEN**.

### The Cycle
1.  **Pull** latest changes: `git pull origin main`
2.  **Create** a branch: `git checkout -b feature/my-new-feature`
3.  **Code** & Commit: `git commit -m "Added login validation logic"`
4.  **Push**: `git push origin feature/my-new-feature`
5.  **Open Pull Request (PR)** from `feature/...` to `main`. 
    * *Review Requirement: At least 1 other team member MUST review the code.*

---

## 📝 Coding Standards
* **Commits:** Must be descriptive (e.g., "Refactored UserAuthService to handle JWT tokens").
* **Cleanliness:** No commented-out dead code. No hardcoded passwords/API keys (Use `.env` files).

---

## 📊 Evaluation & Attendance
Grading is based on the **Digital Footprint** in this repository.
1.  **Contributions:** The "Insights -> Contributors" graph verifies individual effort.
2.  **Consistency:** Regular commits are required. Dumping code 1 day before the deadline results in a penalty.
3.  **Collaboration:** Code Reviews (comments on PRs) count towards the "Teamwork" grade.
