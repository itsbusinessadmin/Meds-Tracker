# Settings — page rules

> Inherits MASTER.md. This screen did not exist in the old build.

## Pattern

Standard iOS inset-grouped list. No cards, no custom chrome, no invention. Reached from
a nav-bar button on Today — not a tab.

## Groups

| Group | Rows |
|---|---|
| **Notifications** | Medication Reminders (switch) · Reminder time offset · Low Supply Alerts (switch) · Alert threshold (stepper, default 15 pills) |
| **Appearance** | Theme — System / Light / Dark (segmented or a selection list) · Larger text hint linking to iOS Settings |
| **Data & Privacy** | Medication Data · Export Data · Delete All My Data (destructive) |
| **Help** | Help & Support · Contact |
| **Legal** | Privacy Policy · Terms of Use · **Medical Disclaimer** |
| **About** | Pillbox · Version |

## Row rules

- 50px min height, growing with Dynamic Type.
- Label left in `--type-body`; value right in `--text-secondary`; chevron for navigation.
- Switches are native and announce their state.
- A row is either a switch row or a navigation row. Never both.
- Section headers in `--type-caption` uppercase `--text-secondary`; footers explain consequences in `--type-footnote`.

## Destructive: Delete All My Data

The most dangerous control in the app, so:

1. Red label, no fill, in its own group.
2. Tapping opens a confirmation sheet naming the exact consequence: "This deletes all medicines, schedules and history. This cannot be undone."
3. The confirming button is `Delete Everything` in destructive-filled; `Cancel` is separated below and is the default.
4. Success returns to an empty Today with a toast.

No timed hold, no typed confirmation — those are friction theatre for a local-only app.
A clearly worded two-step sheet is the iOS convention and is enough.

## Medical Disclaimer

Required, and reachable in two taps. Plain language: Pillbox is a tracking tool, it does
not give medical advice, and it is not a substitute for a clinician. The app never
recommends a dose, never suggests skipping, and never interprets adherence as health.
