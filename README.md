# Brain Damage Jeopardy

A deliberately terrible trivia game show, inspired by Magic the Noah's trivia videos.
Plain HTML/JS, no build step, hosted on GitHub Pages.

## Pages

- `index.html` — **host screen** (phone or laptop). Answers, scores, coin, sounds.
- `tv.html` — **TV screen**. Shows only what the host puts up.
  - `tv.html?cast=1` is the Chromecast receiver version.
- `themes.html` — **theme comparison**. Every theme side by side; "Use this" picks one.
- `editor.html` — **question bank**. Tick which questions go on the board, edit, add.

## Getting it on the TV

- **Phone + Chromecast:** tap the cast icon on the host screen. Needs a registered Cast
  receiver app (App ID goes in `js/config.js` or is pasted into the host screen).
- **Laptop + HDMI:** "TV window" button, drag it to the TV, click it to go fullscreen.

## Themes

The host's Theme panel switches the look of the TV and the host screen. Colours and fonts
are variables at the top of `css/style.css`; each theme overrides them in `css/themes.css`.
The picker's list (names and swatches) is `THEMES` in `js/shared.js`.

## About-me slides

The host's **About-me slides** panel plays a fake Google-Slides-style intro on the TV that
falls apart slide by slide and ends by crashing into the game. Slide text, speaker notes and
how broken each slide gets are in `js/intro-slides.js`. Arrow keys, Space and presentation
clickers move through them (in the TV window too, on a laptop).

## Questions

Built-in questions live in `js/default-library.js`. Edits made in the editor are saved in
that browser; "Send to phone" makes a link that carries them to another device, and
"Download backup file" can be pasted over `default-library.js` to make them permanent.

Sounds are synthesized in `js/shared.js`. Any of them can be replaced with a real audio
file via `SOUND_FILES` in `js/config.js`.

## Deploying

Before committing changes to `js/` or `css/`, run `node tools/bump-version.js`. It stamps
every script/style link with a new version so phones can't keep running cached copies,
and pages that are still open reload themselves onto the new version.
