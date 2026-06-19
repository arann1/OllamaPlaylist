import json
import os
from datetime import datetime

from config import OLLAMA_MODEL

backend_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(backend_dir)
HISTORY_FILE = os.path.join(project_dir, "data", "history.json")


def load_history():
    if not os.path.exists(HISTORY_FILE):
        return []

    try:
        with open(HISTORY_FILE, "r") as f:
            content = f.read().strip()
            if not content:
                return []
            return json.loads(content)
    except Exception:
        return []


def save_run(
    analysis,
    tracks,
    top_artists,
    track_count,
    runtime,
    library_artist_count=0,
    source_playlists=None,
    preferred_artists_detail=None,
    curated_tracks_sample=None,
):
    """Append a single run snapshot to history.json."""
    history = load_history()

    snapshot = {
        "timestamp": datetime.now().isoformat(),
        "date": datetime.now().strftime("%Y-%m-%d"),
        "time": datetime.now().strftime("%H:%M"),
        "runtime_seconds": runtime,
        "model": OLLAMA_MODEL,
        "mood": analysis["mood"],
        "energy_level": analysis["energy_level"],
        "genres": analysis["genres"],
        "taste_profile": analysis.get("taste_profile", []),
        "preferred_artists": analysis.get("preferred_artists", []),
        "preferred_artists_detail": preferred_artists_detail or [],
        "summary": analysis["summary"],
        "tracks_added": track_count,
        "library_artist_count": library_artist_count,
        "source_playlists": source_playlists or [],
        "top_artists": [a["name"] for a in top_artists[:10]],
        "recent_tracks_sample": [
            {"name": t["name"], "artist": t["artist"]}
            for t in tracks[:10]
        ],
        "curated_tracks_sample": curated_tracks_sample or [],
    }

    history.append(snapshot)

    os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    print(f"Run saved to history. Total runs tracked: {len(history)}")
    return snapshot
