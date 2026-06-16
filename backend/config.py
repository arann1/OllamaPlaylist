import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import ollama

load_dotenv()

PLAYLIST_NAME = "OllamaPlaylist"
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://192.168.1.77:11434")
OLLAMA_MODEL = os.getenv(
    "OLLAMA_MODEL",
    "qwen2.5:7b"
)

SPOTIFY_SCOPE = " ".join([
    "user-read-recently-played",
    "user-top-read",
    "playlist-modify-public",
    "playlist-modify-private",
    "playlist-read-private",
])

sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id=os.getenv("SPOTIFY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
    redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
    scope=SPOTIFY_SCOPE,
    open_browser=False,
    cache_path=".spotify_cache",
))

ollama_client = ollama.Client(host=OLLAMA_HOST)