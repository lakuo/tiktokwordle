import { LetterEval } from "./types.js";

export function pickRandomWord(words: string[], length: number): string {
  const pool = words.filter(w => w.length === length);
  if (pool.length === 0) throw new Error(`No words of length ${length}`);
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx].toUpperCase();
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
