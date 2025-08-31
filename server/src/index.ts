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

console.log(`🎯 TikTok Live Wordle Game Starting...`);
console.log(`📋 Config: TIKTOK_USERNAME=${process.env.TIKTOK_USERNAME || 'not set'}`);

dotenv.config({ path: '../.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

interface GameState {
  isRoundActive: boolean;
  currentWord: string;
  wordLength: number;
  guesses: GuessEvent[];
  scoreboard: Record<string, number>;
  users: Record<string, { name: string; avatar: string | null }>;
  roundStartTime: number;
  roundDuration: number;
  isWaitingForNextRound: boolean;
  lastWinner?: {
    id: string;
    name: string;
    avatar: string | null;
    word: string;
    at: number;
  };
}

let gameState: GameState = {
  isRoundActive: true,
  currentWord: 'HOUSE',
  wordLength: 5,
  guesses: [],
  scoreboard: {},
  users: {},
  roundStartTime: Date.now(),
  roundDuration: 30,
  isWaitingForNextRound: false,
};

let roundTimer: NodeJS.Timeout | null = null;

async function initializeGame() {
  try {
    gameState.currentWord = await getRandomWord(WORDS, gameState.wordLength);
    console.log(`🎯 Game initialized with word: ${gameState.currentWord}`);
  } catch (error) {
    console.error('❌ Failed to initialize game word:', error);
    gameState.currentWord = pickRandomWord(WORDS, gameState.wordLength);
    console.log(`📚 Using fallback word: ${gameState.currentWord}`);
  }
  
  roundTimer = setTimeout(() => {
    if (gameState.isRoundActive) {
      console.log('⏰ Initial round timeout - revealing answer');
      handleRoundTimeout();
    }
  }, gameState.roundDuration * 1000);
}

initializeGame();

const websocketClients = new Set<WebSocket>();

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

app.get('/api/state', (req, res) => {
  res.json({
    roundActive: gameState.isRoundActive,
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

function broadcastMessage(message: OutboundMessage) {
  const serializedMessage = JSON.stringify(message);
  websocketClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(serializedMessage);
    }
  });
}

async function startNewRound() {
  if (roundTimer) {
    clearTimeout(roundTimer);
    roundTimer = null;
  }
  
  gameState.isRoundActive = true;
  gameState.isWaitingForNextRound = false;
  gameState.guesses = [];
  gameState.roundStartTime = Date.now();
  
  try {
    gameState.currentWord = await getRandomWord(WORDS, gameState.wordLength);
    console.log(`🔄 New round started with word: ${gameState.currentWord}`);
  } catch (error) {
    console.error('❌ Failed to get new word:', error);
    gameState.currentWord = pickRandomWord(WORDS, gameState.wordLength);
    console.log(`📚 New round with fallback word: ${gameState.currentWord}`);
  }
  
  roundTimer = setTimeout(() => {
    if (gameState.isRoundActive) {
      console.log('⏰ Round timeout - revealing answer');
      handleRoundTimeout();
    }
  }, gameState.roundDuration * 1000);
  
  const stateMessage: StateEvent = {
    type: 'state',
    roundActive: gameState.isRoundActive,
    wordLength: gameState.wordLength,
    guesses: gameState.guesses,
    scoreboard: gameState.scoreboard,
    users: gameState.users,
    roundStartTime: gameState.roundStartTime,
    roundDuration: gameState.roundDuration,
    lastWinner: gameState.lastWinner,
  };
  
  broadcastMessage(stateMessage);
}

function handleRoundTimeout() {
  console.log(`⏰ TIMEOUT: Round ended, revealing word: ${gameState.currentWord}`);
  gameState.isRoundActive = false;
  gameState.isWaitingForNextRound = true;
  
  const timeoutMessage: RoundTimeoutEvent = {
    type: 'round_timeout',
    word: gameState.currentWord,
    timestamp: Date.now(),
  };
  
  console.log('📡 Broadcasting timeout event:', timeoutMessage);
  broadcastMessage(timeoutMessage);
  
  setTimeout(async () => {
    console.log('🔄 Starting new round after timeout...');
    await startNewRound();
  }, 10000);
}

function processPlayerGuess(username: string, userId: string, avatar: string | null, rawGuess: string) {
  if (!gameState.isRoundActive || gameState.isWaitingForNextRound) return;

  const normalizedGuess = normalizeGuess(rawGuess, gameState.wordLength);
  if (!normalizedGuess) return;

  console.log(`💬 Valid guess: ${username} guessed "${normalizedGuess}"`);

  gameState.users[username] = { name: username, avatar };

  const guessEvaluation = evalGuess(gameState.currentWord, normalizedGuess);
  const isCorrectGuess = guessEvaluation.every(evaluation => evaluation.state === 'correct');

  const guessMessage: GuessEvent = {
    type: 'guess',
    guess: normalizedGuess,
    eval: guessEvaluation,
    user: { id: userId, name: username, avatar },
    timestamp: Date.now(),
  };

  gameState.guesses.push(guessMessage);
  broadcastMessage(guessMessage);

  if (isCorrectGuess) {
    gameState.isRoundActive = false;
    gameState.isWaitingForNextRound = true;
    
    if (roundTimer) {
      clearTimeout(roundTimer);
      roundTimer = null;
    }
    
    gameState.scoreboard[username] = (gameState.scoreboard[username] || 0) + 1;
    
    const winnerData = { id: userId, name: username, avatar };
    gameState.lastWinner = {
      ...winnerData,
      word: gameState.currentWord,
      at: Date.now(),
    };

    const roundWonMessage: RoundWonEvent = {
      type: 'round_won',
      winner: winnerData,
      word: gameState.currentWord,
      scoreboard: gameState.scoreboard,
      timestamp: Date.now(),
    };

    broadcastMessage(roundWonMessage);

    setTimeout(async () => {
      await startNewRound();
    }, 10000);
  }
}

wss.on('connection', (websocket) => {
  websocketClients.add(websocket);
  
  const stateMessage: StateEvent = {
    type: 'state',
    roundActive: gameState.isRoundActive,
    wordLength: gameState.wordLength,
    guesses: gameState.guesses,
    scoreboard: gameState.scoreboard,
    users: gameState.users,
    roundStartTime: gameState.roundStartTime,
    roundDuration: gameState.roundDuration,
    lastWinner: gameState.lastWinner,
  };
  
  websocket.send(JSON.stringify(stateMessage));

  websocket.on('close', () => {
    websocketClients.delete(websocket);
  });
});

const TIKTOK_USERNAME = process.env.TIKTOK_USERNAME;

if (!TIKTOK_USERNAME) {
  console.error('❌ No TIKTOK_USERNAME provided in environment variables');
  console.log('💡 Please set TIKTOK_USERNAME=<username> in your .env file');
  process.exit(1);
}

console.log(`🔴 Connecting to TikTok Live: @${TIKTOK_USERNAME}`);

const tiktokLiveConnection = new WebcastPushConnection(TIKTOK_USERNAME);

tiktokLiveConnection.connect().then(state => {
  console.log(`✅ Connected to TikTok Live: ${TIKTOK_USERNAME}`);
  console.log(`👀 Listening for chat messages...`);
}).catch(err => {
  console.error('❌ TikTok connection failed:', err);
  console.log('💡 Tip: Make sure the username is correct and the user is live streaming');
});

tiktokLiveConnection.on('chat', chatData => {
  processPlayerGuess(
    chatData.nickname,
    chatData.userId,
    chatData.profilePictureUrl || null,
    chatData.comment
  );
});

tiktokLiveConnection.on('error', err => {
  console.error('🚨 TikTok error:', err);
});

tiktokLiveConnection.on('disconnect', () => {
  console.log('📱 TikTok stream ended or connection lost');
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Current word: ${gameState.currentWord}`);
});