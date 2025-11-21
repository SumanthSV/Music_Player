import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
// serve local audio files from /audio
app.use('/audio', express.static(path.join(process.cwd(), 'audio')));

const MONGO_URL = process.env.MONGO_URL || process.env.DATABASE_URL;
const DB_NAME = process.env.DB_NAME || 'musy';
const PORT = process.env.PORT || 4000;

if (!MONGO_URL) {
  console.error('Missing MONGO_URL in environment');
  process.exit(1);
}

let dbClient;
let db;



app.get('/songs', async (req, res) => {
  try {
    let songs = await db.collection('songs').find({}).sort({ title: 1 }).toArray();

    // Normalize audio URLs so frontend can fetch them.
    const host = req.protocol + '://' + req.get('host');
    songs = songs.map((s) => {
      const audioUrl = s.audio_url || s.audio || '';
      // If already an absolute URL, keep it. Otherwise, use the /audio static route with basename.
      if (!audioUrl) return s;

      if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
        return { ...s, audio_url: audioUrl };
      }

      const filename = path.basename(audioUrl);
      return { ...s, audio_url: `${host}/audio/${filename}` };
    });

    res.json(songs);
  } catch (err) {
    console.error('Failed to get songs', err);
    res.status(500).json({ error: 'Failed to get songs' });
  }
});

app.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

async function connect() {
  dbClient = new MongoClient(MONGO_URL);
  await dbClient.connect();
  db = dbClient.db(DB_NAME);
  console.log('Connected to MongoDB:', DB_NAME);
}


connect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to DB', err);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  if (dbClient) await dbClient.close();
  process.exit(0);
});
