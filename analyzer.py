import json

from config import ollama_client, OLLAMA_MODEL


DEFAULT_ANALYSIS = {
    "mood": "Balanced Indie",
    "energy_level": "medium",
    "genres": ["indie", "alternative", "pop"],
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


def build_prompt(tracks, top_artists):
    recent_tracks = "\n".join(
        f"{t['name']} - {t['artist']}"
        for t in tracks[:30]
    )

    artists = "\n".join(
        f"{a['name']} ({', '.join(a['genres']) if a['genres'] else 'unknown'})"
        for a in top_artists[:20]
    )

    return f"""
Analyze this Spotify listener.

RECENT TRACKS:
{recent_tracks}

TOP ARTISTS:
{artists}

Return ONLY valid JSON.

Required schema:

{{
  "mood": "string",
  "energy_level": "low|medium|high",
  "genres": ["genre1","genre2","genre3"],
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
  "summary": "string"
}}

Rules:
- EXACTLY 10 search_queries
- EXACTLY 3 genres
- energy_level must be low, medium, or high
- JSON only
"""


def validate(data):
    if not isinstance(data, dict):
        raise ValueError("Response is not a JSON object")

    data.setdefault("mood", DEFAULT_ANALYSIS["mood"])
    data.setdefault("energy_level", "medium")
    data.setdefault("genres", DEFAULT_ANALYSIS["genres"])
    data.setdefault("search_queries", DEFAULT_ANALYSIS["search_queries"])
    data.setdefault("summary", DEFAULT_ANALYSIS["summary"])

    if data["energy_level"] not in ["low", "medium", "high"]:
        data["energy_level"] = "medium"

    if not isinstance(data["genres"], list):
        data["genres"] = DEFAULT_ANALYSIS["genres"]

    if not isinstance(data["search_queries"], list):
        data["search_queries"] = DEFAULT_ANALYSIS["search_queries"]

    data["genres"] = data["genres"][:3]

    if len(data["search_queries"]) < 10:
        missing = 10 - len(data["search_queries"])
        data["search_queries"].extend(
            DEFAULT_ANALYSIS["search_queries"][:missing]
        )

    data["search_queries"] = data["search_queries"][:10]

    return data


def analyze(tracks, top_artists):
    prompt = build_prompt(tracks, top_artists)

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