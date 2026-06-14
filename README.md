 #ChatVerse 💬

A real-time distributed chat application built using microservices architecture with Socket.IO, Redis Pub/Sub, and Docker.

 # Features

- ⚡ Real-time messaging using Socket.IO
- 🔐 Authentication system (JWT-based)
- 🧠 Redis Pub/Sub for multi-service communication
- 🐳 Dockerized microservices architecture
- 🌐 Multiple backend services for scalability
- 📡 Persistent chat storage with MongoDB


#  Architecture

Frontend (React)
   ↓
Auth Backend (Port 8000)
   ↓
Backend Services (5000 / 5001)
   ↓
Redis Pub/Sub
   ↓
MongoDB Database


# Tech Stack

- Frontend: React.js
- Backend: Node.js, Express.js
- Real-time: Socket.IO
- Database: MongoDB
- Cache/Message Broker: Redis
- Containerization: Docker


# Demo

https://drive.google.com/file/d/1YxgBxJmAnbwRF29h7URAUZ4ptTgWmeWf/view?usp=drive_link


# Setup Instructions

```bash
git clone https://github.com/Monika24-D/chatverse.git
cd chatverse
docker-compose up --build
