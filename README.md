# OllamaPlaylist

AI-powered Spotify playlist generator that learns from your listening history and existing playlists, then builds recommendations using only artists already in your library.

**[Live Dashboard](https://spotify-ai-playlist-three.vercel.app)** · **[GitHub](https://github.com/a-r-a-n/OllamaPlaylist)**

## How It Works

1. Fetches your recently played tracks, top artists, and top tracks
2. Scans your personal playlists to build a library of known artists and tracks
3. Sends everything to Ollama for taste analysis
4. Selects up to 30 tracks from your library — no new artist discovery
5. Updates your `OllamaPlaylist` and logs the run to `data/history.json`

## Setup

### Prerequisites

- Python 3.8+
- [Spotify Developer Account](https://developer.spotify.com/dashboard)
- [Ollama](https://ollama.ai) running locally
- A Spotify playlist named `OllamaPlaylist` (create it manually first)

### Install

```bash
cd backend
pip install -r requirements.txt
```

### Configure

Create `.env` in the project root:

```env
SPOTIFY_CLIENT_ID=your_id
SPOTIFY_CLIENT_SECRET=your_secret
SPOTIFY_REDIRECT_URI=http://localhost:8888/callback
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
PLAYLIST_NAME=OllamaPlaylist
```

```bash
ollama serve
ollama pull qwen2.5:7b
```

### Run

```bash
cd backend
python playlist_updater.py
```

First run opens the browser for Spotify OAuth. After each run, commit `data/history.json` to update the live dashboard.

## Project Structure

```
backend/          Python backend (runs locally)
  playlist_updater.py   Main entry point
  analyzer.py           Ollama taste analysis
  spotify.py            Spotify API + library selection
  tracker.py            Run history
  config.py             Environment config
dashboard/        Static dashboard (deployed to Vercel)
data/
  history.json      Run history (commit to update dashboard)
```

## Dashboard

The dashboard reads from `data/history.json` via `/api/data`. After running locally, commit the updated history file and push to deploy new data to Vercel.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Playlist not found | Create `OllamaPlaylist` in Spotify first |
| No tracks in library | Add music to your personal playlists |
| Ollama connection failed | Run `ollama serve`, check `OLLAMA_HOST` |
| Auth failed | Delete `.spotify_cache`, verify `.env` credentials |
| Dashboard empty | Run the backend, then commit `data/history.json` |

## License

MIT
