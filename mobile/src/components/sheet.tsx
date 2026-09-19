import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TARGET, radius, space, useTheme } from '@/theme';
import { Button, Text } from './primitives';

/**
 * Bottom sheet. Uses the platform Modal so it inherits the system's own
 * dismissal handling — the hardware back button on Android, the accessibility
 * escape gesture on iOS — instead of reimplementing them badly.
 *
 * Motion respects Reduce Motion: the slide becomes a fade rather than
 * disappearing entirely, because the user still needs to see that something
 * arrived.
 */
export function Sheet({
  visible,
  title,
  onClose,
  leading,
  trailing,
  children,
  footer,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  leading?: { label: string; onPress: () => void };
  trailing?: { label: string; onPress: () => void; disabled?: boolean };
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { c, shadow, reduceMotion } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'fade' : 'slide'}
      onRequestClose={onClose}
      accessibilityViewIsModal
      statusBarTranslucent
    >
      <Pressable
        style={[styles.scrim, { backgroundColor: c.scrim }]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
      />
      <View style={[styles.sheet, { backgroundColor: c.bg }, shadow.sheet]}>
        <View style={[styles.grabber, { backgroundColor: c.separator }]} />

        <View style={styles.head}>
          <View style={styles.headSide}>
            {leading ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={leading.label}
                onPress={leading.onPress}
                style={({ pressed }) => [styles.headBtn, pressed && { opacity: 0.5 }]}
              >
                <Text variant="body" tone="primary">{leading.label}</Text>
              </Pressable>
            ) : null}
          </View>

          <Text variant="headline" style={styles.title} numberOfLines={1} accessibilityRole="header">
            {title}
          </Text>

          <View style={[styles.headSide, styles.headEnd]}>
            {trailing ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={trailing.label}
                accessibilityState={{ disabled: !!trailing.disabled }}
                disabled={trailing.disabled}
                onPress={trailing.onPress}
                style={({ pressed }) => [
                  styles.headBtn,
                  pressed && { opacity: 0.5 },
                  trailing.disabled && { opacity: 0.38 },
                ]}
              >
                <Text variant="body" tone="primary">{trailing.label}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        {footer ? (
          <View style={[styles.foot, { paddingBottom: space.s4 + insets.bottom }]}>{footer}</View>
        ) : (
          <View style={{ height: insets.bottom }} />
        )}
      </View>
    </Modal>
  );
}

/**
 * Destructive confirmation. The confirming action is on top and styled as the
 * consequence; Cancel is separated below and is what a mis-tap lands on.
 *
 * No timed hold, no typed confirmation — those are friction theatre for a
 * local-only app. A clearly worded two-step sheet is the iOS convention and it
 * is enough.
 */
export function ConfirmationSheet({
  visible,
  title,
  body,
  confirmLabel,
  destructive,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { c, shadow, reduceMotion } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'fade' : 'slide'}
      onRequestClose={onCancel}
      accessibilityViewIsModal
      statusBarTranslucent
    >
      <Pressable
        style={[styles.scrim, { backgroundColor: c.scrim }]}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Cancel"
      />
      <View
        style={[styles.sheet, { backgroundColor: c.bg }, shadow.sheet]}
        accessibilityRole="alert"
      >
        <View style={[styles.grabber, { backgroundColor: c.separator }]} />
        <View style={styles.confirmBody}>
          <Text variant="title3" style={styles.center} accessibilityRole="header">
            {title}
          </Text>
          <Text variant="subhead" tone="secondary" style={[styles.center, styles.confirmText]}>
            {body}
          </Text>
        </View>
        <View style={[styles.foot, { paddingBottom: space.s4 + insets.bottom }]}>
          <Button
            title={confirmLabel}
            variant={destructive ? 'destructiveFilled' : 'primary'}
            block
            onPress={onConfirm}
          />
          <Button title="Cancel" variant="secondary" block onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFill },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '92%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  grabber: { width: 36, height: 5, borderRadius: radius.full, alignSelf: 'center', marginTop: space.s2 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TARGET,
    paddingHorizontal: space.s4,
    paddingTop: space.s1,
  },
  headSide: { minWidth: 72 },
  headEnd: { alignItems: 'flex-end' },
  headBtn: { minHeight: TARGET, minWidth: TARGET, justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center' },
  body: { flexGrow: 0 },
  bodyContent: { paddingHorizontal: space.s5, paddingTop: space.s4 },
  foot: { paddingHorizontal: space.s5, paddingTop: space.s4, gap: space.s2 },
  confirmBody: { paddingHorizontal: space.s6, paddingTop: space.s5 },
  center: { textAlign: 'center' },
  confirmText: { marginTop: space.s2 },
});
