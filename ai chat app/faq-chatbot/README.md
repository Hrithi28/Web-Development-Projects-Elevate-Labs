# 🤖 AI-Powered FAQ Chatbot

A full-stack FAQ chatbot built with **React**, **Node.js/Express**, and **Claude AI** (Anthropic). It uses a two-layer answer engine: fast keyword matching for known FAQs, and AI fallback for anything beyond the knowledge base.

---

## 📁 Project Structure

```
faq-chatbot/
├── backend/
│   ├── server.js          # Express API server
│   ├── package.json
│   └── .env.example       # Copy to .env and add your API key
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js          # Main chat interface
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   └── components/
│   │       ├── ChatMessage.js     # Message bubble with feedback
│   │       ├── ChatMessage.css
│   │       ├── FAQPanel.js        # Browseable FAQ sidebar
│   │       ├── FAQPanel.css
│   │       ├── TypingIndicator.js # Animated typing dots
│   │       └── TypingIndicator.css
│   └── package.json
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+ installed
- An Anthropic API key (free tier works) — get one at https://console.anthropic.com

---

### Step 1 — Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and add your Anthropic API key:
```
PORT=5000
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

Start the backend:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Backend will run at: `http://localhost:5000`

---

### Step 2 — Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

Frontend will open at: `http://localhost:3000`

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 Keyword Matching | Instant FAQ answers via multi-word keyword scoring |
| ✨ AI Fallback | Claude AI answers questions outside the FAQ scope |
| 📚 FAQ Sidebar | Browse & filter all FAQs by category with search |
| 👍👎 Feedback | Thumbs up/down on every bot answer |
| 📊 Confidence Bar | Visual indicator of answer confidence |
| 💬 Chat History | Conversation context sent with every AI request |
| 📝 Unanswered Log | Negative feedback + unmatched queries are logged |
| 📱 Responsive | Works on desktop, tablet, and mobile |

---

## 🔌 API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/faqs` | Returns all FAQs and categories |
| `POST` | `/api/chat` | Sends a message, returns an answer |
| `POST` | `/api/feedback` | Logs helpful/not-helpful feedback |
| `GET` | `/api/admin/unanswered` | Lists unanswered / negatively rated queries |

### POST /api/chat — Request Body
```json
{
  "message": "How do I reset my password?",
  "conversationHistory": []
}
```

### POST /api/chat — Response
```json
{
  "answer": "Click 'Forgot Password' on the login page...",
  "source": "faq",
  "matchedQuestion": "I forgot my password. How do I reset it?",
  "category": "Account",
  "confidence": 96
}
```

---

## 🛠 Tech Stack

- **Frontend:** React 18, CSS Variables, Fetch API
- **Backend:** Node.js, Express.js, CORS, dotenv
- **AI:** Anthropic Claude (claude-haiku — fast & cost-effective)
- **Answer Engine:** Custom keyword-scoring algorithm + AI fallback

---

## 📋 Extending the FAQ Knowledge Base

Edit the `faqData` array in `backend/server.js`:

```js
{
  id: 13,
  category: "Shipping",
  question: "How long does delivery take?",
  keywords: ["delivery", "shipping", "how long", "arrive", "dispatch"],
  answer: "Standard delivery takes 5–7 business days. Express delivery (2–3 days) is available at checkout."
}
```

---

## 🌐 Deployment

**Backend:** Deploy to Render, Railway, or any Node.js host. Set the `ANTHROPIC_API_KEY` environment variable.

**Frontend:** Run `npm run build` in the frontend folder. Deploy the `build/` directory to Vercel, Netlify, or GitHub Pages. Update the `API` constant in `App.js` to your deployed backend URL.
