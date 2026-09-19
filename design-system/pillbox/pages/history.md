# History — page rules

> Inherits MASTER.md.

## Job of this screen

What was taken, missed and skipped — scannable, never a spreadsheet.

## Structure

| Zone | Content |
|---|---|
| Nav bar | Large title `History`, month/year picker |
| Filter | Segmented `Month` / `List`, plus a medicine filter |
| Summary | Adherence, taken, missed — three stats |
| Calendar or list | Per the segment |
| Day detail | The selected day's doses, editable |

## The calendar grid — colour is not enough

The old build coloured day cells green / amber / red with nothing else. That is exactly
the banned pattern: a red-green colour-blind user cannot read the month at all.

Every cell carries a **shape** as well as a tint:

| State | Tint | Shape |
|---|---|---|
| All taken | success tint | small filled dot under the number |
| Partly taken | warning tint | half-filled dot |
| Missed | danger tint | hollow ring |
| Skipped | raised | diagonal slash |
| Future | none | number in `--text-secondary`, no shape |
| Today | teal ring around the cell | plus its state shape |

Cells are ≥44×44 including gap. The legend names every state in words and repeats the
shapes — it is not a row of coloured dots.

## Day detail

- Title: weekday and date, plus a status word ("Partly taken").
- Each dose as a row: time, medicine, status, and a control to correct it.
- **Correcting a past record asks for confirmation** — it is a medical record and, unlike today's doses, the mistake is not obvious later. "Change to missed?" with Cancel.
- Future days are read-only and say so: "Scheduled — not yet due."

## List mode

Reverse-chronological, grouped by day with sticky day headers. Each group states its
summary ("3 of 4 taken"). This is the mode that scales past a few months; the calendar
is the mode that shows pattern.

## Honesty about data

Where there is no record, say `No data` — never render an empty month as though every
day were scheduled and future. The old build showed all 27 selectable years as "future",
including years in the past.

## States

- **Empty:** "No history yet", "Doses you record will appear here."
- **Filtered to nothing:** "No doses for Metformin in September", with `Clear filter`.
