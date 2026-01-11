# Winternthon
# Personalized Learning Student Support System

## 🎯 Overview
AI-powered platform that helps students stay engaged and teachers monitor understanding in real-time. Solves WIN10: "Stay Awake" problem.

## ✨ Key Features
**Students:**
- 🤖 AI HelpBot for any questions
- 📚 Auto-generated lecture summaries  
- 🎯 Smart focus polls
- 💬 Private doubt asking

**Teachers:**
- 📊 Real-time dashboard
- ⚠️ Struggling student alerts
- 📝 AI summary generator
- 📈 Performance analytics

## 🛠️ Tech Stack
- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express + TypeScript  
- **AI:** Google Gemini API
- **Realtime:** WebSocket

## 🚀 Quick Start

1. **Clone & Install**
```bash
git clone [repo url] https://github.com/prajakta-47/Winternthon
cd backend && npm install
cd ../frontend && npm install
```

2. **Setup Backend (.env)**
```env
GEMINI_API_KEY=your_key_here
PORT=5000
```

3. **Run**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd frontend && npm run dev
```

4. **Open:** `http://localhost:5173`

## 📁 Project Structure
```
├── backend/           # Node.js API + WebSocket
├── frontend/          # React Dashboard
└── README.md
```

## 🔧 API Endpoints
- `POST /api/chat/help` - AI HelpBot
- `POST /api/summary/generate` - Generate summaries
- `GET /api/teacher/dashboard` - Teacher analytics
- WebSocket: `ws://localhost:8080` - Realtime updates

## 🎯 How It Works
1. **Teacher** posts lecture → AI generates summary → Students receive it
2. **AI monitors** student engagement → Triggers polls when focus drops
3. **Students** ask HelpBot anything → Gets AI-powered responses
4. **Teacher** sees real-time alerts for struggling students

## 📊 Demo Credentials
- **Student:** Any name + "Student" role
- **Teacher:** Any name + "Teacher" role  
*(No passwords for demo)*

## 🚀 Deployment Ready
- Environment-based config
- CORS security
- Scalable architecture
- Production-ready code

---

**Built for Winternthon 2026** | *Making learning visible and engaging*
