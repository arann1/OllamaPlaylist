import os
import logging
from datetime import datetime
from time import time

from spotify import (
    get_recently_played,
    get_top_artists,
    get_top_tracks,
    collect_library_from_playlists,
    select_library_tracks,
    get_or_update_playlist,
)
from analyzer import analyze
from tracker import save_run
from config import PLAYLIST_NAME

backend_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(backend_dir)
logs_dir = os.path.join(project_dir, "logs")
os.makedirs(logs_dir, exist_ok=True)
log_file = f"{logs_dir}/run_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(message)s",
    datefmt="%H:%M:%S",
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)


def main():
    start_time = time()

    log.info("=== OllamaPlaylist run started ===")

    log.info("Fetching recently played tracks...")
    recent_tracks = get_recently_played(limit=50)
    recently_played_ids = [t["id"] for t in recent_tracks]
    log.info(f"Got {len(recent_tracks)} recent tracks")

    log.info("Fetching top tracks and artists...")
    top_tracks = get_top_tracks(limit=20, time_range="short_term")
    top_artists = get_top_artists(limit=20, time_range="short_term")
    log.info(f"Got {len(top_tracks)} top tracks, {len(top_artists)} top artists")

    log.info("Building library from your playlists...")
    library_tracks, library_artists, source_playlists = collect_library_from_playlists(
        exclude_name=PLAYLIST_NAME,
    )
    log.info(
        f"Library: {len(library_tracks)} tracks, "
        f"{len(library_artists)} artists from {len(source_playlists)} playlists"
    )

    if not library_tracks:
        log.error("No tracks found in your playlists. Add music to playlists first.")
        return

    log.info("Analyzing taste with Ollama (trained on your library)...")
    analysis = analyze(
        recent_tracks,
        top_artists,
        top_tracks,
        library_tracks,
        library_artists,
        source_playlists,
    )
    log.info(f"Mood: {analysis['mood']}")
    log.info(f"Energy: {analysis['energy_level']}")
    log.info(f"Genres: {', '.join(analysis['genres'])}")
    log.info(f"Taste Profile: {analysis['taste_profile']}")
    log.info(f"Preferred artists: {analysis['preferred_artists']}")
    log.info(f"Summary: {analysis['summary']}")

    log.info("Selecting tracks from your library (no new artists)...")
    final_ids = select_library_tracks(
        library_tracks,
        analysis["preferred_artists"],
        recently_played_ids,
        max_per_artist=1,
        total=30,
    )
    log.info(f"Selected {len(final_ids)} tracks")

    if not final_ids:
        log.warning("No tracks passed filters. Try listening to more music first.")
        return

    log.info(f"Updating playlist '{PLAYLIST_NAME}'...")
    get_or_update_playlist(final_ids, PLAYLIST_NAME)

    # Build curated track details from library lookup (album_art already fetched)
    library_by_id = {t["id"]: t for t in library_tracks}
    curated_details = [library_by_id[tid] for tid in final_ids if tid in library_by_id]

    # Build preferred_artists_detail using images from top_artists where available
    name_to_image = {a["name"]: a.get("image") for a in top_artists}
    preferred_artists_detail = [
        {"name": name, "image": name_to_image.get(name)}
        for name in analysis.get("preferred_artists", [])
    ]

    log.info("Saving run to history...")
    runtime = round(time() - start_time, 2)
    save_run(
        analysis,
        recent_tracks,
        top_artists,
        len(final_ids),
        runtime,
        library_artist_count=len(library_artists),
        source_playlists=source_playlists,
        preferred_artists_detail=preferred_artists_detail,
        curated_tracks_sample=[
            {"name": t["name"], "artist": t["artist"], "album_art": t.get("album_art")}
            for t in curated_details
        ],
    )

    log.info(f"=== Done. Log saved to {log_file} ===")


if __name__ == "__main__":
    main()
