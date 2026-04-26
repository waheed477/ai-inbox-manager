---
title: InboxFlow AI
emoji: 📬
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---
# 📬 InboxFlow AI — AI-Powered Email Manager (SaaS)

**Live Demo:** [beast49-inboxflow-ai.hf.space](https://beast49-inboxflow-ai.hf.space)  
**GitHub:** [github.com/waheed477/ai-inbox-manager](https://github.com/waheed477/ai-inbox-manager)

---

## ✨ Features

### 🔐 Authentication & Security
- Google OAuth 2.0 (NextAuth.js) with Gmail scopes
- Refresh token rotation & encrypted storage
- Rate limiting, CORS, security headers, input validation (Zod)

### 📥 Inbox Management
- Real-time Gmail sync (fetch, store, display)
- AI-powered email summarization & smart reply suggestions (Groq Llama 3.1)
- 3-column responsive layout (sidebar, email list, detail pane)
- Semantic search (⌘K command palette) with real backend search

### ⚙️ Automation
- **Rules Engine:** Create rules like "If from contains 'boss' → label Important"
- **Schedule Send:** Compose & schedule emails for later delivery
- **Auto-Archive:** Automatically archive promotions, newsletters, etc.
- **Priority Inbox:** Toggle to see important/starred emails first

### 🎨 Modern UI/UX
- Dark mode (persisted in localStorage)
- Professional white/dark theme with shadcn/ui components
- Skeleton loaders, toast notifications, Framer Motion animations
- Fully responsive (mobile hamburger menu)

### 📊 Dashboard & Stats
- Real-time stats: total emails, unread, starred, categories
- Activity feed & AI usage summary
- Email categories distribution

### 🔧 Tech Stack
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Framer Motion
- **Backend:** Next.js 14 (App Router), TypeScript, Prisma ORM, MongoDB Atlas
- **AI:** Groq SDK (Llama 3.1) for summarization & semantic search
- **APIs:** Gmail API (Google OAuth2), custom REST endpoints
- **Security:** NextAuth.js, Zod validation, AES-256 token encryption
- **DevOps:** Docker, Hugging Face Spaces (deployment)

---

## 🛠️ Local Setup

```bash
# Clone repo
git clone https://github.com/waheed477/ai-inbox-manager.git
cd ai-inbox-manager

# Backend
cd backend
cp .env.example .env.local   # fill Google OAuth keys, MongoDB URL, Groq API key
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev

Visit http://localhost:5173

🚀 Deployment
Dockerized deployment on Hugging Face Spaces (see Dockerfile & docker-compose.yml). Or deploy to Vercel/Render for both frontend & backend.


📂 Project Structure
text
ai-inbox-manager/
├── frontend/         # React + Vite + Tailwind + shadcn/ui
│   ├── src/
│   │   ├── components/   # EmailRow, EmailDetailPane, SemanticSearchModal, etc.
│   │   ├── pages/        # Inbox, Important, Sent, Archived, Dashboard, Settings, Login
│   │   ├── store/        # Zustand stores (email, rules, schedule)
│   │   └── lib/          # API client, utils
│   └── ...
├── backend/          # Next.js 14 App Router
│   ├── app/api/      # Auth, Gmail, AI, Dashboard, Rules, Settings, etc.
│   ├── lib/          # Prisma, Redis, Gmail client, Groq, crypto, validation
│   ├── workers/      # BullMQ background jobs (email sync, AI processing)
│   ├── prisma/       # MongoDB schema
│   └── middleware.ts # Rate limiting, security headers, CORS
├── docker-compose.yml
└── README.md

Built with ❤️ for modern SaaS recruitment....