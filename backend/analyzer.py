import json
import logging
import time

from config import OLLAMA_HOST, OLLAMA_MODEL, get_ollama

log = logging.getLogger(__name__)

DEFAULT_ANALYSIS = {
    "mood": "Balanced Indie",
    "energy_level": "medium",
    "genres": ["indie", "alternative", "pop"],
    "taste_profile": [
        "melodic vocals",
        "emotional lyrics",
        "modern production",
        "strong songwriting",
        "indie influences",
    ],
    "preferred_artists": [],
    "summary": "Balanced mix drawn from your existing library.",
}


def build_prompt(
    tracks,
    top_artists,
    top_tracks,
    library_tracks,
    library_artists,
    source_playlists,
):
    recent_tracks = "\n".join(
        f"{t['name']} - {t['artist']}" for t in tracks[:30]
    )

    artists = "\n".join(
        f"{a['name']} ({', '.join(a['genres']) if a['genres'] else 'unknown'})"
        for a in top_artists[:20]
    )

    top_track_summary = "\n".join(
        f"{t['name']} by {t['artist']}" for t in top_tracks[:20]
    )

    playlist_sample = "\n".join(
        f"{t['name']} - {t['artist']}" for t in library_tracks[:60]
    )

    known_artists = "\n".join(
        f"{a['name']} ({a['count']} tracks in library)"
        for a in library_artists[:40]
    )

    playlists = ", ".join(source_playlists[:10]) if source_playlists else "none"

    return f"""
Analyze this Spotify listener using ONLY the data below.

RECENTLY PLAYED:
{recent_tracks}

TOP ARTISTS (last 4 weeks):
{artists}

TOP TRACKS (last 4 weeks):
{top_track_summary}

TRACKS FROM USER'S PLAYLISTS ({playlists}):
{playlist_sample}

KNOWN ARTISTS IN USER'S LIBRARY (you may ONLY pick from this list):
{known_artists}

Return ONLY valid JSON with this schema:

{{
    "mood": "2-3 word mood description",
    "energy_level": "medium",
    "genres": ["genre1", "genre2", "genre3"],
    "taste_profile": [
        "descriptor1",
        "descriptor2",
        "descriptor3",
        "descriptor4",
        "descriptor5"
    ],
    "preferred_artists": [
        "artist1",
        "artist2",
        "artist3",
        "artist4",
        "artist5",
        "artist6",
        "artist7",
        "artist8",
        "artist9",
        "artist10"
    ],
    "summary": "one sentence summary"
}}

Rules:
- energy_level must be exactly one of: low, medium, high
- genres must contain exactly 3 items
- taste_profile must contain EXACTLY 5 items
- preferred_artists must contain EXACTLY 10 items
- preferred_artists MUST be copied verbatim from KNOWN ARTISTS IN USER'S LIBRARY
- Do NOT suggest new or unknown artists — only names from the library list
- Base taste_profile on patterns across recently played, top tracks, and playlist data
- Return ONLY valid JSON
"""


def validate(data, library_artists):
    if not isinstance(data, dict):
        raise ValueError("Response is not a JSON object")

    for key, default in DEFAULT_ANALYSIS.items():
        data.setdefault(key, default if not isinstance(default, list) else default.copy())

    if data["energy_level"] not in ("low", "medium", "high"):
        data["energy_level"] = "medium"

    for field in ("genres", "taste_profile", "preferred_artists"):
        if not isinstance(data[field], list):
            data[field] = DEFAULT_ANALYSIS[field]

    data["genres"] = data["genres"][:3]
    while len(data["genres"]) < 3:
        data["genres"].append(DEFAULT_ANALYSIS["genres"][len(data["genres"])])

    data["taste_profile"] = data["taste_profile"][:5]
    while len(data["taste_profile"]) < 5:
        data["taste_profile"].append(
            DEFAULT_ANALYSIS["taste_profile"][len(data["taste_profile"])]
        )

    known_names = [a["name"] for a in library_artists]
    validated_artists = []

    for artist in data["preferred_artists"]:
        if not isinstance(artist, str):
            continue
        match = next(
            (name for name in known_names if name.lower() == artist.lower()),
            None,
        )
        if match and match not in validated_artists:
            validated_artists.append(match)

    for artist in known_names:
        if len(validated_artists) >= 10:
            break
        if artist not in validated_artists:
            validated_artists.append(artist)

    data["preferred_artists"] = validated_artists[:10]
    return data


def _log_ollama_stats(response, elapsed):
    """Log token/timing stats that mirror what Ollama writes to journalctl."""
    prompt_tokens = response.get("prompt_eval_count")
    output_tokens = response.get("eval_count")
    load_ms = response.get("load_duration", 0) / 1_000_000
    prompt_ms = response.get("prompt_eval_duration", 0) / 1_000_000
    eval_ms = response.get("eval_duration", 0) / 1_000_000

    log.info(
        "Ollama finished in %.1fs | load=%.0fms prompt=%.0fms eval=%.0fms | "
        "tokens in=%s out=%s",
        elapsed,
        load_ms,
        prompt_ms,
        eval_ms,
        prompt_tokens if prompt_tokens is not None else "?",
        output_tokens if output_tokens is not None else "?",
    )


def analyze(
    tracks,
    top_artists,
    top_tracks,
    library_tracks,
    library_artists,
    source_playlists,
):
    prompt = build_prompt(
        tracks,
        top_artists,
        top_tracks,
        library_tracks,
        library_artists,
        source_playlists,
    )

    log.info(
        "Ollama request -> host=%s model=%s | recent=%d library=%d artists=%d playlists=%d prompt_chars=%d",
        OLLAMA_HOST,
        OLLAMA_MODEL,
        len(tracks),
        len(library_tracks),
        len(library_artists),
        len(source_playlists),
        len(prompt),
    )

    try:
        started = time.time()
        response = get_ollama().chat(
            model=OLLAMA_MODEL,
            format="json",
            messages=[{"role": "user", "content": prompt}],
            options={"temperature": 0.4},
        )
        elapsed = time.time() - started

        raw = response["message"]["content"]
        _log_ollama_stats(response, elapsed)

        data = json.loads(raw)
        log.info(
            "Ollama result mood=%r energy=%r genres=%s",
            data.get("mood"),
            data.get("energy_level"),
            ", ".join(data.get("genres", [])),
        )
        return validate(data, library_artists)

    except Exception as e:
        log.error("Ollama failed after request: %s", e)
        log.warning("Using fallback analysis from library artists.")

        fallback = DEFAULT_ANALYSIS.copy()
        fallback["preferred_artists"] = [a["name"] for a in library_artists[:10]]
        return validate(fallback, library_artists)
