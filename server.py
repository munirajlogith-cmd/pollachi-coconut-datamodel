"""
Pollachi Coconut Information System - Python Backend Runner
Provides identical RESTful endpoints as server.js.
"""

import http.server
import socketserver
import json
import os
import urllib.request
import urllib.parse
from datetime import datetime

PORT = int(os.environ.get('PORT', 5000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'data', 'pollachi_datasets.json')
CSV_FILE = os.path.join(BASE_DIR, 'data', 'pollachi_datasets.csv')

VALID_USERS = [
    {"username": "student", "password": "student123", "name": "Student", "role": "student"},
    {"username": "admin", "password": "admin123", "name": "Student", "role": "student"},
    {"username": "user", "password": "user123", "name": "Student", "role": "student"}
]

class DynamicHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def send_json(self, status, payload):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/auth/status':
            auth_header = self.headers.get('Authorization', '')
            token = auth_header.replace('Bearer ', '')
            if 'student' in token or 'token' in token:
                return self.send_json(200, {"authenticated": True, "role": "student", "username": "student", "name": "Student"})
            return self.send_json(200, {"authenticated": False})

        if path == '/api/coconut/data':
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                return self.send_json(200, {"success": True, "data": data})
            return self.send_json(404, {"success": False, "message": "Dataset not found"})

        if path == '/api/weather/live':
            try:
                url = "https://api.open-meteo.com/v1/forecast?latitude=10.6586&longitude=77.0084&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto"
                req = urllib.request.Request(url, headers={'User-Agent': 'PollachiDataPortal/1.0'})
                with urllib.request.urlopen(req, timeout=3) as resp:
                    return self.send_json(200, json.loads(resp.read().decode('utf-8')))
            except Exception:
                return self.send_json(200, {
                    "current": {"temperature_2m": 29.0, "relative_humidity_2m": 68, "wind_speed_10m": 12.0, "precipitation": 0.0, "weather_code": 2}
                })

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode('utf-8')
        try:
            payload = json.loads(body) if body else {}
        except Exception:
            payload = {}

        if path == '/api/auth/login':
            username = (payload.get('username') or '').strip().lower()
            password = payload.get('password') or ''
            matched = next((u for u in VALID_USERS if u['username'] == username and u['password'] == password), None)
            if matched:
                token = f"token-{matched['role']}-{int(datetime.now().timestamp())}"
                return self.send_json(200, {
                    "success": True,
                    "message": "Authentication successful",
                    "token": token,
                    "user": {"username": matched['username'], "name": matched['name'], "role": matched['role']}
                })
            return self.send_json(401, {"success": False, "message": "Invalid User ID or Password."})

        if path == '/api/coconut/update':
            try:
                with open(DATA_FILE, 'w', encoding='utf-8') as f:
                    json.dump(payload, f, indent=2)
                return self.send_json(200, {"success": True, "message": "Records successfully updated on disk.", "data": payload})
            except Exception as e:
                return self.send_json(500, {"success": False, "message": str(e)})

        self.send_json(404, {"success": False, "message": "Endpoint not found"})

if __name__ == '__main__':
    os.chdir(BASE_DIR)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), DynamicHandler) as httpd:
        print(f"Pollachi Coconut Information System running on http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
