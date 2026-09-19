# Today — page rules

> Inherits MASTER.md. Only deviations and page-specific structure appear here.

## Job of this screen

In one glance, without scrolling, answer:

1. What do I take next? 2. At what time? 3. What have I taken? 4. Did I miss anything? 5. What do I do right now?

Everything below serves that order. If an element does not answer one of the five, it belongs on another screen.

## Structure, top to bottom

| Zone | Content | Notes |
|---|---|---|
| Nav bar | Large title `Today`, `+` and Settings buttons | Collapses to inline title on scroll |
| Date + progress | "Saturday 19 September" · adherence ring · "2 of 5 doses" | Ring is the one decorative-feeling element; it is also the answer to Q3 |
| **Next dose** | Emphasis card | Only when a dose is due or upcoming today |
| Attention | Missed doses, then low supply | Appears only when non-empty. Never both collapsed into one banner |
| Schedule | All of today's doses, in time order, as a list group | Grouped `Morning` / `Afternoon` / `Evening` when >4 doses |

## The next-dose card

The single most important element in Pillbox.

- Background `--primary-tint`, radius `--radius-lg`, padding `--space-5`. **No shadow, no gradient.**
- Label `NEXT DOSE` in `--type-caption`, teal, uppercase.
- Medicine name in `--type-title-2`, wrapping to two lines before it ever truncates.
- Dose and instruction in `--type-subhead`.
- Time in `--type-title-3` tabular, with a relative hint: "8:00 PM · in 40 minutes".
- Actions: `Take` (primary, full width) and `Skip` (ghost). Both ≥44pt.
- **Emphasis without alarm.** Teal tint, not red; no pulsing, no countdown ticking down by the second. A person who is late for a dose does not need to be frightened.

When the next dose is overdue the card keeps its teal tint and adds a `Missed` badge —
the tint does **not** turn red. Red is for the attention zone, and only once.

## Marking a dose

Medication safety governs this interaction.

- `Take` records immediately with a 200ms check animation, haptic confirmation, and a toast: **"Metformin recorded · Undo"**.
- Undo stays available for 6 seconds in the toast, and permanently by tapping the row again.
- **The status control is a 44×44 target** whose visual is a 28px circle. The old build used a bare 28×28 circle, which is both under target and easy to hit by accident while scrolling.
- Untaking asks for nothing — it is reversible and the toast already offered it. Deleting a *historical* record does ask.
- `Skip` opens a small action sheet: "Skip this dose?" with an optional reason. Skipping is recorded, never silent.

## States

- **Empty (no medicines):** EmptyState — pill icon, "No medicines yet", "Add your first medicine to start tracking.", primary `Add medicine`.
- **All done:** the schedule list stays visible with every row checked, above a quiet line: "All doses taken today." Do not replace the list with a celebration screen — the user still wants to see what they took.
- **Nothing scheduled today:** "Nothing scheduled today" with a link to Supply.
- **Loading:** skeleton rows matching the dose-row geometry, never a spinner on a blank screen.

## VoiceOver

The schedule is a list. Each row announces name, dose, time, status and the action:
`"Metformin, 500 milligrams, 8:00 PM, upcoming. Double tap to mark taken."`
The ring announces `"2 of 5 doses taken today"` and is a single element, not five arcs.
