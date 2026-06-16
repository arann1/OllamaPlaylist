import os
import logging
from datetime import datetime
from spotify import (
    get_recently_played,
    get_top_artists,
    get_top_tracks,
    search_tracks,
    filter_tracks,
    get_or_update_playlist
)
from analyzer import analyze
from tracker import save_run
from config import PLAYLIST_NAME
from time import time

# Setup logging
os.makedirs("logs", exist_ok=True)
log_file = f"logs/run_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(message)s",
    datefmt="%H:%M:%S",
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler(),
    ]
)
log = logging.getLogger(__name__)


def main():
    start_time = time()

    log.info("=== OllamaPlaylist run started ===")

    log.info("Fetching recently played tracks...")
    recent_tracks = get_recently_played(limit=50)
    recently_played_ids = [t["id"] for t in recent_tracks]
    log.info(f"Got {len(recent_tracks)} recent tracks")

    log.info("Fetching top tracks...")
    top_tracks = get_top_tracks(limit=20, time_range="short_term")
    log.info(f"Got {len(top_tracks)} top tracks")

    log.info("Fetching top artists (last 4 weeks)...")
    top_artists = get_top_artists(limit=20, time_range="short_term")
    log.info(f"Got {len(top_artists)} top artists")

    log.info("Analyzing with Ollama...")
    analysis = analyze(recent_tracks, top_artists, top_tracks)
    log.info(f"Taste Profile: {analysis['taste_profile']}")

    log.info(f"Mood: {analysis['mood']}")
    log.info(f"Energy: {analysis['energy_level']}")
    log.info(f"Genres: {', '.join(analysis['genres'])}")
    log.info(f"Summary: {analysis['summary']}")
    log.info(f"Search queries: {analysis['search_queries']}")

    log.info("Searching for recommendations...")
    candidates = search_tracks(analysis["search_queries"], limit_per_query=6)
    log.info(f"Found {len(candidates)} candidate tracks before filtering")

    final_ids = filter_tracks(
        candidates,
        recently_played_ids,
        max_per_artist=1,
        total=30,
    )
    log.info(f"Filtered down to {len(final_ids)} tracks")

    log.info(f"Updating playlist '{PLAYLIST_NAME}'...")
    get_or_update_playlist(final_ids, PLAYLIST_NAME)

    log.info("Saving run to history...")
    runtime = round(time() - start_time, 2)
    save_run(analysis, recent_tracks, top_artists, len(final_ids), runtime)

    log.info(f"=== Done. Log saved to {log_file} ===")


if __name__ == "__main__":
    main()