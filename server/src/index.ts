import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { WebcastPushConnection } from 'tiktok-live-connector';
import { getRandomWord, pickRandomWord, normalizeGuess, evalGuess } from './game.js';
import { WORDS } from './words.js';
import type { GuessEvent, StateEvent, RoundWonEvent, RoundTimeoutEvent, OutboundMessage } from './types.js';

dotenv.config({ path: '../.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🎮 TIKTOK LIVE CONFIGURATION
console.log(`🎯 TikTok Live Wordle Game Starting...`);
console.log(`📋 Config: TIKTOK_USERNAME=${process.env.TIKTOK_USERNAME || 'not set'}`);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

interface GameState {
  roundActive: boolean;
  currentWord: string;
  wordLength: number;
  guesses: GuessEvent[];
  scoreboard: Record<string, number>;
  users: Record<string, { name: string; avatar: string | null }>; // Track user data
  roundStartTime: number; // Add round start timestamp
  roundDuration: number; // Duration in seconds (30)
  isWaitingForNextRound: boolean; // Track waiting period between rounds
  lastWinner?: {
    id: string;
    name: string;
    avatar: string | null;
    word: string;
    at: number;
  };
}

let gameState: GameState = {
  roundActive: true,
  currentWord: 'HOUSE', // Initial placeholder, will be replaced
  wordLength: 5,
  guesses: [],
  scoreboard: {},
  users: {},
  roundStartTime: Date.now(),
  roundDuration: 30, // 30 seconds per round
  isWaitingForNextRound: false,
};

let roundTimeoutId: NodeJS.Timeout | null = null;

// 🎯 Initialize first word asynchronously
async function initializeGame() {
  try {
    gameState.currentWord = await getRandomWord(WORDS, gameState.wordLength);
    console.log(`🎯 Game initialized with word: ${gameState.currentWord}`);
  } catch (error) {
    console.error('❌ Failed to initialize game word:', error);
    gameState.currentWord = pickRandomWord(WORDS, gameState.wordLength);
    console.log(`📚 Using fallback word: ${gameState.currentWord}`);
  }
  
  // Set the initial timeout for the first round
  roundTimeoutId = setTimeout(() => {
    if (gameState.roundActive) {
      console.log('⏰ Initial round timeout - revealing answer');
      handleRoundTimeout();
    }
  }, gameState.roundDuration * 1000);
}

// Initialize game on startup
initializeGame();

const clients = new Set<WebSocket>();

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

app.get('/api/state', (req, res) => {
  res.json({
    roundActive: gameState.roundActive,
    wordLength: gameState.wordLength,
    guesses: gameState.guesses,
    scoreboard: gameState.scoreboard,
    users: gameState.users,
    roundStartTime: gameState.roundStartTime,
    roundDuration: gameState.roundDuration,
    lastWinner: gameState.lastWinner,
  });
});

app.post('/api/reset', async (req, res) => {
  gameState.guesses = [];
  gameState.scoreboard = {};
  gameState.users = {};
  gameState.lastWinner = undefined;
  await startNewRound();
  res.json({ success: true, message: 'Game reset and new round started' });
});

app.post('/api/new-round', async (req, res) => {
  await startNewRound();
  res.json({ success: true, message: 'New round started', currentWord: gameState.currentWord });
});

function broadcast(message: OutboundMessage) {
  const data = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

async function startNewRound() {
  // Clear any existing timeout
  if (roundTimeoutId) {
    clearTimeout(roundTimeoutId);
    roundTimeoutId = null;
  }
  
  gameState.roundActive = true;
  gameState.isWaitingForNextRound = false;
  gameState.guesses = [];
  gameState.roundStartTime = Date.now(); // Reset round timer
  
  try {
    gameState.currentWord = await getRandomWord(WORDS, gameState.wordLength);
    console.log(`🔄 New round started with word: ${gameState.currentWord}`);
  } catch (error) {
    console.error('❌ Failed to get new word:', error);
    gameState.currentWord = pickRandomWord(WORDS, gameState.wordLength);
    console.log(`📚 New round with fallback word: ${gameState.currentWord}`);
  }
  
  // Set timeout to end round after 30 seconds if no winner
  roundTimeoutId = setTimeout(() => {
    if (gameState.roundActive) {
      console.log('⏰ Round timeout - revealing answer');
      handleRoundTimeout();
    }
  }, gameState.roundDuration * 1000);
  
  const stateEvent: StateEvent = {
    type: 'state',
    roundActive: gameState.roundActive,
    wordLength: gameState.wordLength,
    guesses: gameState.guesses,
    scoreboard: gameState.scoreboard,
    users: gameState.users,
    roundStartTime: gameState.roundStartTime,
    roundDuration: gameState.roundDuration,
    lastWinner: gameState.lastWinner,
  };
  
  broadcast(stateEvent);
}

function handleRoundTimeout() {
  console.log(`⏰ TIMEOUT: Round ended, revealing word: ${gameState.currentWord}`);
  gameState.roundActive = false;
  gameState.isWaitingForNextRound = true;
  
  const timeoutEvent: RoundTimeoutEvent = {
    type: 'round_timeout',
    word: gameState.currentWord,
    timestamp: Date.now(),
  };
  
  console.log('📡 Broadcasting timeout event:', timeoutEvent);
  broadcast(timeoutEvent);
  
  // Wait 10 seconds before starting next round
  setTimeout(async () => {
    console.log('🔄 Starting new round after timeout...');
    await startNewRound();
  }, 10000);
}

function processGuess(username: string, userId: string, avatar: string | null, rawGuess: string) {
  // Don't process guesses if round is not active or if we're waiting for next round
  if (!gameState.roundActive || gameState.isWaitingForNextRound) return;

  const guess = normalizeGuess(rawGuess, gameState.wordLength);
  if (!guess) return;

  // Log valid chat entries only
  console.log(`💬 Valid guess: ${username} guessed "${guess}"`);

  // Track user data
  gameState.users[username] = { name: username, avatar };

  const evaluation = evalGuess(gameState.currentWord, guess);
  const isWin = evaluation.every(e => e.state === 'correct');

  const guessEvent: GuessEvent = {
    type: 'guess',
    guess,
    eval: evaluation,
    user: { id: userId, name: username, avatar },
    timestamp: Date.now(),
  };

  gameState.guesses.push(guessEvent);
  broadcast(guessEvent);

  if (isWin) {
    gameState.roundActive = false;
    gameState.isWaitingForNextRound = true;
    
    // Clear the timeout since someone won
    if (roundTimeoutId) {
      clearTimeout(roundTimeoutId);
      roundTimeoutId = null;
    }
    
    gameState.scoreboard[username] = (gameState.scoreboard[username] || 0) + 1;
    
    const winner = { id: userId, name: username, avatar };
    gameState.lastWinner = {
      ...winner,
      word: gameState.currentWord,
      at: Date.now(),
    };

    const roundWonEvent: RoundWonEvent = {
      type: 'round_won',
      winner,
      word: gameState.currentWord,
      scoreboard: gameState.scoreboard,
      timestamp: Date.now(),
    };

    broadcast(roundWonEvent);

    setTimeout(async () => {
      await startNewRound();
    }, 10000);
  }
}

wss.on('connection', (ws) => {
  clients.add(ws);
  
  const stateEvent: StateEvent = {
    type: 'state',
    roundActive: gameState.roundActive,
    wordLength: gameState.wordLength,
    guesses: gameState.guesses,
    scoreboard: gameState.scoreboard,
    users: gameState.users,
    roundStartTime: gameState.roundStartTime,
    roundDuration: gameState.roundDuration,
    lastWinner: gameState.lastWinner,
  };
  
  ws.send(JSON.stringify(stateEvent));

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// 🔌 TIKTOK CONNECTION SETUP
const TIKTOK_USERNAME = process.env.TIKTOK_USERNAME;

if (!TIKTOK_USERNAME) {
  console.error('❌ No TIKTOK_USERNAME provided in environment variables');
  console.log('💡 Please set TIKTOK_USERNAME=<username> in your .env file');
  process.exit(1);
}

console.log(`🔴 Connecting to TikTok Live: @${TIKTOK_USERNAME}`);

const tiktokConnection = new WebcastPushConnection(TIKTOK_USERNAME);

tiktokConnection.connect().then(state => {
  console.log(`✅ Connected to TikTok Live: ${TIKTOK_USERNAME}`);
  console.log(`👀 Listening for chat messages...`);
}).catch(err => {
  console.error('❌ TikTok connection failed:', err);
  console.log('💡 Tip: Make sure the username is correct and the user is live streaming');
});

tiktokConnection.on('chat', data => {
  processGuess(
    data.nickname,
    data.userId,
    data.profilePictureUrl || null,
    data.comment
  );
});

tiktokConnection.on('error', err => {
  console.error('🚨 TikTok error:', err);
});

tiktokConnection.on('disconnect', () => {
  console.log('📱 TikTok stream ended or connection lost');
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Current word: ${gameState.currentWord}`);
});