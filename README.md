# Brain Damage Jeopardy

A deliberately terrible trivia game show, inspired by Magic the Noah's trivia videos.
Plain HTML/JS, no build step. It runs on any static host, including GitHub Pages.

## Running it

- **Host screen:** `index.html`. It has the answers, the scores and every control.
- **TV screen:** `tv.html`, opened with the **Open TV window** button. It only shows what the host puts up.

Both windows have to be in the same browser on the same computer. They talk to each other directly.
To get the TV screen onto the TV, either:
- plug in HDMI, drag the TV window to the TV and click it to go fullscreen, or
- in Chrome, right-click the TV window → **Cast...** → pick the TV → cast the tab.

Locally: `python -m http.server 8321`, then open http://localhost:8321.

## Editing questions

Everything lives in `js/games.js`. Each game has 6 categories × 5 clues plus a Final.
The wheels are at the bottom of the same file.
