---
name: run-videodraw-baredom
description: Build, run, and drive VideoDraw-baredom (the p5.js camera-scanning drawing sketch). Use when asked to start VideoDraw-baredom, screenshot its UI, or verify a change (camera facing select, shape/pixel/brush selects, drawing) actually works end to end.
---

VideoDraw-baredom is a static p5.js + BareDOM sketch (no build step, no
`package.json`) that reads a webcam feed via `createCapture()` and
scans it into pixel art. Drive it with the Playwright driver at
`.claude/skills/run-videodraw-baredom/driver.py`: it serves the folder
over plain HTTP, launches headless Chromium with a **fake video
device** (so `getUserMedia()` resolves with a synthetic animated test
pattern — no real camera, no permission prompt needed), and exercises
the UI.

All paths below are relative to `VideoDraw-baredom/`.

## Prerequisites

Real macOS/Linux + Python 3. No `node`/`npm` needed — this project has
none, and the driver uses Python's `playwright`, not `chromium-cli`
(unavailable in this environment).

## Setup (one-time)

```bash
cd .claude/skills/run-videodraw-baredom
python3 -m venv .venv
./.venv/bin/pip install --quiet playwright
./.venv/bin/python -m playwright install chromium   # ~270MB download, cached in ~/Library/Caches/ms-playwright
```

No `--break-system-packages` needed — the venv keeps this off the
system/Homebrew Python (which is externally-managed and will refuse a
bare `pip install`).

## Run (agent path)

```bash
cd .claude/skills/run-videodraw-baredom
./.venv/bin/python driver.py smoke
```

This: starts a `ThreadingHTTPServer` on a free port serving
`VideoDraw-baredom/`, launches Chromium with
`--use-fake-device-for-media-stream --use-fake-ui-for-media-stream`,
loads `index.html`, waits for `#defaultCanvas1` (the visible main
canvas — 2 more `<canvas>` elements exist from offscreen
`createGraphics()` layers, so don't use a bare `canvas` selector, it's
ambiguous), then:

1. screenshots the loaded page
2. switches the camera-facing `<select>` to `environment` (Back),
   re-screenshots — the fake device's animated pattern shifts,
   confirming `create_capture()` actually re-requested the stream
3. switches back to `user` (Front), re-screenshots
4. drags a stroke across the canvas, re-screenshots
5. prints any browser console errors and exits non-zero if any are
   unexpected

Screenshots land in `screenshots/01-loaded.png` .. `04-after-draw.png`
(overwritten each run). Expected output ends with `OK`.

```bash
./.venv/bin/python driver.py shot my-shot-name   # just load + screenshot, no interaction
```

## Run (human path)

```bash
python3 -m http.server 8934   # from VideoDraw-baredom/
open http://localhost:8934/index.html
```

Real camera + real permission prompt. Useful for actually checking the
front/back camera picker on a phone or laptop with two cameras — the
fake-device driver above proves the *code path* works, not that a real
back camera looks right.

## Test

No test suite — this project has none.

---

## Gotchas

- **`Path(__file__).resolve().parents[N]` off-by-one**: the driver
  lives 3 levels under the unit root
  (`VideoDraw-baredom/.claude/skills/run-videodraw-baredom/driver.py`),
  so getting from the driver to `VideoDraw-baredom/` needs
  `parents[3]`, not `parents[2]`. Got this wrong on the first pass —
  server silently served `.claude/` instead, `index.html` 404'd, and
  every selector wait timed out at 30s with a confusing "canvas never
  appeared" error and no obvious cause in the logs.
- **`page.locator("canvas")` is ambiguous** — p5's `createGraphics()`
  layers (`my.layer`, `my.drawLayer`) create additional `<canvas
  class="p5Canvas">` elements alongside the real, visible
  `#defaultCanvas1`. Playwright's strict mode throws
  ("resolved to 3 elements") on any canvas-wide selector used with
  `.bounding_box()` or `.click()`. Always target `#defaultCanvas1`.
- **System Python refuses `pip install`** (PEP 668,
  "externally-managed-environment") — Homebrew's Python blocks bare
  `pip install` outside a venv. Don't reach for
  `--break-system-packages`; just use the `.venv` in Setup.
- **Chrome's AppleScript `execute javascript` doesn't work
  out of the box** — even with a real, already-running Google
  Chrome.app on this machine, driving it via `osascript` fails with
  "Executing JavaScript through AppleScript is turned off" unless a
  human has toggled View > Developer > Allow JavaScript from Apple
  Events at least once. Not scriptable without that manual step, which
  is why this driver uses Playwright's own bundled Chromium instead of
  the system browser.
- **Canvas2D `willReadFrequently` warnings are expected noise** — the
  app calls `img.get()`/`get(x,y)` every frame in `video_color()` and
  `render_capture()`; Chromium logs a perf warning on every frame.
  Harmless, and the driver's console-error check already ignores it
  (it's a `warning`, not an `error`).
