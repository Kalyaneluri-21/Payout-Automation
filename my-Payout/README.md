# 💰 Payout Management System for EdTech Mentors

A role-based payout management web application designed to manage mentor sessions, payout records, and user workflows for EdTech organizations. The system provides separate dashboards for admins and mentors, secure authentication, and structured session tracking using Firebase.

---

## 🚀 Features

### 👤 Authentication & User Management
- User signup and login using **Firebase Authentication**
- Role-based access for **Admin** and **Mentor**
- Protected routes based on authentication state
- Global authentication state managed using **Redux Toolkit**

---

### 🧑‍🏫 Mentor Features
- View assigned sessions
- Track session status and session details
- Access a mentor-specific dashboard
- Filter sessions for better visibility and tracking

---

### 🛠️ Admin Features
- Admin dashboard with role-based access
- Add and manage mentor sessions
- View all sessions across mentors
- Update session statuses
- Filter sessions by status and date
- Centralized session management interface

---

### 📅 Session Management
- Add sessions using a modal-based interface
- Display sessions in a structured table view
- Status-based session updates
- Date handling using **Day.js**
- Utility scripts for managing session status updates

---

## 🧱 Tech Stack

### Frontend
- React (Vite)
- JavaScript
- Tailwind CSS
- Redux Toolkit

### Backend / Services
- Firebase Authentication
- Firebase Firestore
- Firestore Indexes

### Tools & Utilities
- Git & GitHub
- Postman
- Day.js
- ESLint

---

## 🔐 Role-Based Access Control

The application implements **role-based access control (RBAC)** to ensure secure and structured access for different user roles.

### 👨‍💼 Admin Capabilities
- View and manage **all mentor sessions**
- Add new sessions for mentors
- Update and control **session statuses**
- Access centralized administrative dashboards

### 🧑‍🏫 Mentor Capabilities
- View **only assigned sessions**
- Track session details and progress
- Access mentor-specific dashboard views

---

## 🔧 Setup & Installation

Follow these steps to run the project locally:

```bash
npm install
npm run dev
```

## 🌐 Environment Configuration

Firebase configuration is handled in the following file:

```text
src/firebase/config.js
```


Ensure the following Firebase services are enabled in your Firebase project:

- 🔐 **Firebase Authentication**
- 🗄️ **Firebase Firestore**
