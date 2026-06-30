# Smart Resume Builder with AI Suggestions

A full-stack web application that helps users build professional resumes with real-time AI-powered suggestions using OpenAI GPT-3.5.

---

## Features

- **User Authentication** — Register/login with JWT-based auth
- **Resume CRUD** — Create, edit, save, and delete multiple resumes (up to 10)
- **Live Preview** — See your resume update in real time as you type
- **3 Themes** — Classic, Modern, and Minimal resume styles
- **AI Suggestions** — GPT-3.5 analyzes your resume and gives 5 specific improvement tips
- **AI Summary Improver** — Rewrites your professional summary to be more impactful
- **AI Bullet Improver** — Improves job description bullets with stronger action verbs
- **PDF Export** — Print-ready export via browser
- **Auto-save** — Changes save automatically every 1.5 seconds
- **Completeness Score** — Visual indicator showing how complete your resume is

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, Axios |
| Styling | CSS-in-JS (inline styles), Google Fonts (Inter) |
| Backend | Node.js, Express.js |
| Database | MongoDB (via Mongoose) |
| AI | OpenAI GPT-3.5 Turbo API |
| Auth | JSON Web Tokens (JWT), bcrypt |
| PDF | Browser print API |

---

## Project Structure

```
smart-resume-builder/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema with bcrypt
│   │   └── Resume.js        # Resume schema (all sections)
│   ├── routes/
│   │   ├── auth.js          # Register, login, /me
│   │   ├── resume.js        # CRUD for resumes
│   │   ├── ai.js            # AI suggestions, improve summary/bullets
│   │   └── pdf.js           # HTML generation for PDF export
│   ├── middleware/
│   │   └── auth.js          # JWT verification middleware
│   ├── server.js            # Express app, MongoDB connection
│   ├── .env.example         # Environment variables template
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ResumePreview.jsx   # Live resume preview with themes
│   │   │   └── AISidebar.jsx       # AI suggestions panel
│   │   ├── hooks/
│   │   │   └── useAuth.js          # Auth context + hooks
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx       # Resume list & management
│   │   │   └── Builder.jsx         # Main resume editor
│   │   ├── utils/
│   │   │   └── api.js              # Axios instance with JWT interceptors
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.js                  # Routes + Auth provider
│   │   └── index.js
│   └── package.json
│
├── package.json             # Root scripts to run both services
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Node.js v16+ and npm
- MongoDB (local or Atlas free tier)
- OpenAI API key (free tier works — GPT-3.5-turbo)

### Step 1 — Clone and install dependencies

```bash
# Install all dependencies (root + backend + frontend)
npm run install:all
```

### Step 2 — Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-resume-builder
JWT_SECRET=your_super_secret_key_here_make_it_long
OPENAI_API_KEY=sk-your-openai-api-key-here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Step 3 — Configure frontend environment

```bash
cd frontend
cp .env.example .env
```

The default (`REACT_APP_API_URL=http://localhost:5000/api`) works for local development.

### Step 4 — Start MongoDB

```bash
# If running MongoDB locally
mongod
```

Or use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier) and paste the connection string in `MONGODB_URI`.

### Step 5 — Run the app

```bash
# From the root directory — runs both backend + frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get current user |

### Resumes (requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resumes` | List all resumes |
| POST | `/api/resumes` | Create resume |
| GET | `/api/resumes/:id` | Get single resume |
| PUT | `/api/resumes/:id` | Update resume |
| DELETE | `/api/resumes/:id` | Delete resume |

### AI (requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/suggestions` | Get 5 AI suggestions |
| POST | `/api/ai/improve-summary` | Rewrite summary |
| POST | `/api/ai/improve-description` | Improve job bullets |

### PDF (requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pdf/:resumeId` | Get print-ready HTML |

---

## How to Get a Free OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up for a free account
3. Go to API Keys → Create new secret key
4. Paste it in `backend/.env` as `OPENAI_API_KEY`

> **Note:** GPT-3.5-turbo is very cheap (~$0.001 per suggestion). The free tier gives $5 credit which is plenty for testing.

---

## Deployment

### Backend (Railway / Render)
1. Push to GitHub
2. Connect to [Railway](https://railway.app) or [Render](https://render.com) (both free)
3. Set environment variables in the platform dashboard
4. Deploy the `backend/` folder

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL` to your deployed backend URL
2. Deploy the `frontend/` folder to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

---

## Interview Questions to Prepare

- What is JWT and how does authentication work here?
- How does auto-save work? (debounce with setTimeout)
- What is the virtual DOM in React?
- How do React hooks like useState and useEffect work?
- What is CORS and why do we need it?
- How do you secure a REST API?
- What is the difference between PUT and PATCH?
- How does MongoDB schema validation work with Mongoose?

---

*Built as part of an internship project at Elevate Labs.*
