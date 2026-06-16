import json

from config import ollama_client, OLLAMA_MODEL


DEFAULT_ANALYSIS = {
    "mood": "Balanced Indie",
    "energy_level": "medium",

    "genres": [
        "indie",
        "alternative",
        "pop"
    ],

    "taste_profile": [
        "melodic vocals",
        "emotional lyrics",
        "modern production",
        "strong songwriting",
        "indie influences"
    ],

    "search_queries": [
        "indie pop",
        "alternative rock",
        "bedroom pop",
        "dream pop",
        "indie rock",
        "chill indie",
        "wallows similar",
        "the marias",
        "steve lacy",
        "clairo"
    ],

    "summary": "Balanced mix of indie, alternative and modern pop."
}


def build_prompt(tracks, top_artists, top_tracks):
    recent_tracks = "\n".join(
        f"{t['name']} - {t['artist']}"
        for t in tracks[:30]
    )

    artists = "\n".join(
        f"{a['name']} ({', '.join(a['genres']) if a['genres'] else 'unknown'})"
        for a in top_artists[:20]
    )

    top_track_summary = "\n".join(
        f"{t['name']} by {t['artist']}"
        for t in top_tracks[:20]
    )

    return f"""
Analyze this Spotify listener.

RECENT TRACKS:
{recent_tracks}

TOP ARTISTS:
{artists}

TOP TRACKS:
{top_track_summary}

Return ONLY valid JSON.

Required schema:

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

    "search_queries": [
        "query1",
        "query2",
        "query3",
        "query4",
        "query5",
        "query6",
        "query7",
        "query8",
        "query9",
        "query10"
    ],

    "summary": "one sentence summary"
}}

Rules:

- energy_level must be exactly one of: low, medium, high

- genres must contain exactly 3 items

- taste_profile must contain EXACTLY 5 items

- search_queries must contain EXACTLY 10 items

- taste_profile should describe WHY the user likes music

Examples:
emotional lyrics
dreamy production
guitar driven
bedroom pop aesthetics
melodic vocals
coming of age themes

- search_queries should be discovery-oriented

- use recently played tracks
- use top artists
- use top tracks

- avoid generic queries like:
  music
  songs
  tracks
  hits
  tunes

- Return ONLY valid JSON
"""


def validate(data):
    if not isinstance(data, dict):
        raise ValueError("Response is not a JSON object")

    data.setdefault("mood", DEFAULT_ANALYSIS["mood"])
    data.setdefault("energy_level", DEFAULT_ANALYSIS["energy_level"])
    data.setdefault("genres", DEFAULT_ANALYSIS["genres"])

    data.setdefault(
        "taste_profile",
        DEFAULT_ANALYSIS["taste_profile"]
    )

    data.setdefault(
        "search_queries",
        DEFAULT_ANALYSIS["search_queries"]
    )

    data.setdefault(
        "summary",
        DEFAULT_ANALYSIS["summary"]
    )

    if data["energy_level"] not in ["low", "medium", "high"]:
        data["energy_level"] = "medium"

    if not isinstance(data["genres"], list):
        data["genres"] = DEFAULT_ANALYSIS["genres"]

    if not isinstance(data["taste_profile"], list):
        data["taste_profile"] = DEFAULT_ANALYSIS["taste_profile"]

    if not isinstance(data["search_queries"], list):
        data["search_queries"] = DEFAULT_ANALYSIS["search_queries"]

    data["genres"] = data["genres"][:3]

    if len(data["genres"]) < 3:
        missing = 3 - len(data["genres"])
        data["genres"].extend(
            DEFAULT_ANALYSIS["genres"][:missing]
        )

    data["taste_profile"] = data["taste_profile"][:5]

    if len(data["taste_profile"]) < 5:
        missing = 5 - len(data["taste_profile"])
        data["taste_profile"].extend(
            DEFAULT_ANALYSIS["taste_profile"][:missing]
        )

    data["search_queries"] = data["search_queries"][:10]

    if len(data["search_queries"]) < 10:
        missing = 10 - len(data["search_queries"])
        data["search_queries"].extend(
            DEFAULT_ANALYSIS["search_queries"][:missing]
        )

    return data


def analyze(
    tracks,
    top_artists,
    top_tracks
):
    prompt = build_prompt(
        tracks,
        top_artists,
        top_tracks
    )

    print(f"Sending to Ollama ({OLLAMA_MODEL})...")

    try:
        response = ollama_client.chat(
            model=OLLAMA_MODEL,
            format="json",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        raw = response["message"]["content"]

        print("\n=== RAW OLLAMA RESPONSE ===")
        print(raw)
        print("===========================\n")

        data = json.loads(raw)

        return validate(data)

    except Exception as e:
        print(f"Ollama failed: {e}")
        print("Using fallback analysis.")

        return DEFAULT_ANALYSIS.copy()