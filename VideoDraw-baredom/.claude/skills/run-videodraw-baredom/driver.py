#!/usr/bin/env python3
"""
Driver for VideoDraw-baredom: serves the static site, drives it with a
real (headless) Chromium via Playwright, and exercises the UI end to end,
including the camera-facing <select> — using Chromium's fake video device
so getUserMedia() resolves without a real camera or a permission prompt.

Usage:
  .venv/bin/python driver.py smoke        # full flow, screenshots + console check
  .venv/bin/python driver.py shot <name>  # just navigate + screenshot to screenshots/<name>.png
"""
import http.server
import functools
import socket
import sys
import threading
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

UNIT_DIR = Path(__file__).resolve().parents[3]  # VideoDraw-baredom/
SHOT_DIR = Path(__file__).resolve().parent / "screenshots"
SHOT_DIR.mkdir(exist_ok=True)

FAKE_CAMERA_ARGS = [
    "--use-fake-device-for-media-stream",
    "--use-fake-ui-for-media-stream",  # auto-accept the getUserMedia permission prompt
]


def free_port():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    port = s.getsockname()[1]
    s.close()
    return port


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass


def start_server():
    port = free_port()
    handler = functools.partial(QuietHandler, directory=str(UNIT_DIR))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd, f"http://127.0.0.1:{port}/index.html"


def smoke():
    httpd, url = start_server()
    console_errors = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(args=FAKE_CAMERA_ARGS)
            page = browser.new_page(viewport={"width": 900, "height": 700})
            page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: console_errors.append(f"pageerror: {e}"))

            page.goto(url)
            # 3 canvases exist: the visible main canvas (#defaultCanvas1, createCanvas())
            # plus 2 offscreen createGraphics() layers with the same p5Canvas class.
            main_canvas = page.locator("#defaultCanvas1")
            main_canvas.wait_for()
            page.wait_for_selector("select")  # controlsDiv selects
            time.sleep(1.5)  # let getUserMedia resolve and first video frame render
            page.screenshot(path=str(SHOT_DIR / "01-loaded.png"))
            print("loaded:", url)

            # camera select is the first <select> created in create_selections()... wait,
            # actually the shape select is first; camera select is second. Select by option text.
            camera_select = page.locator("select").filter(has=page.locator("option[value=environment]"))
            assert camera_select.count() == 1, "camera facing <select> not found"
            camera_select.select_option("environment")
            time.sleep(1.0)  # create_capture() re-requests getUserMedia
            page.screenshot(path=str(SHOT_DIR / "02-back-camera.png"))
            print("switched to back camera")

            camera_select.select_option("user")
            time.sleep(1.0)
            page.screenshot(path=str(SHOT_DIR / "03-front-camera.png"))
            print("switched back to front camera")

            # exercise a draw stroke on the canvas
            box = main_canvas.bounding_box()
            cx, cy = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
            page.mouse.move(cx, cy)
            page.mouse.down()
            page.mouse.move(cx + 80, cy + 40, steps=10)
            page.mouse.up()
            page.screenshot(path=str(SHOT_DIR / "04-after-draw.png"))
            print("drew a stroke")

            browser.close()
    finally:
        httpd.shutdown()

    real_errors = [e for e in console_errors if "webcam" not in e.lower()]
    print(f"console errors: {len(console_errors)} (ignoring expected fake-camera warnings)")
    for e in console_errors:
        print("  ", e)
    if real_errors and any("NotFoundError" not in e and "getUserMedia" not in e for e in real_errors):
        print("FAIL: unexpected console errors")
        sys.exit(1)
    print("OK")


def shot(name):
    httpd, url = start_server()
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(args=FAKE_CAMERA_ARGS)
            page = browser.new_page(viewport={"width": 900, "height": 700})
            page.goto(url)
            page.wait_for_selector("canvas")
            time.sleep(1.5)
            page.screenshot(path=str(SHOT_DIR / f"{name}.png"))
            browser.close()
    finally:
        httpd.shutdown()


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "smoke"
    if cmd == "smoke":
        smoke()
    elif cmd == "shot":
        shot(sys.argv[2] if len(sys.argv) > 2 else "shot")
    else:
        print(__doc__)
        sys.exit(1)
