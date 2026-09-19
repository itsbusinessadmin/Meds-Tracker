# Working in this app

## Expo SDK 57 — check the installed types, not your memory

`https://docs.expo.dev` is **blocked by the network egress proxy in this
environment**, so the versioned docs are not reachable. The installed packages'
own `.d.ts` files are the authoritative source and are better than the docs
anyway — they are the exact version resolved in `package.json`:

```bash
grep -A 8 "DailyTriggerInput = {" node_modules/expo-notifications/build/Notifications.types.d.ts
```

Two APIs already caught this way and worth knowing:

- `setNotificationHandler` takes `shouldShowBanner` / `shouldShowList` in SDK 57. `shouldShowAlert` is deprecated.
- React Native 0.86 dropped `StyleSheet.absoluteFillObject` from its public types. Use `StyleSheet.absoluteFill`.

`npx expo install` also needs the Expo API and fails here with
`HTTP Proxy Network Error: Forbidden`. Install with `npm install <pkg>@~<version>`
after checking the SDK-matching version with `npm view <pkg> versions`.

## Design system

`../design-system/pillbox/MASTER.md` is the source of truth for the interface.
`src/theme/tokens.ts` mirrors it. No component defines its own colour, size,
radius or duration — if you need a value that is not exported, add it to
MASTER.md first, then to tokens, then use it.

Rules that are load-bearing, not preferences:

- **Never use a fixed `height`** on anything containing text. Dynamic Type scales type but not your container, so `height` clips. Use `minHeight`.
- **Every icon-only control needs an `accessibilityLabel`.** `IconButton` makes the prop required for this reason — do not add an escape hatch.
- **Touch targets are ≥44pt.** Expand the hit area with padding or `hitSlop`; do not grow the glyph.
- **Status is never colour alone.** Every state carries an icon and a word too.

## Verifying without a simulator

There is no iOS simulator here. `npx expo export --platform web` then serving
`dist/` renders the real component tree through react-native-web, which is
enough to check layout, tokens, both themes and the accessibility tree.

Two things do NOT reflect iOS in that preview, so do not "fix" them from a web
screenshot:

- `NativeTabs` renders a **top** DOM strip on web. On iOS it goes through `react-native-screens` to a real `UITabBarController` at the bottom.
- The browser draws a focus ring on inputs. iOS does not.

Web output is set to `"single"` (SPA). Static rendering fails because
`NativeTabs` icons call `expo-font.renderToImageAsync`, which does not exist in
the node render environment.
