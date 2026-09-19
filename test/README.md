# Checks

Two Playwright scripts that hold the UI to the rules in
`design-system/pillbox/MASTER.md`. Neither needs a server — they open
`index.html` over `file://`.

```bash
npm install
npx playwright install chromium   # unless CHROME_PATH points at one already
npm test
```

**`audit.mjs`** — sweeps every screen in light and dark, at 1× and 2× text, at
320px and 393px, plus the add and refill sheets. Per scenario it fails on:

- any interactive element under 44×44pt
- any button or input with no accessible name
- horizontal overflow
- any text below its WCAG contrast threshold, measured against the background
  actually painted behind it (4.5:1, or 3:1 where the text qualifies as large)

**`flows.mjs`** — drives the real interactions: the four-step add flow and its
validation, dose recording with supply movement and undo, the confirmation
required to change a past record, refill preview-before-commit, delete-all, and
keyboard reachability.

Both exit non-zero on failure, so they work as a pre-commit gate.
