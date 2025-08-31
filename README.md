# 🎮 TikTok Wordle - Live Interactive Word Game

A modern, real-time Wordle-style game designed for TikTok livestreams. Viewers participate by typing guesses in the chat, with beautiful visual feedback displayed through an OBS overlay. Features a stunning glassmorphism UI built with React, TypeScript, and Tailwind CSS.

![TikTok Wordle Demo](https://via.placeholder.com/800x400/7c3aed/ffffff?text=TikTok+Wordle+Live+Game)

## ✨ Features

- 🎨 **Modern UI**: Beautiful glassmorphism design with gradient backgrounds
- ⚡ **Real-time gameplay**: Chat comments instantly become Wordle guesses
- 🎯 **OBS integration**: Transparent overlay perfect for streaming
- 🏆 **Live scoreboard**: Dynamic ranking with winner celebrations
- 🎊 **Winner animations**: Stunning modals with particle effects
- 🔄 **Auto-rounds**: New games start automatically after each win
- 🤖 **Mock mode**: Test without TikTok integration using simulated players
- 📱 **Responsive**: Works on all screen sizes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Servers

**Option A: Start Both Servers (Recommended)**
```bash
npm run dev
```
This launches both frontend and backend simultaneously.

**Option B: Start Individually**
```bash
# Terminal 1 - Start Backend Server
npm run dev:server

# Terminal 2 - Start Frontend
npm run dev:client
```

### 3. Open the Game
- **Frontend (Game UI)**: http://localhost:5173
- **Backend API**: http://localhost:8080 (WebSocket + API only)

🎯 **The game will show mock data automatically - no TikTok connection needed for testing!**

## 🎬 OBS Streaming Setup

1. Add **Browser Source** in OBS
2. Set URL: `http://localhost:5173`
3. Set dimensions: 1920x1080
4. Enable: "Shutdown source when not visible" and "Refresh browser when scene becomes active"
5. For transparent overlay: The background can be made transparent in production

## 🔧 Server Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend & backend |
| `npm run dev:server` | Start backend only (port 8080) |
| `npm run dev:client` | Start frontend only (port 5173) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run type-check` | Check TypeScript types |

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
# TikTok Integration (optional)
TIKTOK_USERNAME=your_tiktok_username

# Server Configuration  
PORT=8080
NODE_ENV=development
```

### 🤖 Mock Mode vs Live Mode

The server automatically detects which mode to run based on your configuration:

**🎮 Mock Mode (Default - Perfect for Testing):**
```env
# Option 1: No .env file (auto-mock mode)
# Option 2: Empty TIKTOK_USERNAME
TIKTOK_USERNAME=
# Option 3: Force mock mode
MOCK_MODE=true
```
- ✅ Automatically generates realistic simulated players
- ✅ Perfect for testing, development, and demos
- ✅ No TikTok account needed
- 🎭 Mock players: Alice, Bob, Charlie, Diana, Eve, Frank, Grace, Henry
- ⏱️ Configurable guess intervals (default: 2 seconds)

**🔴 Live Mode (Real TikTok Integration):**
```env
TIKTOK_USERNAME=your_actual_username
MOCK_MODE=false
```
- 🎯 Connects to real TikTok live stream
- 🎤 Real viewers' chat becomes game guesses
- 📱 Requires active TikTok live stream

**🔧 Advanced Configuration:**
```env
# Force mock mode even with TikTok username (for testing)
TIKTOK_USERNAME=some_username
MOCK_MODE=true  # This overrides TikTok connection
```

## 🏗️ Project Structure

```
📦 tiktok-wordle/
├── 🎨 client/                 # React Frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── App.tsx           # Main game component
│   │   ├── App.css           # Styling
│   │   ├── components/       # UI components
│   │   │   ├── GuessRow.tsx   # Wordle tile display
│   │   │   ├── ScoreBoard.tsx # Leaderboard
│   │   │   └── WinnerModal.tsx # Win celebration
│   │   └── lib/
│   │       ├── utils.ts       # Utilities
│   │       └── styles.ts      # Style variants
│   ├── package.json
│   └── tailwind.config.js
├── 🖥️ server/                # Node.js Backend
│   ├── src/
│   │   ├── index.ts          # Server entry point
│   │   ├── game.ts           # Wordle game logic  
│   │   ├── types.ts          # TypeScript interfaces
│   │   └── words.ts          # Word dictionary
│   └── package.json
├── 📝 package.json           # Root scripts
├── 🔧 .env.example
└── 📚 README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/state` | Get current game state |
| `POST` | `/api/reset` | Reset scores and start new round |
| `POST` | `/api/new-round` | Start a new round |
| `WS` | `/ws` | WebSocket connection for real-time updates |

### Example API Usage
```bash
# Get current game state
curl http://localhost:8080/api/state

# Reset the game
curl -X POST http://localhost:8080/api/reset
```

## 🎮 How It Works

1. **Word Selection**: Server picks a random 5-letter word
2. **Player Guesses**: Chat messages (or mock data) are evaluated as guesses
3. **Real-time Updates**: WebSocket broadcasts results instantly  
4. **Visual Feedback**: Colored tiles show letter correctness
5. **Winner Detection**: First correct guess wins the round
6. **Scoreboard Update**: Winners get points and celebration
7. **Auto-restart**: New round begins after 5 seconds

## 🎨 UI Components

- **Modern Design**: Glassmorphism with purple/blue gradients
- **Responsive Layout**: Desktop and mobile friendly  
- **Animated Tiles**: Smooth color transitions for guess feedback
- **Winner Celebrations**: Particle effects and trophy animations
- **Live Status**: Connection indicators and player count
- **Empty States**: Helpful messages when waiting for players

## 🚀 Production Deployment

### Build the Application
```bash
npm run build
```

### Deploy Options

**Vercel/Netlify (Frontend):**
```bash
# Build client
npm run build
# Deploy /client/dist folder
```

**Railway/Render/Fly.io (Full Stack):**
```bash
# Set environment variables
export TIKTOK_USERNAME=your_username
export PORT=8080

# Start production server
npm start
```

### Environment Variables for Production
```env
TIKTOK_USERNAME=your_tiktok_username
PORT=8080
NODE_ENV=production
```

## 🔧 Troubleshooting

**UI Shows Black Screen:**
- Check http://localhost:5173 (not 8080)
- Look for console errors in browser DevTools
- Ensure both servers are running

**"Cannot GET" at Port 8080:**
- Port 8080 is the WebSocket/API server, not the UI
- Use http://localhost:5173 for the game interface

**WebSocket Connection Failed:**
- Ensure backend server is running on port 8080  
- Check browser console for connection errors
- Verify no firewall blocking WebSocket connections

**No Mock Data Appearing:**
- Check server console for "running without TikTok integration" message
- Ensure backend is generating mock guesses every 2 seconds
- Refresh the frontend page

## 🎯 For Streamers

1. **Test First**: Run in mock mode to see the UI
2. **Configure TikTok**: Add your username to `.env` 
3. **OBS Setup**: Add browser source with the frontend URL
4. **Go Live**: Start your TikTok live stream
5. **Engage**: Tell viewers to guess 5-letter words in chat!

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript, WebSocket
- **Integration**: TikTok Live Connector
- **Styling**: Modern glassmorphism design with CSS variables
- **Build**: Vite for frontend, TypeScript compiler for backend

---

## 🎊 Ready to Stream?

1. Run `npm run dev`
2. Open http://localhost:5173  
3. Watch the mock players compete!
4. Add to OBS and start streaming! 🚀

**Happy Streaming! 🎮✨**