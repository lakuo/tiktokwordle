import { LetterEval } from "./types.js";

// 🌐 Fetch random word from API
export async function fetchRandomWord(length: number = 5): Promise<string> {
  try {
    const response = await fetch(`https://random-word-api.vercel.app/api?words=1&length=${length}`);
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
      return data[0].toUpperCase();
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    console.error('🌐 Failed to fetch word from API:', error);
    throw error;
  }
}

// 📚 Fallback word picker from local list
export function pickRandomWord(words: string[], length: number): string {
  const pool = words.filter(w => w.length === length);
  if (pool.length === 0) throw new Error(`No words of length ${length}`);
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx].toUpperCase();
}

// 🎯 Smart word picker - tries API first, falls back to local list
export async function getRandomWord(fallbackWords: string[], length: number = 5): Promise<string> {
  try {
    console.log(`🌐 Fetching random ${length}-letter word from API...`);
    const word = await fetchRandomWord(length);
    console.log(`✅ Got word from API: ${word}`);
    return word;
  } catch (error) {
    console.log(`⚠️ API failed, using fallback word list...`);
    const fallbackWord = pickRandomWord(fallbackWords, length);
    console.log(`📚 Using fallback word: ${fallbackWord}`);
    return fallbackWord;
  }
}

export function normalizeGuess(raw: string, length: number): string | null {
  const g = raw.replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (g.length !== length) return null;
  return g;
}

// Correct Wordle rules with duplicate handling
export function evalGuess(secret: string, guess: string): LetterEval[] {
  const result: LetterEval[] = [];
  const secretChars = secret.split("");
  const guessChars = guess.split("");

  // First pass: mark corrects and count remaining letters
  const remaining: Record<string, number> = {};
  for (let i = 0; i < secretChars.length; i++) {
    const s = secretChars[i];
    const g = guessChars[i];
    if (g === s) {
      result[i] = { letter: g, state: "correct" };
    } else {
      remaining[s] = (remaining[s] || 0) + 1;
      result[i] = { letter: g, state: "absent" }; // temp
    }
  }
  // Second pass: mark presents
  for (let i = 0; i < secretChars.length; i++) {
    if (result[i].state === "correct") continue;
    const g = guessChars[i];
    if (remaining[g] > 0) {
      result[i] = { letter: g, state: "present" };
      remaining[g] -= 1;
    } else {
      result[i] = { letter: g, state: "absent" };
    }
  }
  return result;
}
