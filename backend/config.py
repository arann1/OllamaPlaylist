import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import ollama

load_dotenv()

PLAYLIST_NAME = os.getenv("PLAYLIST_NAME", "OllamaPlaylist")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:7b")

SPOTIFY_SCOPE = " ".join([
    "user-read-recently-played",
    "user-top-read",
    "playlist-modify-public",
    "playlist-modify-private",
    "playlist-read-private",
])

_sp = None
_ollama_client = None


def get_sp():
    global _sp
    if _sp is None:
        _sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
            client_id=os.getenv("SPOTIFY_CLIENT_ID"),
            client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
            redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
            scope=SPOTIFY_SCOPE,
            open_browser=True,
            cache_path=".spotify_cache",
        ))
    return _sp


def get_ollama():
    global _ollama_client
    if _ollama_client is None:
        _ollama_client = ollama.Client(host=OLLAMA_HOST)
    return _ollama_client
