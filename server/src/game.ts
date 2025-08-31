import { LetterEval } from "./types.js";

export async function fetchRandomWord(targetLength: number = 5): Promise<string> {
  try {
    const response = await fetch(`https://random-word-api.vercel.app/api?words=1&length=${targetLength}`);
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    const responseData = await response.json();
    
    if (Array.isArray(responseData) && responseData.length > 0 && typeof responseData[0] === 'string') {
      return responseData[0].toUpperCase();
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    console.error('🌐 Failed to fetch word from API:', error);
    throw error;
  }
}

export function pickRandomWord(wordList: string[], targetLength: number): string {
  const filteredWords = wordList.filter(word => word.length === targetLength);
  if (filteredWords.length === 0) throw new Error(`No words of length ${targetLength}`);
  const randomIndex = Math.floor(Math.random() * filteredWords.length);
  return filteredWords[randomIndex].toUpperCase();
}

export async function getRandomWord(fallbackWordList: string[], targetLength: number = 5): Promise<string> {
  try {
    console.log(`🌐 Fetching random ${targetLength}-letter word from API...`);
    const apiWord = await fetchRandomWord(targetLength);
    console.log(`✅ Got word from API: ${apiWord}`);
    return apiWord;
  } catch (error) {
    console.log(`⚠️ API failed, using fallback word list...`);
    const fallbackWord = pickRandomWord(fallbackWordList, targetLength);
    console.log(`📚 Using fallback word: ${fallbackWord}`);
    return fallbackWord;
  }
}

export function normalizeGuess(rawInput: string, expectedLength: number): string | null {
  const cleanedInput = rawInput.replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (cleanedInput.length !== expectedLength) return null;
  return cleanedInput;
}

export function evalGuess(targetWord: string, playerGuess: string): LetterEval[] {
  const evaluationResult: LetterEval[] = [];
  const targetLetters = targetWord.split("");
  const guessLetters = playerGuess.split("");

  const remainingLetterCounts: Record<string, number> = {};
  for (let position = 0; position < targetLetters.length; position++) {
    const targetLetter = targetLetters[position];
    const guessedLetter = guessLetters[position];
    if (guessedLetter === targetLetter) {
      evaluationResult[position] = { letter: guessedLetter, state: "correct" };
    } else {
      remainingLetterCounts[targetLetter] = (remainingLetterCounts[targetLetter] || 0) + 1;
      evaluationResult[position] = { letter: guessedLetter, state: "absent" };
    }
  }
  
  for (let position = 0; position < targetLetters.length; position++) {
    if (evaluationResult[position].state === "correct") continue;
    const guessedLetter = guessLetters[position];
    if (remainingLetterCounts[guessedLetter] > 0) {
      evaluationResult[position] = { letter: guessedLetter, state: "present" };
      remainingLetterCounts[guessedLetter] -= 1;
    } else {
      evaluationResult[position] = { letter: guessedLetter, state: "absent" };
    }
  }
  return evaluationResult;
}
