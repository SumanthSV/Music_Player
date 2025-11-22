import type { Song } from './types';

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function fetchSongs(): Promise<Song[]> {
  const res = await fetch(`${SERVER_URL}/songs`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed fetching songs: ${res.status} ${res.statusText} ${text}`);
  }

  const data = await res.json();
  return data as Song[];
}