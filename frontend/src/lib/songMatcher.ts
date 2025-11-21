import type { Song } from './types';

export const findBestMatch = (spokenText: string, songs: Song[]): Song | null => {
  const normalized = spokenText.toLowerCase().trim();

  let bestMatch: Song | null = null;
  let highestScore = 0;

  for (const song of songs) {
    let score = 0;

    const titleLower = song.title.toLowerCase();
    const artistLower = song.artist.toLowerCase();

    if (titleLower === normalized || artistLower === normalized) {
      return song;
    }

    if (titleLower.includes(normalized) || normalized.includes(titleLower)) {
      score += 10;
    }

    if (artistLower.includes(normalized) || normalized.includes(artistLower)) {
      score += 8;
    }

    for (const keyword of song.keywords) {
      const keywordLower = keyword.toLowerCase();
      if (keywordLower === normalized) {
        return song;
      }
      if (keywordLower.includes(normalized) || normalized.includes(keywordLower)) {
        score += 5;
      }
    }

    const words = normalized.split(' ');
    for (const word of words) {
      if (word.length > 2) {
        if (titleLower.includes(word)) {
          score += 2;
        }
        if (artistLower.includes(word)) {
          score += 1;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = song;
    }
  }

  return highestScore > 0 ? bestMatch : null;
};
