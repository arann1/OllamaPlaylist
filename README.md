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

### Linux server automation (every 24h)

```bash
chmod +x scripts/setup-linux.sh scripts/run_playlist_update.sh
./scripts/setup-linux.sh          # creates .venv + daily cron at midnight
./scripts/run_playlist_update.sh  # test a run manually
```

Cron logs go to `logs/cron_*.log`. Requires `backend/.spotify_cache` from one interactive auth run first. Use `OLLAMA_HOST=http://127.0.0.1:11434` when Ollama runs on the same machine.

For auto-push to GitHub after each run, the easiest setup is to configure the git remote URL on the server with a token:

```bash
git remote set-url origin https://x-access-token:YOUR_TOKEN@github.com/your-username/OllamaPlaylist.git
```

Alternatively add `GITHUB_TOKEN=ghp_...` to `.env` (GitHub → Settings → Developer settings → Personal access tokens, scope: `repo`).

**Watch live logs from your Machine:**

```bash
chmod +x scripts/watch-linux.sh
./scripts/watch-linux.sh
# or with password auth: SSHPASS=yourpass ./scripts/watch-linux.sh
```

Tip: run `ssh-copy-id aran@192.168.1.77` once so you never need the password for watching logs.

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

The dashboard is a static site on Vercel. The build step copies `data/history.json` into the deployed site at `/data/history.json`.

**To update the live dashboard:**

1. Run `python playlist_updater.py` locally
2. Commit and push `data/history.json`
3. Vercel redeploys automatically from GitHub

**Deploy troubleshooting:** If Vercel builds fail with an unmatched function pattern, ensure `vercel.json` uses `api/data.js` (not `dashboard/api/data.js`) because `outputDirectory` is already set to `dashboard`.

## Ollama logging

The Python run logs Ollama timing and token stats to your terminal/log file. For richer output in `journalctl -u ollama -f` on the terminal:

```bash
./scripts/enable-ollama-debug-logs.sh
journalctl -u ollama -f
```

This sets `OLLAMA_DEBUG=1` on the systemd service so each `/api/chat` request shows load time, eval time, and token counts.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Playlist not found | Create `OllamaPlaylist` in Spotify first |
| No tracks in library | Add music to your personal playlists |
| Ollama connection failed | Run `ollama serve`, check `OLLAMA_HOST` |
| Auth failed | Delete `backend/.spotify_cache`, verify `.env` credentials |
| 403 on playlist tracks | Delete `backend/.spotify_cache` and re-auth (scopes may have changed); some followed/editorial playlists are skipped automatically |
| Dashboard empty | Run the backend, then commit `data/history.json` |

## License

MIT
