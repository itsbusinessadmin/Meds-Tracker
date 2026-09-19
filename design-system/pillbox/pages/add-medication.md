# Add Medication — page rules

> Inherits MASTER.md.

## Shape of the flow

A **4-step sheet**, not one long form. Each step is one decision, so the user is never
staring at ten empty fields. Progress is a segmented indicator in the sheet header, and
every step is titled.

| Step | Asks | Required |
|---|---|---|
| 1 · Medicine | Name, dose/strength | Name only |
| 2 · Schedule | How often, at what times | Yes |
| 3 · Reminders | Notify on/off, lead time | No — defaults on |
| 4 · Supply | Pills on hand, low threshold | No — skippable |

`Back` and `Next` in the header; `Next` is disabled until the step is valid, and says
why. The last step's action is `Save medicine`. Editing an existing medicine opens the
same sheet with every step pre-filled and jumps straight to a summary, so a one-field
change is not a four-step walk.

## Step 1 — Medicine

- Name: visible label, autofocus, autocapitalised words. The only truly required field.
- Dose: free text ("500 mg", "2 tablets", "10 units") — not a number field, because doses are not all numbers. Placeholder shows examples; empty defaults to "1 dose" **and says so** rather than silently substituting.

## Step 2 — Schedule

The weakest part of the old build, which generated times with
`8 + i * 14 / (count-1)` and never let the user pick one.

- Frequency: `Once daily` · `Twice daily` · `3 times` · `Custom`.
- Choosing a frequency proposes sensible default times (08:00; 08:00/20:00; 08:00/14:00/20:00) which are **shown as editable time chips**.
- Tapping a chip opens the **native time picker**.
- Custom allows 1–12 doses; each gets its own editable chip.
- A plain-language summary sits under the control: "Twice daily at 8:00 AM and 8:00 PM."
- "With food" / "Before bed" as optional instruction chips, appearing on the dose row later.

## Step 3 — Reminders

- Single switch, default on, with a clear consequence line.
- Lead time: `At dose time` / `5 min before` / `15 min` / `30 min`.
- If system notification permission is not granted, say so inline with a link to enable — do not fail silently at save time.

## Step 4 — Supply

- Pills on hand: numeric, `inputMode="numeric"`, optional.
- Low threshold: stepper, default from Settings, shown as placeholder not as a filled value.
- Live feedback: "24 pills · about 12 days at this schedule" updates as they type. This is the payoff for steps 2 and 4 together and it is the moment the app proves it is doing the arithmetic for them.
- Skippable: `Set up later` as a ghost action.

## Validation

- On blur and on submit, never per keystroke.
- Errors inline under the field with icon and text; the step indicator marks the failing step.
- On a failed save, focus moves to the first error.
- Keyboard avoidance: the focused field and its error stay visible above the keyboard.

## Cancelling

With unsaved input, `Cancel` asks: "Discard this medicine?" — `Discard` destructive,
`Keep editing` default. With no input, it closes silently.
