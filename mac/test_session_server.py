"""Session server exits when the last game tab disconnects."""
import os
import socket
import subprocess
import sys
import tempfile
import time
import unittest
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SERVER = os.path.join(ROOT, "mac", "session_server.py")


def free_port():
    probe = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    probe.bind(("127.0.0.1", 0))
    port = probe.getsockname()[1]
    probe.close()
    return port


def wait_until(predicate, timeout):
    deadline = time.time() + timeout
    while time.time() < deadline:
        if predicate():
            return True
        time.sleep(0.05)
    return predicate()


class SessionServerTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = self.tmp.name
        with open(os.path.join(self.root, "index.html"), "w", encoding="utf-8") as handle:
            handle.write("<html><head><title>Game</title></head><body>Play</body></html>")
        with open(os.path.join(self.root, "app.js"), "w", encoding="utf-8") as handle:
            handle.write("var x = 1;\n")
        self.port = free_port()
        env = os.environ.copy()
        env["FTF_SESSION_GRACE"] = "0.4"
        env["FTF_SESSION_STARTUP"] = "8"
        self.proc = subprocess.Popen(
            [sys.executable, SERVER, str(self.port), self.root],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env,
            text=True,
        )
        ready = self.proc.stdout.readline()
        if not ready.startswith("FTF_READY"):
            self.fail("server did not start: %s %s" % (ready, self.proc.stderr.read()))

    def tearDown(self):
        if self.proc.poll() is None:
            self.proc.kill()
        self.proc.wait(timeout=3)
        self.proc.stdout.close()
        self.proc.stderr.close()
        self.tmp.cleanup()

    def open_session(self):
        sock = socket.create_connection(("127.0.0.1", self.port), timeout=2)
        sock.sendall(
            b"GET /__ftf/session HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: keep-alive\r\n\r\n"
        )
        sock.settimeout(2)
        data = b""
        while b"\r\n\r\n" not in data:
            chunk = sock.recv(1024)
            if not chunk:
                break
            data += chunk
        self.assertIn(b"200", data.split(b"\r\n", 1)[0])
        return sock

    def test_index_includes_session_script_and_assets_stay_intact(self):
        html = urllib.request.urlopen("http://127.0.0.1:%s/" % self.port, timeout=2).read().decode("utf-8")
        self.assertIn("/__ftf/session", html)
        self.assertIn("Play", html)
        script = urllib.request.urlopen("http://127.0.0.1:%s/app.js" % self.port, timeout=2).read()
        self.assertEqual(script, b"var x = 1;\n")

    def test_exits_after_the_only_tab_closes(self):
        sock = self.open_session()
        self.assertIsNone(self.proc.poll())
        sock.close()
        self.assertTrue(wait_until(lambda: self.proc.poll() is not None, 4))
        self.assertEqual(self.proc.returncode, 0)

    def test_stays_up_while_another_tab_is_open(self):
        first = self.open_session()
        second = self.open_session()
        first.close()
        time.sleep(0.9)
        self.assertIsNone(self.proc.poll())
        second.close()
        self.assertTrue(wait_until(lambda: self.proc.poll() is not None, 4))

    def test_reconnect_during_grace_keeps_the_server(self):
        sock = self.open_session()
        sock.close()
        time.sleep(0.1)
        replacement = self.open_session()
        time.sleep(0.8)
        self.assertIsNone(self.proc.poll())
        replacement.close()
        self.assertTrue(wait_until(lambda: self.proc.poll() is not None, 4))

    def test_exits_when_nobody_opens_the_game(self):
        self.proc.kill()
        self.proc.wait(timeout=3)
        self.proc.stdout.close()
        self.proc.stderr.close()
        env = os.environ.copy()
        env["FTF_SESSION_STARTUP"] = "0.4"
        env["FTF_SESSION_GRACE"] = "5"
        port = free_port()
        proc = subprocess.Popen(
            [sys.executable, SERVER, str(port), self.root],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env,
            text=True,
        )
        self.proc = proc
        ready = proc.stdout.readline()
        self.assertTrue(ready.startswith("FTF_READY"))
        self.assertTrue(wait_until(lambda: proc.poll() is not None, 3))
        self.assertEqual(proc.returncode, 0)


if __name__ == "__main__":
    unittest.main()
