🎵 Musy - Voice-Controlled Web Music Player

A real-time voice-powered web music player built with React, Node.js, MongoDB, and the Web Speech API.

Musy lets users control music using natural speech commands like:
“play/pause”
“volume up/down”
"next song/previous song"
"forward 10 sec/backward 10 sec"
"seek to 40sec/ go to 40 sec" or 
just say any song name by a provided list like 
"Beliver" -> beliver song will be played
"Naatu naatu" -> Naatu naatu song will be played


🚀 Features
✔ Voice-controlled playback (Play, Pause, Next, Previous)
✔ Voice search for tracks
✔ Manual mode (press-to-talk button)
✔ Animated music UI (speaker pulse + theme colors per track)
✔ MongoDB-based track metadata
✔ Static MP3 serving from backend
✔ Single-page React frontend

🏗 Architecture Overview
music player/
│
├── frontend/         # React UI (single-page app)
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
│
├── backend/          # Node.js + Express API
│   ├── audio/        # Local MP3 files served statically
│   ├── src/
│   │   ├── server.js # REST API + static file serving
│   │   └── routes/
│   └── package.json
│
├── README.md
└── .env

Backend Responsibilities:
  Serve audio files (/audio/*.mp3)
  Expose API endpoints (/,/songs)
  Provide metadata for playlist
  MongoDB integration

Frontend Responsibilities
  Render player UI
  Handle voice recognition (Web Speech API)
  Convert text → intent and send to backend
  Map recognized text → intent
  Animate UI with track colors and audio spikes animation

⚙️ Setup & Run Instructions
1️⃣ Clone the repository
git clone https://github.com/SumanthSV/Music_Player.git
cd Music_Player

Backend Setup
2️⃣ Install backend dependencies
cd backend
npm install

3️⃣ Environment variables
Create a .env file inside backend/:
PORT=5000
MONGO_URI=your_mongo_atlas_url
DB_NAME=your_db_name

4️⃣ Start backend
npm run dev
Backend will run on:
http://localhost:5000

Frontend Setup
5️⃣ Install frontend dependencies
cd ../frontend
npm install

6️⃣ Start frontend
npm run dev
Frontend will run on:
http://localhost:5173

🔊 List of Supported Voice Commands
🎵 Playback
| Intent                  | Example Utterances                       |
| ------------------------| ---------------------------------------  |
| Play                    | "play", "resume song"                    | 
| Pause                   | "pause", "stop music"                    |
| Next Track              | "next", "skip", "next song"              |
| Previous Track          | "previous", "go back", "previous song"   |
| Volume up               | "increase volume", "volume up"           |
| Volume down             | "volume down", "decrease volume",        |
| Seek Forward            | "forward 10 seconds"                     |
| Seek Back               | "backward 10 seconds", "rewind"          |
| Seek to specific time   | "seek to 60 seconds", "go to 50 seconds" |
| To play particular song | < "_just say any song name from list_" > |


🔧 How Intent Processing Works
Frontend Pipeline:

  Speech → Text (Web Speech API)
          ↓
  Intent Parser (frontend utility)
          ↓
  if the intent is command of song name -> Song matching is done and a paticular song is picked -> POST /songs (songs are fetched for the backend)
          ↓
  if it is a normal command -> action will be taken

🧪 How to Test Locally

to seed data to the mongo use the given SeedSongs.json file

✔ 1. Start backend → confirm http://localhost:5000/songs returns JSON
✔ 2. Start frontend → confirm playlist loads
✔ 3. Test audio playback
✔ 4. Press “Speak” and try commands:

"beliver" -> song name

"pause"
"next"
"volume up"

⚠️ Limitations

  Browser Web Speech API accuracy varies by device
  Local audio files (no cloud streaming)
  No real audio fingerprinting (humming search not included)
  Not optimized for large playlists
  Background/noisy environments reduce accuracy

🎥 Deployment link
https://music-player-liard-nu.vercel.app/
