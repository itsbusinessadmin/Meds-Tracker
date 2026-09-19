# Pillbox

An iOS medication reminder and supply tracker. Pillbox answers one question
fast — *what do I take, and when* — and a second one without arithmetic: *what
runs out first*.

## Screens

- **Today** — the adherence ring, the next dose given emphasis, missed doses and low supply called out separately, then the full day's schedule. Recording a dose is one tap, is confirmed by a toast, and is undoable.
- **Supply** — every medicine sorted by urgency, showing pills remaining *and* estimated days left, with refill in a sheet that previews the new total before committing.
- **History** — a month calendar where each day carries a shape as well as a colour, plus a list mode, medicine filter, and per-day dose detail. Changing a past record asks first.
- **Settings** — notifications, appearance (theme, text size, reduce motion), data and privacy including delete-all, help, legal and the medical disclaimer.
- **Add medicine** — a four-step sheet (medicine → schedule → reminders → supply) with real time pickers and a live supply estimate.

## Running it

```bash
open index.html
```

No build step, no server, no network access. `index.html` carries the token
layer and component styles; `app.js` is the application. Classic scripts load
over `file://`, so double-clicking works.

## Design system

`design-system/pillbox/MASTER.md` is the source of truth for the interface —
philosophy, colour, typography, spacing, radii, shadows, materials, icons,
components, motion, accessibility and both themes. `design-system/pillbox/pages/`
holds per-screen rules that may narrow MASTER but never contradict it.

Nothing in the UI carries a raw hex, font size or duration; every value is a
token. If a screen needs something MASTER does not define, it goes in MASTER
first.

The palette keeps Pillbox's `#0F766E` teal as the brand but spends it
sparingly — active navigation, the one primary action per screen, the next
dose, progress and selection. Everything else is neutral. Status is never
carried by colour alone: every state has an icon and a word as well.

## Checks

```bash
npm install
npx playwright install chromium
npm test
```

`npm run audit` sweeps every screen in light and dark, at 1× and 2× text, at
320px and 393px, failing on sub-44pt touch targets, missing accessible names,
horizontal overflow, or text under its contrast threshold. `npm run flows`
drives the real interactions end to end. See `test/README.md`.

## The iOS app

`mobile/` holds the React Native + Expo app — the production target. It
implements the same design system from the same MASTER.md, adding what the
prototype could only represent: persistence across relaunch, real scheduled
notifications, a native tab bar and a native time picker. See `mobile/README.md`.

The prototype remains the design reference: it is what the visual decisions were
verified against, and it runs anywhere with no toolchain. It is not meant to be
wrapped in a WebView.

## Note

Prototype data lives in memory and resets on reload; the iOS app persists to the
device. Pillbox tracks medicines you have been prescribed; it does not give
medical advice.
