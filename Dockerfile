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

# Start backend in background, wait 8 seconds for backend to initialize, then start frontend
CMD (cd backend && npm run dev &) && sleep 8 && cd /app/frontend && npm run dev