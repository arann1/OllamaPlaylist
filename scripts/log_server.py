#!/usr/bin/env python3
from http.server import HTTPServer, BaseHTTPRequestHandler

LOG = '/home/aran/Desktop/Storage/OllamaPlaylist/logs/live.log'

def latest_run():
    try:
        with open(LOG, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        marker = '=== OllamaPlaylist cron run'
        idx = content.rfind(marker)
        return content[idx:] if idx >= 0 else content
    except FileNotFoundError:
        return 'No log yet.'

class H(BaseHTTPRequestHandler):
    def do_GET(self):
        body = latest_run().encode()
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *a): pass

HTTPServer(('0.0.0.0', 8765), H).serve_forever()
