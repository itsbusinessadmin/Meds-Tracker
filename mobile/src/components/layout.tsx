import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GUTTER, TARGET, radius, space, useTheme } from '@/theme';
import { Icon, IconName, Separator, Text } from './primitives';

/* --------------------------------------------------------- NavigationHeader */

/**
 * The bar is fixed; the large title lives in the scroll view and collapses
 * into it. Getting this wrong — putting the large title inside the bar — pins
 * it forever and the compact title fades in on top of it.
 */
export function Screen({
  title,
  actions,
  children,
  contentStyle,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [scrolled, setScrolled] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const past = e.nativeEvent.contentOffset.y > 12;
      if (past !== scrolled) {
        setScrolled(past);
        Animated.timing(opacity, {
          toValue: past ? 1 : 0,
          duration: 160,
          useNativeDriver: true,
        }).start();
      }
    },
    [scrolled, opacity],
  );

  return (
    <View style={[styles.screen, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      <View style={[styles.navBar, scrolled && { backgroundColor: c.material }]}>
        <Animated.View style={[styles.navTitleWrap, { opacity }]} pointerEvents="none">
          <Text variant="headline" numberOfLines={1}>
            {title}
          </Text>
        </Animated.View>
        <View style={styles.navActions}>{actions}</View>
      </View>
      {scrolled ? <Separator /> : <View style={styles.sepSpacer} />}

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          { paddingBottom: space.s10 + insets.bottom },
          contentStyle,
        ]}
        // Returning to a screen keeps its position rather than snapping to top.
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text variant="largeTitle" style={styles.largeTitle} accessibilityRole="header">
          {title}
        </Text>
        {children}
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------ SectionHeader */

export function SectionHeader({ title, trailing }: { title: string; trailing?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text variant="caption" tone="secondary" style={styles.uppercase} accessibilityRole="header">
        {title}
      </Text>
      {trailing ? (
        <Text variant="caption" tone="secondary" style={styles.trailing}>
          {trailing}
        </Text>
      ) : null}
    </View>
  );
}

export function Section({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.section, style]}>{children}</View>;
}

/* ------------------------------------------------------------------- Card */

export function Card({
  children,
  tone,
  style,
}: {
  children: React.ReactNode;
  tone?: 'default' | 'emphasis' | 'success' | 'warning' | 'danger';
  style?: ViewStyle;
}) {
  const { c } = useTheme();
  const bg = {
    default: c.surface,
    emphasis: c.primaryTint,
    success: c.successTint,
    warning: c.warningTint,
    danger: c.dangerTint,
  }[tone ?? 'default'];
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: bg },
        tone === 'emphasis' && { borderRadius: radius.lg, padding: space.s5 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/* --------------------------------------------------------------- ListGroup */

/** The iOS inset-grouped table: one rounded surface, hairlines inset to text. */
export function ListGroup({
  children,
  footer,
  style,
}: {
  children: React.ReactNode;
  footer?: string;
  style?: ViewStyle;
}) {
  const { c } = useTheme();
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View>
      <View style={[styles.group, { backgroundColor: c.surface }, style]}>
        {items.map((child, i) => (
          <View key={i}>
            {i > 0 ? <Separator inset={space.s4} /> : null}
            {child}
          </View>
        ))}
      </View>
      {footer ? (
        <Text variant="footnote" tone="secondary" style={styles.groupFooter}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

export function ListRow({
  title,
  subtitle,
  value,
  icon,
  onPress,
  chevron,
  accessory,
  destructive,
  accessibilityRole = 'button',
  accessibilityState,
  accessibilityLabel,
}: {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: IconName;
  onPress?: () => void;
  chevron?: boolean;
  accessory?: React.ReactNode;
  destructive?: boolean;
  accessibilityRole?: 'button' | 'switch' | 'none';
  accessibilityState?: { checked?: boolean; selected?: boolean };
  accessibilityLabel?: string;
}) {
  const { c } = useTheme();
  const body = (
    <>
      {icon ? <Icon name={icon} size={20} tone={destructive ? 'danger' : 'default'} /> : null}
      <View style={styles.rowMain}>
        <Text variant="body" tone={destructive ? 'danger' : 'default'}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" tone="secondary" style={styles.rowSub}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="body" tone="secondary" numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {accessory}
      {chevron ? <Icon name="chevronRight" size={18} tone="secondary" /> : null}
    </>
  );

  if (!onPress) return <View style={styles.row}>{body}</View>;

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: c.surfaceRaised }]}
    >
      {body}
    </Pressable>
  );
}

/* -------------------------------------------------------------- EmptyState */

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <Icon name={icon} size={40} tone="secondary" />
      <Text variant="title3" style={styles.center}>
        {title}
      </Text>
      <Text variant="subhead" tone="secondary" style={[styles.center, styles.measure]}>
        {body}
      </Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  navBar: {
    minHeight: TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: GUTTER,
  },
  navTitleWrap: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  navActions: { marginLeft: 'auto', flexDirection: 'row', gap: space.s1 },
  sepSpacer: { height: StyleSheet.hairlineWidth * 2 },
  largeTitle: { paddingHorizontal: GUTTER, paddingBottom: space.s1 },
  section: { paddingHorizontal: GUTTER, paddingTop: space.s6 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: space.s1,
    paddingBottom: space.s2,
    gap: space.s2,
  },
  uppercase: { textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  trailing: { marginLeft: 'auto' },
  card: { borderRadius: radius.md, padding: space.s4 },
  group: { borderRadius: radius.md, overflow: 'hidden' },
  groupFooter: { paddingHorizontal: space.s4, paddingTop: space.s2 },
  row: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    paddingHorizontal: space.s4,
    paddingVertical: space.s3,
  },
  rowMain: { flex: 1, minWidth: 0 },
  rowSub: { marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: space.s10, paddingHorizontal: space.s6, gap: space.s3 },
  center: { textAlign: 'center' },
  measure: { maxWidth: 320 },
});
