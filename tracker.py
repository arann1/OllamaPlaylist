import json
import os
from datetime import datetime


HISTORY_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "history.json")


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


def save_run(analysis, tracks, top_artists, track_count, runtime):
    """Append a single run snapshot to history.json."""
    history = load_history()

    snapshot = {
        "timestamp": datetime.now().isoformat(),
        "date": datetime.now().strftime("%Y-%m-%d"),
        "time": datetime.now().strftime("%H:%M"),

        "runtime_seconds": runtime,
        "model": "qwen2.5:7b",


        "mood": analysis["mood"],
        "energy_level": analysis["energy_level"],
        "genres": analysis["genres"],
        "summary": analysis["summary"],
        "search_queries": analysis["search_queries"],
        "tracks_added": track_count,
        "top_artists": [a["name"] for a in top_artists[:10]],
        "recent_tracks_sample": [
            {"name": t["name"], "artist": t["artist"]}
            for t in tracks[:10]
        ],
    }

    history.append(snapshot)

    os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    print(f"Run saved to history. Total runs tracked: {len(history)}")
    return snapshot