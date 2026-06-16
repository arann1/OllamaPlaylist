from config import sp


def get_recently_played(limit=50):
    """Fetch recently played tracks and return as list with ids for filtering."""
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
    """
    Fetch user's top artists over a time window.
    short_term = last 4 weeks, medium_term = 6 months, long_term = all time
    """
    results = sp.current_user_top_artists(limit=limit, time_range=time_range)
    artists = []
    for item in results["items"]:
        artists.append({
            "name": item["name"],
            "genres": item.get("genres", []),
        })
    return artists


def search_tracks(queries, limit_per_query=6):
    """Search Spotify for tracks matching each query."""
    track_ids = []
    for query in queries:
        results = sp.search(q=query, type="track", limit=limit_per_query)
        for track in results["tracks"]["items"]:
            track_ids.append({
                "id": track["id"],
                "artist": track["artists"][0]["name"],
                "name": track["name"],
            })
    return track_ids


def filter_tracks(candidates, recently_played_ids, max_per_artist=1, total=30):
    """
    Remove recently played tracks and cap songs per artist.
    Returns a clean list of track ids.
    """
    seen_ids = set(recently_played_ids)
    artist_count = {}
    final_ids = []

    for track in candidates:
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

def search_artist_tracks(artists, limit_per_artist=10):
    tracks = []

    for artist in artists:
        results = sp.search(
            q=f"artist:{artist}",
            type="track",
            limit=limit_per_artist
        )

        for track in results["tracks"]["items"]:
            tracks.append({
                "id": track["id"],
                "artist": track["artists"][0]["name"],
                "name": track["name"]
            })

    return tracks

def get_top_tracks(limit=20, time_range="short_term"):
    """
    Fetch user's top tracks.
    short_term = last 4 weeks
    medium_term = 6 months
    long_term = all time
    """
    results = sp.current_user_top_tracks(
        limit=limit,
        time_range=time_range
    )

    tracks = []

    for item in results["items"]:
        tracks.append({
            "name": item["name"],
            "artist": item["artists"][0]["name"]
        })

    return tracks


def get_or_update_playlist(track_ids, playlist_name):
    """Find playlist by name and replace its tracks."""
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