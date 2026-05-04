---
title: InboxFlow AI
emoji: 📬
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# 🚀 InboxFlow AI — AI-Powered Gmail Manager (Full-Stack SaaS)

**Live Demo:** [inboxflowai.netlify.app](https://inboxflowai.netlify.app)  
**GitHub Repo:** [github.com/waheed477/ai-inbox-manager](https://github.com/waheed477/ai-inbox-manager)

> 🎥 **Watch the Demo Video (2 min):** [Insert Loom/YouTube Link Here]

---

## 🔥 Why This Project?

InboxFlow AI turns your Gmail into an intelligent assistant. Ask your inbox *"Find the client meeting about budget"* and get an instant answer. Built as a production-grade SaaS application, this project demonstrates the full stack of modern web development skills — from OAuth 2.0 security to AI integration.

---

## ✨ Key Features

### 🧠 AI Integration
- **Smart Summarization:** Emails are automatically summarized into concise bullet points (powered by Groq's Llama 3.1).
- **Context-Aware Replies:** Generates smart reply suggestions based on the email's tone and content.

### ⚙️ Backend Engineering
- **Google OAuth 2.0:** Secure authentication with refresh token lifecycle management.
- **Gmail API Sync:** Fetches and stores real emails in a MongoDB database.
- **Custom Rules Engine:** A visual "If-Then" builder to automate email actions (label, archive, mark read).
- **REST API Architecture:** 15+ endpoints for authentication, emails, AI, rules, settings, and semantic search.

### 🔐 Enterprise-Grade Security
- **Rate Limiting:** Custom in-memory rate limiter protects auth routes from brute-force attacks.
- **Encrypted Token Storage:** AES-256-GCM encryption for sensitive credentials at rest.
- **Zod Validation:** Every API input is strictly validated with type-safe schemas.
- **Security Headers:** XSS protection, CSP, HSTS, and more configured via middleware.

### 🎨 Professional UI/UX
- **3-Column Responsive Layout:** Works flawlessly on desktop, tablet, and mobile.
- **Dark & Light Modes:** Full theme support persisted in localStorage.
- **⌘K Command Palette:** Semantic search across all emails with keyboard navigation.
- **shadcn/ui Components:** Accessible, customizable, and modern UI components.
- **Skeleton Loaders & Toasts:** Polished loading states and user notifications.

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand, Framer Motion |
| **Backend** | Next.js 14 (App Router), Node.js, NextAuth.js |
| **Database** | MongoDB Atlas, Prisma ORM |
| **AI/ML** | Groq SDK (Llama 3.1) for NLP tasks |
| **Security** | NextAuth.js, Zod, AES-256-GCM, Custom Rate Limiter |
| **DevOps** | Docker, Netlify (Frontend), Hugging Face Spaces (Backend) |
| **Testing** | Browser DevTools, REST Client |

---

## 📂 Project Architecture
ai-inbox-manager/
├── frontend/ # React + Vite + Tailwind (Netlify)
│ ├── src/
│ │ ├── components/ # EmailRow, EmailDetailPane, SemanticSearchModal
│ │ ├── pages/ # Inbox, Important, Sent, Dashboard, Settings, Login
│ │ ├── store/ # Zustand stores (email, rules, schedule)
│ │ └── lib/ # API client, utils
├── backend/ # Next.js 14 App Router (Hugging Face)
│ ├── app/api/ # Auth, Gmail, AI, Dashboard, Rules, Settings
│ ├── lib/ # Prisma, Redis, Gmail client, Groq, Crypto, Validation
│ ├── middleware.ts # Rate limiting, CORS, Security headers
│ └── prisma/ # MongoDB schema
└── README.md

---

## 🚀 Quick Start (Local)

```bash
# Clone the repository
git clone https://github.com/waheed477/ai-inbox-manager.git
cd ai-inbox-manager

# Backend setup
cd backend
cp .env.example .env.local   # Fill in your API keys
npm install
npx prisma generate
npx prisma db push
npm run dev                   # Starts on http://localhost:3000

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev                   # Starts on http://localhost:5173
⚠️ Important: You need valid credentials for Google OAuth, Gmail API, MongoDB Atlas, and Groq. See Configuration Guide below.

⚙️ Configuration
Create a .env.local file in the backend folder with the following variables:

env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Database (MongoDB Atlas)
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/dbname

# Groq AI
GROQ_API_KEY=gsk_your_api_key

# Redis (Optional - for BullMQ)
REDIS_URL=
📦 Deployment
Component	Platform	URL
Frontend	Netlify	inboxflowai.netlify.app
Backend	Hugging Face Spaces	beast49-inboxflow-backend.hf.space
The frontend is deployed as a static site on Netlify with all API calls proxied to the Hugging Face backend. The backend is containerized with Docker.

🧠 AI Features Deep Dive
Email Summarization
POST /api/ai/summarize — Takes an email body and returns a 2-3 bullet point summary. Uses Groq's Llama 3.1-8B model with optimized prompts for professional tone.

Reply Suggestions
POST /api/ai/reply-suggestions — Generates 3 contextually-aware reply options (affirmative, busy, more-info) based on the email content.

Semantic Search
POST /api/ai/search — Searches across all user emails using relevance scoring (subject, sender, body matching). Returns ranked results in real-time.

🔗 API Endpoints
Method	Endpoint	Description
GET	/api/auth/session	Get current user session
POST	/api/gmail/sync	Sync emails from Gmail
GET	/api/gmail/messages	Get all synced emails
POST	/api/ai/summarize	Generate AI email summary
POST	/api/ai/reply-suggestions	Generate reply suggestions
POST	/api/ai/search	Semantic email search
GET/POST/PUT/DELETE	/api/rules	CRUD automation rules
GET/PUT	/api/settings	User settings
POST	/api/gmail/star	Toggle star on email
POST	/api/gmail/archive	Archive an email
POST	/api/gmail/delete	Delete an email
POST	/api/gmail/schedule	Schedule an email
GET	/api/gmail/archived	Get archived emails
POST	/api/gmail/unarchive	Unarchive an email

-----------------------------------------------------------------------
📞 Contact
Waheed Aslam • azlanch93@gmail.com

Built with ❤️ for modern SaaS recruitment.