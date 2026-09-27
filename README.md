# Brain Damage Jeopardy

A deliberately terrible trivia game show, inspired by Magic the Noah's trivia videos.
Plain HTML/JS, no build step, hosted on GitHub Pages.

## Pages

- `index.html` — **host screen** (phone or laptop). Answers, scores, coin, sounds.
- `tv.html` — **TV screen**. Shows only what the host puts up.
  - `tv.html?cast=1` is the Chromecast receiver version.
- `editor.html` — **question bank**. Tick which questions go on the board, edit, add.

## Getting it on the TV

- **Phone + Chromecast:** tap the cast icon on the host screen. Needs a registered Cast
  receiver app (App ID goes in `js/config.js` or is pasted into the host screen).
- **Laptop + HDMI:** "TV window" button, drag it to the TV, click it to go fullscreen.

## Questions

Built-in questions live in `js/default-library.js`. Edits made in the editor are saved in
that browser; "Send to phone" makes a link that carries them to another device, and
"Download backup file" can be pasted over `default-library.js` to make them permanent.

Sounds are synthesized in `js/shared.js`. Any of them can be replaced with a real audio
file via `SOUND_FILES` in `js/config.js`.
