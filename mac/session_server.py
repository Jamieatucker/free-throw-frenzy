#!/usr/bin/env python3
"""Serve the built game, then exit after the last browser tab disconnects.

The launcher injects a small script into index.html. That script holds one
request open per tab. A refresh drops the request and opens a new one, so a
short grace period covers the gap. When the last tab is gone, this process
exits and the Mac app quits with it.
"""
from __future__ import annotations

import os
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

SESSION_PATH = "/__ftf/session"
SESSION_SCRIPT = """<script>
(function () {
  var path = "/__ftf/session";
  var current = null;
  var unloading = false;
  function connect() {
    if (unloading || current) return;
    var xhr = new XMLHttpRequest();
    current = xhr;
    xhr.open("GET", path, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (current === xhr) current = null;
      if (!unloading) setTimeout(connect, 300);
    };
    xhr.send();
  }
  window.addEventListener("pagehide", function () {
    unloading = true;
    if (!current) return;
    var xhr = current;
    current = null;
    xhr.abort();
  });
  window.addEventListener("pageshow", function () {
    unloading = false;
    connect();
  });
  connect();
})();
</script>
"""


class SessionBook:
    """Counts open game tabs and ends the process when none remain."""

    def __init__(self, grace_seconds: float, startup_seconds: float) -> None:
        self.grace_seconds = grace_seconds
        self.startup_seconds = startup_seconds
        self._clients = 0
        self._seen_client = False
        self._timer = None
        self._lock = threading.Lock()

    def arm_startup(self) -> None:
        with self._lock:
            if self._clients == 0:
                self._arm(self.startup_seconds)

    def client_opened(self) -> None:
        with self._lock:
            self._clients += 1
            self._seen_client = True
            if self._timer is not None:
                self._timer.cancel()
                self._timer = None

    def client_closed(self) -> None:
        with self._lock:
            self._clients = max(0, self._clients - 1)
            if self._clients == 0 and self._seen_client:
                self._arm(self.grace_seconds)

    def _arm(self, delay: float) -> None:
        if self._timer is not None:
            self._timer.cancel()
        timer = threading.Timer(delay, self._expire)
        timer.daemon = True
        self._timer = timer
        timer.start()

    def _expire(self) -> None:
        with self._lock:
            if self._clients != 0:
                return
            os._exit(0)


class FrenzyServer(ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True

    def __init__(self, address, handler, sessions: SessionBook) -> None:
        super().__init__(address, handler)
        self.sessions = sessions


def build_handler(directory: str):
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=directory, **kwargs)

        def log_message(self, fmt, *args):
            return

        def do_GET(self):
            path = urlsplit(self.path).path
            if path == SESSION_PATH:
                self._hold_session()
                return
            if path in ("/", "/index.html"):
                self._serve_index()
                return
            super().do_GET()

        def _hold_session(self):
            self.server.sessions.client_opened()
            try:
                self.send_response(200)
                self.send_header("Content-Type", "text/event-stream")
                self.send_header("Cache-Control", "no-store")
                self.send_header("Connection", "keep-alive")
                self.end_headers()
                self.wfile.write(b": connected\n\n")
                self.wfile.flush()
                self.connection.settimeout(None)
                while True:
                    chunk = self.connection.recv(1024)
                    if not chunk:
                        break
            except OSError:
                pass
            finally:
                self.server.sessions.client_closed()

        def _serve_index(self):
            index_path = os.path.join(self.directory, "index.html")
            try:
                with open(index_path, "r", encoding="utf-8") as handle:
                    html = handle.read()
            except OSError:
                self.send_error(404, "index.html is missing")
                return
            if SESSION_PATH not in html:
                if "</head>" in html:
                    html = html.replace("</head>", SESSION_SCRIPT + "</head>", 1)
                else:
                    html = SESSION_SCRIPT + html
            body = html.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)

    return Handler


def serve(port: int, directory: str, grace_seconds: float, startup_seconds: float) -> None:
    if not os.path.isdir(directory):
        print("Game directory does not exist: %s" % directory, file=sys.stderr)
        sys.exit(1)
    sessions = SessionBook(grace_seconds, startup_seconds)
    server = FrenzyServer(("127.0.0.1", port), build_handler(directory), sessions)
    bound = server.server_address[1]
    print("FTF_READY %s" % bound, flush=True)
    sessions.arm_startup()
    try:
        server.serve_forever()
    finally:
        server.server_close()


def main(argv: list) -> None:
    if len(argv) != 3:
        print("usage: session_server.py PORT DIRECTORY", file=sys.stderr)
        sys.exit(2)
    grace = float(os.environ.get("FTF_SESSION_GRACE", "1.5"))
    startup = float(os.environ.get("FTF_SESSION_STARTUP", "60"))
    serve(int(argv[1]), argv[2], grace, startup)


if __name__ == "__main__":
    main(sys.argv)
