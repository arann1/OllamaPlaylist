import logging

from spotipy.exceptions import SpotifyException

from config import get_sp, PLAYLIST_NAME

log = logging.getLogger(__name__)

_user_market = None


def get_recently_played(limit=50):
    """Fetch recently played tracks and return as list with ids for filtering."""
    sp = get_sp()
    results = sp.current_user_recently_played(limit=limit)
    tracks = []
    for item in results["items"]:
        track = item["track"]
        tracks.append({
            "name": track["name"],
            "artist": track["artists"][0]["name"],
            "id": track["id"],
        })
    return tracks


def get_top_artists(limit=20, time_range="short_term"):
    """Fetch user's top artists over a time window."""
    sp = get_sp()
    results = sp.current_user_top_artists(limit=limit, time_range=time_range)
    artists = []
    for item in results["items"]:
        artists.append({
            "name": item["name"],
            "genres": item.get("genres", []),
        })
    return artists


def get_top_tracks(limit=20, time_range="short_term"):
    """Fetch user's top tracks."""
    sp = get_sp()
    results = sp.current_user_top_tracks(limit=limit, time_range=time_range)
    tracks = []
    for item in results["items"]:
        tracks.append({
            "name": item["name"],
            "artist": item["artists"][0]["name"],
        })
    return tracks


def _get_user_market():
    """Return the user's country code for market-aware playlist requests."""
    global _user_market
    if _user_market is None:
        try:
            _user_market = get_sp().current_user().get("country")
        except Exception:
            _user_market = False
    return _user_market or None


def get_user_playlists(limit=50):
    """Fetch the user's playlists."""
    sp = get_sp()
    results = sp.current_user_playlists(limit=limit)
    playlists = []
    for p in results["items"]:
        track_count = (p.get("tracks") or {}).get("total", -1)
        owner = p.get("owner") or {}
        playlists.append({
            "id": p["id"],
            "name": p["name"],
            "track_count": track_count,
            "owner_id": owner.get("id"),
        })
    return playlists


def _playlist_item_track(item):
    """Extract a track object from a playlist item (handles API format changes)."""
    track = item.get("track") or item.get("item")
    if not track or track.get("type") != "track":
        return None
    if track.get("is_local") or item.get("is_local") or not track.get("id"):
        return None
    return track


def get_playlist_tracks(playlist_id, max_tracks=150, market=None):
    """Fetch tracks from a playlist with pagination."""
    sp = get_sp()
    if market is None:
        market = _get_user_market()
    tracks = []
    offset = 0

    while len(tracks) < max_tracks:
        batch = sp.playlist_tracks(
            playlist_id,
            offset=offset,
            limit=100,
            market=market,
        )
        items = batch["items"]
        if not items:
            break

        for item in items:
            track = _playlist_item_track(item)
            if not track:
                continue
            tracks.append({
                "id": track["id"],
                "name": track["name"],
                "artist": track["artists"][0]["name"],
            })
            if len(tracks) >= max_tracks:
                break

        if not batch.get("next"):
            break
        offset += len(items)

    return tracks


def collect_library_from_playlists(
    exclude_name=None,
    max_playlists=15,
    max_tracks_per_playlist=150,
):
    """
    Build a track pool and artist index from the user's own playlists.
    Only includes tracks already in the user's library — no discovery.
    """
    exclude_name = exclude_name or PLAYLIST_NAME
    playlists = get_user_playlists(limit=50)

    try:
        user_id = get_sp().current_user()["id"]
    except Exception:
        user_id = None

    eligible = [
        p for p in playlists
        if p["name"] != exclude_name and p["track_count"] != 0
    ]
    owned = [p for p in eligible if user_id and p.get("owner_id") == user_id]
    active = owned[:max_playlists]

    if not active:
        log.warning("No owned playlists found — skipping followed playlists to avoid 403 errors")

    all_tracks = []
    artist_counts = {}
    seen_ids = set()
    used_playlists = []

    for playlist in active:
        try:
            playlist_tracks = get_playlist_tracks(
                playlist["id"],
                max_tracks=max_tracks_per_playlist,
            )
        except SpotifyException as exc:
            if exc.http_status == 403:
                log.warning(
                    "Skipping playlist %r — not readable via API (403)",
                    playlist["name"],
                )
                continue
            raise

        if not playlist_tracks:
            continue

        used_playlists.append(playlist)
        for track in playlist_tracks:
            if track["id"] in seen_ids:
                continue
            seen_ids.add(track["id"])
            all_tracks.append(track)
            artist = track["artist"]
            artist_counts[artist] = artist_counts.get(artist, 0) + 1

    library_artists = sorted(
        [{"name": name, "count": count} for name, count in artist_counts.items()],
        key=lambda a: a["count"],
        reverse=True,
    )

    return all_tracks, library_artists, [p["name"] for p in used_playlists]


def _normalize(text):
    return text.lower().strip()


def _artist_matches(track_artist, preferred_artist):
    track = _normalize(track_artist)
    pref = _normalize(preferred_artist)
    return pref in track or track in pref


def select_library_tracks(
    library_tracks,
    preferred_artists,
    recently_played_ids,
    max_per_artist=1,
    total=30,
):
    """
    Pick tracks from the user's library pool, prioritizing Ollama's
    preferred artists. Never pulls from outside the provided pool.
    """
    seen_ids = set(recently_played_ids)
    artist_count = {}
    final_ids = []

    def rank(track):
        for i, artist in enumerate(preferred_artists):
            if _artist_matches(track["artist"], artist):
                return i
        return len(preferred_artists)

    ranked = sorted(library_tracks, key=rank)

    for track in ranked:
        tid = track["id"]
        artist = track["artist"]

        if tid in seen_ids:
            continue
        if artist_count.get(artist, 0) >= max_per_artist:
            continue

        seen_ids.add(tid)
        artist_count[artist] = artist_count.get(artist, 0) + 1
        final_ids.append(tid)

        if len(final_ids) >= total:
            break

    return final_ids


def get_or_update_playlist(track_ids, playlist_name):
    """Find playlist by name and replace its tracks."""
    sp = get_sp()
    playlists = sp.current_user_playlists(limit=50)

    playlist_id = None
    for p in playlists["items"]:
        if p["name"] == playlist_name:
            playlist_id = p["id"]
            break

    if not playlist_id:
        print(f"Playlist '{playlist_name}' not found. Create it manually in Spotify first.")
        return None

    sp.playlist_replace_items(playlist_id, track_ids)
    print(f"Updated '{playlist_name}' with {len(track_ids)} tracks.")
    return playlist_id
