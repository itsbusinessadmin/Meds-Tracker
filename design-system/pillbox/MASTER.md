# Pillbox — Master Design System

**Status:** Source of truth. Every screen, component and future feature derives from this file.
**Scope:** iOS (React Native + Expo target). The HTML build in `index.html` is a reference prototype of this same system.
**Version:** 1.0
**Generated with:** `ui-ux-pro-max` skill (style + UX + app-interface domains), then hand-tuned. See "Provenance" at the end.

> **Rule of precedence.** MASTER.md wins. A file in `pages/` may add or narrow a rule for one screen, never invent a new visual language. If a screen needs something this file does not define, add it here first.

---

## 1. Design philosophy

Pillbox is used by someone who is often tired, often in a hurry, sometimes anxious, and
frequently over 60. It is consulted in five-second glances, many times a day, for years.
Every decision below follows from that.

1. **Answer the question before it is asked.** The Today screen answers "what do I take, and when" without a tap. The Supply screen answers "what runs out first" without arithmetic. Never make the user compute.
2. **Calm carries more authority than alarm.** A medical tool that shouts loses trust and gets ignored. Red is spent only on genuine problems. A medicine that is merely low is amber and quiet; a medicine that runs out in two days is red, once.
3. **Status is never a colour alone.** Every state carries a shape, an icon and a word. Assume the user cannot distinguish red from green — roughly 1 in 12 men cannot.
4. **Recording a dose is a medical record, not a like button.** Destructive and irreversible-feeling actions get friction proportional to their cost. Marking a dose taken is easy and reversible; deleting a medicine is not.
5. **Familiar beats clever.** If iOS already has a pattern for this, use it. The user's muscle memory is a feature we get for free.
6. **Restraint is the aesthetic.** Whitespace, type hierarchy and one accent colour do the work. Depth, blur and motion appear only where they explain something.

**Anti-goals:** a dashboard, a habit tracker, a gamified streak app, a clinical records system.

---

## 2. Colour

### 2.1 Principle

The interface is **neutral by default**. Teal is a highlighter, not a wash. On a typical
screen, teal covers well under 10% of pixels. If a mockup looks teal, it is wrong.

Teal is reserved for exactly five jobs:

| Job | Example |
|---|---|
| The one primary action on screen | `Take` button, `Save medicine` |
| Active navigation | Selected tab |
| The next dose | Its emphasis card and time |
| Medication progress | Adherence ring, supply bar when healthy |
| Selected state in a control | Chosen segment, picked day, `on` switch |

Everything else is neutral. Status colours override teal where they apply.

### 2.2 Neutral ramp

Teal-tinted neutrals, not pure grey — it makes white feel warmer next to the brand and
keeps the app from reading as generic slate.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F5F8F8` | `#0C1213` | App background behind everything |
| `--surface` | `#FFFFFF` | `#161D1E` | Cards, list groups, sheets |
| `--surface-raised` | `#EDF2F2` | `#1F2829` | Inputs, segmented track, inactive chips |
| `--separator` | `#DDE4E4` | `#2C3839` | Hairlines between rows |
| `--text` | `#0B1416` | `#ECF1F1` | Everything the user must read |
| `--text-secondary` | `#5B6C6E` | `#A2B1B2` | Supporting copy, captions, inactive tabs |

**There is no tertiary text tone.** A third, lighter grey was tested at `#6B7C7E` and
measured **4.37:1** on white — under the 4.5:1 floor. It is deliberately absent so it
cannot creep back in. Two tones, both compliant, forever.

### 2.3 Brand teal

| Token | Light | Dark | Notes |
|---|---|---|---|
| `--primary` | `#0F766E` | `#0F766E` (fills) | The existing Pillbox teal, kept as the identity |
| `--primary-pressed` | `#0B5C55` | `#0B5C55` | Press state for filled buttons |
| `--primary-text` | `#0F766E` | `#3DBFB2` | Teal used *as text or icon* |
| `--primary-tint` | `#E4F0EF` | `#10302E` | Emphasis backgrounds, selected rows |
| `--on-primary` | `#FFFFFF` | `#FFFFFF` | Text on a teal fill |

In dark mode the **fill** stays `#0F766E` (white on it measures 5.47:1) while **teal text
and icons** lift to `#3DBFB2`. Never use `#3DBFB2` as a large fill — that is the neon
look the brief rules out.

### 2.4 Semantic status colours

Each status is a triple: **colour + icon + word.** The icon shapes are deliberately
distinguishable in silhouette, not just in hue.

| Status | Meaning | Icon (shape) | Word | Light text / tint | Dark text / tint |
|---|---|---|---|---|---|
| **Taken** | Dose recorded | filled circle, check | "Taken" | `#15803D` / `#E6F4EA` | `#6EE7A0` / `#16301F` |
| **Upcoming** | Scheduled, not yet due | hollow circle | "Upcoming" | `#5B6C6E` / `#EDF2F2` | `#A2B1B2` / `#1F2829` |
| **Due now** | In its window | hollow circle, teal ring | "Due now" | `#0F766E` / `#E4F0EF` | `#3DBFB2` / `#10302E` |
| **Missed** | Window passed, not taken | triangle, exclamation | "Missed" | `#B42318` / `#FDECEA` | `#FFA99C` / `#3A1A16` |
| **Skipped** | Deliberately not taken | circle, diagonal slash | "Skipped" | `#5B6C6E` / `#EDF2F2` | `#A2B1B2` / `#1F2829` |
| **Low supply** | Refill soon | box, down-arrow | "Low" | `#A15C07` / `#FBF1E2` | `#EFBE7A` / `#332313` |
| **Critical supply** | Runs out ≤3 days | box, exclamation | "Critical" | `#B42318` / `#FDECEA` | `#FFA99C` / `#3A1A16` |

**Upcoming and Skipped share a colour on purpose.** Both are non-events. They are told
apart by icon and word, which is the point of the rule — and it keeps the palette from
sprawling into six hues.

### 2.5 Measured contrast

Every pair below was computed, not estimated. All meet or beat 4.5:1 for text.

| Pair | Light | Dark |
|---|---|---|
| Primary text on surface | 18.65 | 14.99 |
| Secondary text on surface | 5.50 | 7.71 |
| Secondary text on raised | 4.87 | 6.79 |
| Teal text on surface | 5.47 | 7.56 |
| White on teal fill | 5.47 | 5.47 |
| Taken text on its tint | 6.31 | 9.21 |
| Missed text on its tint | 7.58 | 8.52 |
| Low-supply text on its tint | 5.92 | 8.86 |
| Active tab label on tab material | 5.22 | 7.72 |

**Separators are exempt.** `--separator` measures ~1.3:1 against its surface by design.
WCAG 1.4.11 governs UI components and meaningful graphics; a decorative hairline is
neither. Do not "fix" this by darkening separators — it would coarsen the whole app.
Structure is carried by spacing and grouping, with the hairline as a whisper.

### 2.6 Increase Contrast

When the OS reports increased-contrast preference:

- `--text-secondary` → `#41504F` (light) / `#C4D0D1` (dark)
- `--separator` → `#B9C4C4` (light) / `#41504F` (dark)
- Status tints gain a 1px border in the matching status text colour
- Ghost buttons gain a visible border

---

## 3. Typography

### 3.1 Family

```
-apple-system, "SF Pro Text", "SF Pro Display", system-ui, "Helvetica Neue", sans-serif
```

The platform font, always. On React Native this is simply the default `System` face.
No webfont is loaded — the previous build shipped Archivo, which is not the iOS system
font and cost three font files on a screen the user opens forty times a day.

### 3.2 Ramp

Mirrors the iOS text styles so Dynamic Type maps one-to-one. **Sizes are `rem`, never
`px`,** so one root change scales the entire app.

| Token | Size / line | Weight | Tracking | Used for |
|---|---|---|---|---|
| `--type-large-title` | 34 / 41 | 700 | −0.4 | Screen titles ("Today") |
| `--type-title-1` | 28 / 34 | 700 | −0.3 | Supply headline, month name |
| `--type-title-2` | 22 / 28 | 600 | −0.2 | Sheet titles, next-dose medicine name |
| `--type-title-3` | 20 / 25 | 600 | −0.2 | Card headings |
| `--type-headline` | 17 / 22 | 600 | −0.1 | **Medication names**, row titles, buttons |
| `--type-body` | 17 / 22 | 400 | 0 | Body copy, input text |
| `--type-callout` | 16 / 21 | 400 | 0 | Secondary body |
| `--type-subhead` | 15 / 20 | 400 | 0 | **Dose info**, supporting lines |
| `--type-footnote` | 13 / 18 | 400 | 0 | Captions, timestamps, helper text |
| `--type-caption` | 12 / 16 | 500 | +0.1 | Section headers (uppercase), badges |
| `--type-tab` | 11 / 13 | 500 | +0.1 | Tab bar labels only |

**Floor: 12px, with one exception** — the 11px tab label, which matches the iOS system
tab bar and is always paired with a 26px icon. Nothing else in the app goes below 12.
The old build used 10px tab labels, 11px badges and 12px dose text; all have moved up.

### 3.3 Numerals

Anything that changes in place — times, pill counts, day numbers, dose counts — uses
`font-variant-numeric: tabular-nums`. Digits must not jitter as values update.

### 3.4 Dynamic Type

- Root scale is a multiplier on `html { font-size }`; every size in `rem` follows.
- Tested at **200%**. Nothing may clip, overlap or hide.
- Rows switch from horizontal to stacked above ~1.35× (`--stack-threshold`).
- Fixed-height rows are banned. Use `min-height` and let content grow.
- Icons scale with text but cap at 1.5× so they do not dominate.
- **Never** truncate a medication name to one line. Wrap to two, then ellipsis.

---

## 4. Spacing

4pt base grid. These are the only legal values.

| Token | px | Use |
|---|---|---|
| `--space-1` | 4 | Icon-to-label, tight pairs |
| `--space-2` | 8 | Inside chips, between stacked labels |
| `--space-3` | 12 | Row internal gaps |
| `--space-4` | 16 | Card padding, standard gap |
| `--space-5` | 20 | **Screen gutter** |
| `--space-6` | 24 | Between cards |
| `--space-7` | 32 | Between sections |
| `--space-8` | 40 | Above a section header after content |
| `--space-9` | 48 | Screen top padding under a large title |
| `--space-10` | 64 | Empty-state breathing room |

Screen gutter is `--space-5` (20px) on all phones, rising to 24px above 430px width.
The old build mixed 13, 14, 18, 19, 21, 22, 26 and 28px paddings; none survive.

---

## 5. Corner radii

| Token | px | Use |
|---|---|---|
| `--radius-xs` | 8 | Badges, small chips, status pills |
| `--radius-sm` | 12 | Inputs, segmented control, small buttons |
| `--radius-md` | 16 | **Cards, list groups**, primary buttons |
| `--radius-lg` | 20 | Emphasis (next-dose) card |
| `--radius-xl` | 28 | Sheet top corners |
| `--radius-full` | 999 | Avatars, toggle knobs, circular icon buttons |

One radius per nesting level. A 12px element never sits inside another 12px element —
step down. The old build used 11, 14, 16, 17, 18, 20 and 26px radii on sibling elements.

---

## 6. Shadows, materials and blur

### 6.1 Shadows — the default is none

Hierarchy comes from **surface colour and spacing**, not elevation. A card on `--bg`
is already distinct because it is white. Adding a shadow to every card is the single
fastest way to make an iOS app look like a web dashboard.

| Token | Value | Permitted on |
|---|---|---|
| `--shadow-none` | none | **All cards, all list groups, all rows** |
| `--shadow-sheet` | `0 -8px 32px rgba(6,20,19,.16)` | Bottom sheets only |
| `--shadow-float` | `0 4px 16px rgba(6,20,19,.10)` | Toasts, the notification banner |

That is the complete list. Three shadows, two of which are for things that float above
the app. **In dark mode shadows are invisible** — sheets and toasts get
`border-top: 1px solid var(--separator)` and a lighter surface instead.

### 6.2 Materials and blur

Blur is expensive, and everywhere-blur is the cheapest-looking effect in mobile design.
It is permitted in exactly **three** places:

| Surface | Treatment |
|---|---|
| Tab bar | `rgba(247,250,250,.82)` + `blur(20px) saturate(180%)`, hairline on top |
| Large-title nav bar, once scrolled | same material, fades in over 160ms |
| Sheet scrim | `rgba(6,20,19,.40)`, **no blur** |

Nowhere else. Cards are opaque. Buttons are opaque. If `backdrop-filter` is
unsupported, the material falls back to 97% opaque — never to transparent.

---

## 7. Icons

- **One family, one weight.** Outline, `stroke-width: 1.75`, round caps and joins, `currentColor`, 24×24 viewBox. Status glyphs may be filled — that is a deliberate hierarchy signal, not a mix.
- **Sizes:** `--icon-sm` 18 (inline with text) · `--icon-md` 24 (default) · `--icon-lg` 28 (tab bar) · `--icon-xl` 32 (empty states).
- **Never an emoji.** Ever.
- **Decorative icons** beside visible text are hidden from assistive tech (`aria-hidden` / `accessibilityElementsHidden`).
- **Icon-only controls** must carry an accessible name and, where relevant, their state. This is CRITICAL severity in the skill's app-interface rules and was violated everywhere in the old build.
- **Do not add an icon where a word is clearer.** "Skip" beats a slashed circle on a button.
- On React Native, use `@expo/vector-icons` SF Symbols equivalents or the project's own SVG set — not two sources at once.

---

## 8. Buttons

Minimum target **44×44pt**, always, including when the visual is smaller — expand the
hit area, do not grow the paint.

| Variant | Fill | Label | Use |
|---|---|---|---|
| **Primary** | `--primary` | `--on-primary`, headline | The one main action per screen |
| **Secondary** | `--surface-raised` | `--text`, headline | Alternative action ("Skip") |
| **Ghost** | transparent | `--primary-text`, headline | Tertiary ("Not now", "Cancel") |
| **Destructive** | transparent | `#B42318` / `#FFA99C` | Delete, inside a confirmation only |
| **Destructive filled** | `#B42318` | white | Final confirm in a destructive sheet |

- Height 50px for full-width, 44px for inline. Radius `--radius-md`.
- **Press:** background darkens to the pressed token plus `scale(0.98)`, 120ms. Scale never moves neighbours.
- **Disabled:** 38% opacity, no press feedback, and the control is genuinely non-interactive — not merely faded.
- **Loading:** label is replaced by a spinner, width is held, the control is disabled. Any action over 300ms shows this.
- Full-width buttons sit in the sheet footer above the safe-area inset, never floating over content.

---

## 9. Cards

Cards group; they do not decorate. **Not every section is a card** — plain sections on
`--bg` with a section header are the default, and a card is used only when its contents
are one logical object.

| Card | Background | Radius | Padding | Shadow |
|---|---|---|---|---|
| **Standard** | `--surface` | `--radius-md` | `--space-4` | none |
| **Emphasis** (next dose) | `--primary-tint` | `--radius-lg` | `--space-5` | none |
| **List group** | `--surface` | `--radius-md` | 0, rows padded | none |
| **Attention** | status tint | `--radius-md` | `--space-4` | none |

**List group** is the iOS inset-grouped table and is the workhorse: one rounded surface,
rows inside separated by a hairline that is inset to the text origin (not full-bleed) and
absent on the last row.

---

## 10. Status components

### 10.1 StatusBadge

Pill: `--radius-xs`, status tint background, status text colour, 12px/500 label, 14px
icon. Height 22px, `--space-2` horizontal padding. Always icon **and** word.

### 10.2 The dose row

The core repeating unit of the app:

```
[ time ]  [ medicine name          ]  [ status control ]
 17/tab    headline, wraps to 2 lines    44×44 target
           dose · instruction (subhead)
```

- Time column is fixed-width and tabular so times align down the column.
- Status control is a 44×44 tap target whose **visual** is a 28px circle.
- Taken rows keep full text contrast. The old build greyed and struck through taken medicine names, which reduced them below comfortable reading — the check and the "Taken 08:12" stamp already carry the state.

### 10.3 SupplyIndicator

A track showing **days remaining**, not percent of an arbitrary capacity. The old build
filled the bar as a fraction of `cap`, a number that drifted every refill and meant
nothing to the user.

- Scale is fixed at 30 days so bars are comparable between medicines.
- Healthy `--primary`, low `#A15C07`, critical `#B42318`.
- Always labelled in words: "about 12 days left". Never the bar alone.

---

## 11. Navigation

- **Three tabs: Today · Supply · History.** Settings is a nav-bar button, per iOS convention.
- **"Add" is not a tab.** The old build's fourth tab opened a modal — a tab must switch destinations, never open a sheet. Adding a medicine is a `+` in the nav bar of Today and Supply.
- Tab bar: 26px icon over an 11px label, active `--primary-text`, inactive `--text-secondary`. Active state is also carried by the **filled** icon variant, not colour alone.
- Large title collapses to an inline title on scroll, with the material fading in behind it.
- Sheets: `--radius-xl` top corners, a 36×5 grabber, drag-to-dismiss, `Cancel` left and the confirming action right.
- Destructive confirmations use an action sheet with the destructive option in red and `Cancel` separated below.
- Back is always available and always in the same place. Swipe-back is never the only way out.

---

## 12. Form controls

- **Every field has a visible label above it.** Placeholder-only labelling is banned — it is CRITICAL severity in the app-interface rules and disappears exactly when the user needs it.
- Inputs: `--surface-raised`, `--radius-sm`, 14px padding, 17px text, 50px min height.
- Focus: 2px `--primary` ring, offset 1px. Never removed.
- **Errors inline, under the field**, with an icon and text, in `#B42318`. The field also gains a red border. On submit with multiple errors, focus moves to the first one.
- Validation is on blur and on submit — never on every keystroke, which punishes the user mid-typing.
- `inputMode="numeric"` for pill counts and `"decimal"` for doses, so the right keyboard appears.
- Keyboard avoidance is mandatory: the focused field and its error stay visible.
- Switches are the native control. Segmented controls are for 2–4 mutually exclusive options; more than that becomes a list or a picker.
- Time selection uses the native time picker. The old build generated times arithmetically and never let the user choose one.

---

## 13. Motion

| Token | Duration | Easing | Use |
|---|---|---|---|
| `--motion-micro` | 120ms | `cubic-bezier(.2,.8,.3,1)` | Press states |
| `--motion-state` | 200ms | `cubic-bezier(.2,.8,.3,1)` | Status change, checkmark, toggle |
| `--motion-enter` | 280ms | `cubic-bezier(.2,.9,.3,1)` | Sheet in, banner in |
| `--motion-exit` | 200ms | `cubic-bezier(.4,0,1,1)` | Sheet out, banner out |

Exit is always faster than enter. Motion explains **where something came from** — sheets
rise from the edge they will return to, the notification drops from the status bar.

- Animate `transform` and `opacity` only. Never `width`, `height`, `top` or `left`.
- No looping animation except a genuine loading indicator.
- **Reduce Motion:** all transforms become a 100ms opacity fade; the checkmark appears without its spring; sheets appear in place. Never disable feedback entirely — the user still needs to know the tap registered.

---

## 14. Accessibility

Non-negotiable, and the old build met almost none of it.

| Requirement | Rule |
|---|---|
| **Touch targets** | ≥44×44pt, everywhere, with ≥8px between adjacent targets |
| **Labels** | Every control has an accessible name. Icon-only controls especially |
| **State** | Controls announce selected / pressed / disabled |
| **Colour** | Never the sole carrier of meaning — icon + word always accompany |
| **Contrast** | 4.5:1 text, both modes, measured not assumed |
| **Focus order** | Matches visual order; sheets trap focus and restore it on close |
| **Dynamic Type** | To 200% without breakage |
| **Reduce Motion** | Honoured |
| **Gestures** | Every swipe action has a tap equivalent. Swipe is never the only route |
| **Live regions** | Status changes and toasts announce politely |
| **Semantics** | Real `button` / `Pressable` with roles — not `div`s with tap handlers |

**Dose row announcement:**
`"Metformin, 500 milligrams, 8:00 AM, taken at 8:12 AM. Double tap to undo."`
Not `"Metformin"` followed by an unlabelled button.

---

## 15. Light and dark mode

Dark mode is a designed theme, not an inversion.

- **No pure black.** `#0C1213` background, `#161D1E` surfaces. Pure black bleeds on OLED and makes scroll edges hard to place.
- **Elevation is lightness.** Light mode lifts a surface with white and a shadow; dark mode lifts it by getting *lighter*. Never reuse light-mode shadows in dark.
- **Teal splits.** Fills stay `#0F766E`; text and icons lift to `#3DBFB2`. The bright tone never becomes a large fill.
- **Status colours lighten, tints darken.** Green `#15803D` → `#6EE7A0`; its tint `#E6F4EA` → `#16301F`.
- **No glow.** No coloured shadows, no neon edges.
- Both themes are verified independently. A value is never assumed to carry across.
- Setting: System / Light / Dark, defaulting to System.

---

## 16. Component inventory

Canonical names, shared by the prototype and the React Native build:

| Component | Responsibility |
|---|---|
| `MedicationCard` | A medicine as an object — name, dose, schedule, supply |
| `DoseRow` | One scheduled dose with its status control |
| `MedicationStatus` | Icon + word + colour for one state |
| `StatusBadge` | Compact pill form of the above |
| `DoseTime` | Tabular time, with relative hint ("in 40 min") |
| `SupplyIndicator` | Days-remaining bar + worded label |
| `ProgressIndicator` | Adherence ring for the day |
| `SectionHeader` | Uppercase caption + optional trailing action |
| `PrimaryButton` / `SecondaryButton` | Per §8 |
| `IconButton` | 44×44 target, mandatory accessible name |
| `ListGroup` / `ListRow` | Inset-grouped table |
| `EmptyState` | Icon, title, one line, one action |
| `ConfirmationSheet` | Destructive confirmation |
| `NavigationHeader` | Large title collapsing to inline |
| `TabBar` | Three destinations |
| `Sheet` | Grabber, drag-dismiss, footer action |
| `Toast` | Transient confirmation, above the tab bar |
| `Stepper` | Accessible +/− with a typed value |

No screen styles an element directly. If a screen needs a new visual, it becomes a
component here first.

---

## 17. Provenance

Generated with the `ui-ux-pro-max` skill, then corrected against this brief:

- **Used as-is:** `Minimalism & Swiss Style` (the closest match to the brief's direction); the app-interface rules for safe areas, touch targets, icon-button labels, form-control labels, reduced motion, light/dark contrast and loading states; the UX rules on colour-only indicators, touch spacing and error placement.
- **Deliberately overridden:** the skill's `--design-system` run returned a *landing-page* pattern ("Trust & Authority + Conversion", hero/proof/CTA sections), a medical-**blue** palette (`#0284C7`) and a **Lora / Raleway** font pairing. None fit an iOS app with a mandated teal identity and system typography. The skill's own query contract requires verifying fit before applying, so the pattern, palette and type were replaced. Its `Minimalism` style guidance and every accessibility rule were kept.
- **Not found in the database:** `"destructive action confirmation"` returned no match in the app-interface domain; the retry in `--domain ux` surfaced only generic success-confirmation rules. §8 and §11's destructive-confirmation rules are therefore written from Apple's HIG conventions and flagged here as not database-derived.
- All contrast ratios in §2.5 were computed directly from the hex values, not estimated.
