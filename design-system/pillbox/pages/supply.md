# Supply — page rules

> Inherits MASTER.md.

## Job of this screen

Which medicine needs attention, and how soon — understood in seconds, with **no arithmetic
by the user**.

## Ordering

Sorted by **urgency, not alphabetically**: critical first, then low, then healthy. The
thing that needs action is always at the top of the screen. Within a band, soonest
run-out first.

## Headline

`--type-title-1`, stating the situation plainly:

- `2 medicines running low` — `--text` with a low-supply badge, **not red type**
- `All medicines stocked` — `--text`
- Only when something is ≤3 days: `Atorvastatin runs out in 2 days` in `#B42318`

The old build coloured the whole headline red whenever anything was merely low. Red on
the headline is reserved for genuinely critical.

## Medication card

```
Metformin                              [Low]
500 mg · twice daily
────────────────────────────────────────────
24 pills          about 12 days left
[████████████░░░░░░░░░░░░░░░░░░]
                              [ Refill ]
```

- Name `--type-headline`; schedule `--type-subhead`.
- **Both numbers, always:** pills remaining *and* estimated days. Days is the number people act on; the old build computed it but only showed it inside a notification.
- Bar is days-remaining on a **fixed 30-day scale**, so bars compare across medicines. Never a fraction of an arbitrary stored capacity.
- `Refill` is a secondary button, ≥44pt. The card body opens the medicine detail; the two targets do not overlap.
- Estimated days is explicitly an estimate: "about 12 days left".

## Supply bands

| Band | Condition | Treatment |
|---|---|---|
| Healthy | > 14 days | Teal bar, no badge |
| Low | ≤ 14 days or ≤ threshold | Amber bar, `Low` badge, calm |
| Critical | ≤ 3 days | Red bar, `Critical` badge, card gains a red-tinted left edge |

Threshold is per-medicine, falling back to the global setting. It is editable in the
medicine detail, with the fallback shown as the placeholder.

## Refill

Sheet, not a full screen:

- Shows current count and days left.
- Quick presets — `+30` `+60` `+90` — plus a typed amount with `inputMode="numeric"`.
- A Stepper for fine adjustment, with a genuine +/− at 44pt each.
- Confirming shows the new total and new estimate **before** committing: "New total: 54 pills · about 27 days".
- Success toast with Undo.

## States

- **Empty:** "No medicines tracked", primary `Add medicine`.
- **Never-set supply:** show "Supply not tracked" and a `Set up supply` action rather than a zero bar, which would read as "out of stock".
