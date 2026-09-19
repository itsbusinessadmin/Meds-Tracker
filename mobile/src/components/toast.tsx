import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStore } from '@/store';
import { TARGET, radius, space, useTheme } from '@/theme';
import { Text } from './primitives';

/**
 * Transient confirmation for a state change, with the undo that makes the
 * change safe to make quickly. Sits above the tab bar, never over it — the
 * previous build's toast covered the navigation.
 *
 * It is a live region, so the change is announced whether or not the user is
 * looking at the screen.
 */
export function ToastHost() {
  const { toast, dismissToast } = useStore();
  const { c, shadow } = useTheme();
  const insets = useSafeAreaInsets();

  if (!toast) return null;

  return (
    <View
      style={[styles.wrap, { bottom: insets.bottom + 64 }]}
      pointerEvents="box-none"
      accessibilityLiveRegion="polite"
    >
      <View style={[styles.toast, { backgroundColor: c.toastBg }, shadow.float]}>
        <Text variant="subhead" color={c.toastText} style={styles.msg}>
          {toast.message}
        </Text>
        {toast.undo ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Undo"
            onPress={() => {
              toast.undo?.();
              dismissToast();
            }}
            style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}
          >
            <Text variant="subhead" color={c.toastText} style={styles.actionText}>
              Undo
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: space.s5, right: space.s5 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    borderRadius: radius.sm,
    paddingLeft: space.s4,
    paddingRight: space.s2,
    paddingVertical: space.s2,
    minHeight: TARGET + 4,
  },
  msg: { flex: 1 },
  action: {
    minHeight: TARGET,
    minWidth: TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.s2,
  },
  actionText: { fontWeight: '700', textDecorationLine: 'underline' },
});
