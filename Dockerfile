FROM node:20-alpine

WORKDIR /app

# Backend setup
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend/ ./backend/
RUN cd backend && npx prisma generate

# Frontend setup
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/

# Expose Hugging Face default port
EXPOSE 7860

# Start backend in background, then frontend (listens on 7860)
CMD cd backend && npm run dev & cd /app/frontend && npm run dev