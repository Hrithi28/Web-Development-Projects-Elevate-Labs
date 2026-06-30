# 💬 Real-Time Chat App — Socket.IO

A full-stack, production-ready real-time chat application built with **Node.js, Express, Socket.IO, MongoDB, React, and Tailwind CSS**.

---

## 🚀 Features

- **JWT Authentication** — Secure register/login with bcrypt password hashing
- **Real-Time Messaging** — Instant delivery via Socket.IO with no page refresh
- **Group Rooms** — Create public/private rooms, add members, discover & join rooms
- **Direct Messages (DMs)** — Private one-on-one conversations
- **Typing Indicators** — Live "user is typing..." with animated dots
- **Online Presence** — Real-time online/offline status with green indicators
- **Message History** — Persistent chat history stored in MongoDB with pagination
- **Message Deletion** — Delete your own messages
- **Read Receipts** — Track when messages are read
- **Date Separators** — Messages grouped by date (Today, Yesterday, etc.)
- **Responsive Dark UI** — Beautiful Tailwind CSS design with custom scrollbars

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express.js |
| Real-Time | Socket.IO |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Frontend | React 18 |
| Styling | Tailwind CSS |
| HTTP | Axios |
| Routing | React Router v6 |

---

## 📁 Project Structure

```
chatapp/
├── server/
│   ├── index.js              # Express + Socket.IO server entry
│   ├── socketHandler.js      # All socket event logic
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── Room.js           # Room schema
│   │   └── Message.js        # Message schema
│   ├── routes/
│   │   ├── auth.js           # Register, login, /me
│   │   ├── users.js          # User search & profile
│   │   ├── rooms.js          # Room CRUD & join/leave
│   │   └── messages.js       # Message fetch/delete/edit
│   └── middleware/
│       └── auth.js           # JWT middleware (HTTP + Socket)
├── client/
│   ├── public/index.html
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── index.css
│       ├── context/
│       │   ├── AuthContext.js
│       │   └── SocketContext.js
│       ├── pages/
│       │   ├── LoginPage.js
│       │   ├── RegisterPage.js
│       │   └── ChatPage.js
│       ├── components/
│       │   ├── Sidebar.js
│       │   ├── ChatWindow.js
│       │   ├── MessageBubble.js
│       │   ├── TypingIndicator.js
│       │   ├── Avatar.js
│       │   ├── WelcomeScreen.js
│       │   ├── CreateRoomModal.js
│       │   └── DiscoverRoomsModal.js
│       └── utils/
│           └── api.js
├── .env.example
└── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB running locally OR a MongoDB Atlas URI

### 1. Clone & Install

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:3000
```

### 3. Run the App

**Terminal 1 — Backend:**
```bash
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client && npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔌 Socket.IO Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join:rooms` | — | Join all user's rooms on connect |
| `room:join` | `{ roomId }` | Join a specific room |
| `message:send` | `{ roomId, content }` | Send message to room |
| `dm:send` | `{ recipientId, content }` | Send private message |
| `typing:start` | `{ roomId }` | Start typing indicator |
| `typing:stop` | `{ roomId }` | Stop typing indicator |
| `message:read` | `{ roomId }` | Mark messages as read |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `message:new` | Message object | New message in a room |
| `dm:new` | `{ room, message }` | New DM received |
| `typing:update` | `{ userId, username, roomId, isTyping }` | Typing state change |
| `user:online` | `{ userId, isOnline }` | Online/offline change |
| `message:read` | `{ roomId, userId }` | Read receipt |

---

## 🌐 REST API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Users
- `GET /api/users?search=` — Search users
- `GET /api/users/:id` — Get user by ID
- `PATCH /api/users/profile` — Update profile

### Rooms
- `GET /api/rooms` — Get user's rooms
- `POST /api/rooms` — Create room
- `GET /api/rooms/public` — Discover public rooms
- `GET /api/rooms/:id` — Get room details
- `POST /api/rooms/:id/join` — Join a public room
- `POST /api/rooms/:id/leave` — Leave a room
- `POST /api/rooms/:id/members` — Add member (admin only)

### Messages
- `GET /api/messages/:roomId?page=1&limit=50` — Get messages
- `DELETE /api/messages/:id` — Delete own message
- `PATCH /api/messages/:id` — Edit own message

---

## 📝 Report

See `report.pdf` for the 1–2 page internship project report.
