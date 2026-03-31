# LinkFLOW - Link-in-Bio Platform

A premium, full-stack web application for content creators to manage their links.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Auth**: JWT

## Features
- ✨ Premium, responsive design
- 🔗 Manage links (Create, Read, Update, Delete)
- 👤 Customizable profile (Bio, Picture, Social Links)
- 🎨 Theme customization (Background & Button colors)
- 📊 Real-time click tracking and analytics
- 📱 Mobile-first approach

## Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
*Note: Make sure MongoDB is running locally or provide a connection string in `.env`.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables (.env)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for authentication
