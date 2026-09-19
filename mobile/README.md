# Pillbox — iOS app

React Native + Expo. The production target; `../index.html` is the reference
prototype the design was validated against.

## Running

```bash
npm install
npx expo start          # then press i for iOS
```

## Layout

```
src/
  theme/       tokens.ts mirrors design-system/pillbox/MASTER.md; index.tsx
               resolves scheme + reduce-motion
  domain/      medication.ts  pure logic — dose status, supply bands, schedules
               notifications.ts  real daily reminder scheduling
  store/       state + AsyncStorage persistence, hydration-gated
  components/  primitives, layout, medication, sheet, toast
  sheets/      add/edit flow, refill, confirmation — hosted once, opened anywhere
  app/         expo-router routes; (tabs) holds the three destinations
```

## What this adds over the prototype

- **Persistence.** Medicines, schedules and history survive relaunch (`AsyncStorage`, debounced writes, hydration gate so no screen flashes an empty state at someone who has data).
- **Real reminders.** Each dose time becomes a repeating daily local notification offset by its lead time; low-supply alerts fire on threshold crossing. The whole schedule is rebuilt on change rather than reconciled, because a duplicated or dropped medication reminder is a real harm and replacement cannot drift.
- **Native tab bar** via `NativeTabs`, with SF Symbols that carry a filled variant when selected.
- **Native time picker** in the schedule step.
- **Delete a medicine**, behind a confirmation, from its edit sheet.

## Checks

```bash
npx tsc --noEmit
```

See `AGENTS.md` for how to verify rendering without a simulator, and for the
API-version traps this environment hides.
