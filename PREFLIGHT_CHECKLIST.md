# PRE-FLIGHT CHECKLIST ✅

## Code Review Status
- ✅ All Python files reviewed and validated
- ✅ Frontend HTML/JS reviewed and validated  
- ✅ All error handling in place
- ✅ All paths correct
- ✅ All imports correct
- ✅ No syntax errors

## Prerequisites for Running

### 1. Spotify Developer Setup
- [ ] Create app at https://developer.spotify.com/dashboard
- [ ] Copy Client ID
- [ ] Copy Client Secret
- [ ] Set Redirect URI to: `http://localhost:8888/callback`
- [ ] Create "OllamaPlaylist" playlist in Spotify app (public or private)

### 2. Ollama Setup
- [ ] Run `ollama serve` in terminal
- [ ] Download model: `ollama pull qwen2.5:7b` (or preferred model)
- [ ] Verify running: `curl http://localhost:11434/api/tags`

### 3. Environment Setup
- [ ] Create `.env` file in project root with:
  ```
  SPOTIFY_CLIENT_ID=your_id_here
  SPOTIFY_CLIENT_SECRET=your_secret_here
  SPOTIFY_REDIRECT_URI=http://localhost:8888/callback
  OLLAMA_HOST=http://localhost:11434
  OLLAMA_MODEL=qwen2.5:7b
  PLAYLIST_NAME=OllamaPlaylist
  ```

### 4. Python Dependencies
- [ ] Python 3.8+ installed
- [ ] Run: `cd backend && pip install -r requirements.txt`

### 5. Data Directories
- [ ] `data/` folder exists (auto-created)
- [ ] `logs/` folder will be created on first run

## What Will Happen When Running

```bash
cd backend
python playlist_updater.py
```

**First time:**
1. Opens browser for Spotify OAuth
2. You authenticate
3. Creates `.spotify_cache` (DO NOT commit/share)
4. Fetches your listening history
5. Sends to Ollama for analysis
6. Updates OllamaPlaylist

**Subsequent runs:**
1. Uses cached Spotify token
2. Repeats same flow
3. Appends to `data/history.json`

**Output files:**
- `logs/run_YYYYMMDD_HHMMSS.log` - Detailed execution log
- `data/history.json` - Accumulates all runs

## Expected Console Output

```
=== OllamaPlaylist run started ===
Fetching recently played tracks...
Got 50 recent tracks
Fetching top tracks...
Got 20 top tracks
Fetching top artists (last 4 weeks)...
Got 20 top artists
Analyzing with Ollama...
Sending to Ollama (qwen2.5:7b)...

=== RAW OLLAMA RESPONSE ===
{
  "mood": "Melancholic Indie",
  "energy_level": "medium",
  ...
}
===========================

Mood: Melancholic Indie
Energy: medium
Genres: indie, alternative, art-pop
Summary: [description]
Search queries: [list of 10 queries]
Searching for recommendations...
Found 60 candidate tracks before filtering
Filtered down to 28 tracks
Updating playlist 'OllamaPlaylist'...
Updated 'OllamaPlaylist' with 28 tracks.
Saving run to history...
Run saved to history. Total runs tracked: 1
=== Done. Log saved to logs/run_20260615_194530.log ===
```

## Success Indicators

After running, check:
1. ✅ No errors in console
2. ✅ `logs/run_*.log` created with details
3. ✅ `data/history.json` created with first snapshot
4. ✅ Spotify playlist updated with new tracks
5. ✅ Dashboard at https://spotify-ai-playlist-three.vercel.app shows data (after syncing)

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Playlist not found" | Create "OllamaPlaylist" in Spotify manually |
| "Connection refused" | Ensure Ollama running: `ollama serve` |
| "Invalid credentials" | Check .env file has correct IDs/secrets |
| "Module not found" | Run `pip install -r backend/requirements.txt` |
| ".spotify_cache permission error" | Delete `.spotify_cache`, re-run (OAuth flows) |

## Ready to Test?

When ready, run in backend folder:
```bash
python playlist_updater.py
```

This will:
1. Generate your first analysis
2. Create `data/history.json`
3. Update your Spotify playlist
4. Be ready to display on dashboard
