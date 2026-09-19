# Medicine Tracker

An interactive iPhone-style prototype for tracking daily medicine doses, supply levels and adherence history.

## Features

- **Today** — the day's schedule; tap to mark a dose taken or undo it.
- **Supply** — per-medicine stock with a per-medicine low-stock warning level, refills and editing.
- **History** — month calendar (taken / partly / missed), streak and adherence stats, per-medicine filter, month and year pickers, and tap-to-correct dose records.
- Low-stock push notification when a medicine crosses its own warning threshold.

## Running it

`index.html` is a single self-contained file. Open it in any modern browser — no build step, no dependencies, no network access required.

## Publishing with GitHub Pages

1. Push this folder to a repository.
2. Settings → Pages → Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The app will be served at `https://<user>.github.io/<repo>/`.

## Color system

Slate ground (#F8FAFC) with white cards and #E2E8F0 rules. Teal #0F766E carries brand, primary actions and active navigation. Semantic color is reserved: green for taken, blue for upcoming, amber for partly taken, red for missed and errors.

## Notes

Data is in-memory demo state — nothing is persisted between reloads.
