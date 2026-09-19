import React from 'react';
import {
  Platform,
  Pressable,
  PressableProps,
  StyleSheet,
  Text as RNText,
  TextProps,
  View,
  ViewStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors, TARGET, radius, space, type, useTheme } from '@/theme';

/* -------------------------------------------------------------------- Text */

type Tone = 'default' | 'secondary' | 'primary' | 'success' | 'danger' | 'warning' | 'onPrimary' | 'inherit';

export type AppTextProps = TextProps & {
  variant?: keyof typeof type;
  tone?: Tone;
  color?: string;
};

function toneColor(c: Colors, tone: Tone): string | undefined {
  switch (tone) {
    case 'secondary': return c.textSecondary;
    case 'primary': return c.primaryText;
    case 'success': return c.successText;
    case 'danger': return c.dangerText;
    case 'warning': return c.warningText;
    case 'onPrimary': return c.onPrimary;
    case 'inherit': return undefined;
    default: return c.text;
  }
}

/**
 * Every piece of text in the app goes through here, so no screen can invent a
 * size. allowFontScaling is left on — Dynamic Type is a requirement, not an
 * option — which is why nothing in this codebase uses a fixed `height`.
 */
export function Text({ variant = 'body', tone = 'default', color, style, ...rest }: AppTextProps) {
  const { c } = useTheme();
  return (
    <RNText
      style={[type[variant] as object, { color: color ?? toneColor(c, tone) }, style]}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------- Icon */
/*
 * One icon family, one weight. SF Symbols would be the iOS-native choice, but
 * a single vector family that renders identically on every target keeps stroke
 * weight and alignment consistent — which is the rule that actually matters
 * (MASTER.md §7). Ionicons' iOS-styled set is the closest match.
 */

export const ICONS = {
  check: 'checkmark',
  checkCircle: 'checkmark-circle',
  checkCircleOutline: 'checkmark-circle-outline',
  clock: 'time-outline',
  alert: 'warning-outline',
  alertFill: 'warning',
  skip: 'remove-circle-outline',
  box: 'file-tray-outline',
  boxFill: 'file-tray',
  boxDown: 'download-outline',
  pill: 'medkit-outline',
  calendar: 'calendar-outline',
  calendarFill: 'calendar',
  plus: 'add',
  minus: 'remove',
  gear: 'settings-outline',
  chevronRight: 'chevron-forward',
  chevronLeft: 'chevron-back',
  chevronDown: 'chevron-down',
  close: 'close',
  bell: 'notifications-outline',
  trash: 'trash-outline',
  share: 'share-outline',
  shield: 'shield-checkmark-outline',
  doc: 'document-text-outline',
  help: 'help-circle-outline',
  mail: 'mail-outline',
  info: 'information-circle-outline',
  filter: 'funnel-outline',
  list: 'list-outline',
  undo: 'arrow-undo-outline',
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 24,
  color,
  tone = 'default',
}: {
  name: IconName;
  size?: number;
  color?: string;
  tone?: Tone;
}) {
  const { c } = useTheme();
  return (
    <Ionicons
      name={ICONS[name] as never}
      size={size}
      color={color ?? toneColor(c, tone) ?? c.text}
      // Decorative by default: icons here always sit beside visible text.
      // Anything standalone gets its name from the control that wraps it.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

/* ------------------------------------------------------------------ Button */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'destructiveFilled';

export type ButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: ButtonVariant;
  block?: boolean;
  icon?: IconName;
  loading?: boolean;
  style?: ViewStyle;
};

export function Button({
  title,
  variant = 'primary',
  block,
  icon,
  loading,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const { c } = useTheme();
  const isDisabled = disabled || loading;

  const bg: Record<ButtonVariant, string> = {
    primary: c.primary,
    secondary: c.surfaceRaised,
    ghost: 'transparent',
    destructive: 'transparent',
    destructiveFilled: c.dangerText,
  };
  const fg: Record<ButtonVariant, string> = {
    primary: c.onPrimary,
    secondary: c.text,
    ghost: c.primaryText,
    destructive: c.dangerText,
    destructiveFilled: c.onDanger,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg[variant] },
        block && styles.btnBlock,
        // Press feedback never changes layout bounds — scaling a button that
        // shifts its neighbours reads as jitter, not as responsiveness.
        pressed && !isDisabled && { opacity: variant === 'ghost' || variant === 'destructive' ? 0.5 : 0.85 },
        isDisabled && styles.btnDisabled,
        style,
      ]}
      {...rest}
    >
      {icon ? <Icon name={icon} size={18} color={fg[variant]} /> : null}
      <Text variant="headline" color={fg[variant]} numberOfLines={2}>
        {loading ? 'Working…' : title}
      </Text>
    </Pressable>
  );
}

/* -------------------------------------------------------------- IconButton */

/**
 * A 44×44 target around a smaller glyph. The visual stays small; the hit area
 * does not. `label` is required — an icon-only control without an accessible
 * name is a CRITICAL failure, and making the prop optional invites one.
 */
export function IconButton({
  name,
  label,
  onPress,
  tone = 'primary',
  size = 24,
  disabled,
  selected,
}: {
  name: IconName;
  label: string;
  onPress?: () => void;
  tone?: Tone;
  size?: number;
  disabled?: boolean;
  selected?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, selected: !!selected }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.5 }, disabled && { opacity: 0.38 }]}
    >
      <Icon name={name} size={size} tone={tone} />
    </Pressable>
  );
}

/* --------------------------------------------------------------- Separator */

export function Separator({ inset = 0 }: { inset?: number }) {
  const { c } = useTheme();
  return <View style={[styles.sep, { backgroundColor: c.separator, marginLeft: inset }]} />;
}

/* ---------------------------------------------------------------- Stepper */

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  label,
  formatValue,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  formatValue?: (v: number) => string;
}) {
  const { c } = useTheme();
  const text = formatValue ? formatValue(value) : String(value);
  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
        accessibilityState={{ disabled: value <= min }}
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - step))}
        style={({ pressed }) => [
          styles.stepBtn,
          { backgroundColor: c.surfaceRaised },
          pressed && { opacity: 0.6 },
          value <= min && { opacity: 0.38 },
        ]}
      >
        <Icon name="minus" size={20} />
      </Pressable>
      <Text variant="headline" style={styles.stepVal} accessibilityLiveRegion="polite">
        {text}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
        accessibilityState={{ disabled: value >= max }}
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + step))}
        style={({ pressed }) => [
          styles.stepBtn,
          { backgroundColor: c.surfaceRaised },
          pressed && { opacity: 0.6 },
          value >= max && { opacity: 0.38 },
        ]}
      >
        <Icon name="plus" size={20} />
      </Pressable>
    </View>
  );
}

/* ------------------------------------------------------------- Segmented */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  const { c } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      style={[styles.segmented, { backgroundColor: c.surfaceRaised }]}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={o.label}
            onPress={() => onChange(o.value)}
            style={[styles.segment, on && { backgroundColor: c.surface }]}
          >
            <Text
              variant="subhead"
              tone={on ? 'default' : 'secondary'}
              style={on ? styles.segmentOn : undefined}
              numberOfLines={1}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ Switch */

export function Switch({ value, label }: { value: boolean; label: string }) {
  const { c } = useTheme();
  return (
    <View
      style={[
        styles.switch,
        { backgroundColor: value ? c.primary : c.surfaceRaised },
        !value && { borderWidth: 1, borderColor: c.separator },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[styles.knob, value && styles.knobOn]} />
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: TARGET,
    paddingHorizontal: space.s5,
    paddingVertical: space.s3,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.s2,
  },
  btnBlock: { minHeight: 50, alignSelf: 'stretch' },
  btnDisabled: { opacity: 0.38 },
  iconBtn: {
    minWidth: TARGET,
    minHeight: TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  sep: { height: StyleSheet.hairlineWidth * 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  stepBtn: {
    width: TARGET,
    height: TARGET,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepVal: { minWidth: 44, textAlign: 'center', fontVariant: ['tabular-nums'] },
  segmented: { flexDirection: 'row', borderRadius: radius.sm, padding: 2, gap: 2 },
  segment: {
    flex: 1,
    minHeight: TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm - 2,
    paddingHorizontal: space.s1,
  },
  segmentOn: { fontWeight: '600' },
  switch: { width: 51, height: 31, borderRadius: radius.full, justifyContent: 'center' },
  knob: {
    width: 27,
    height: 27,
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
    marginLeft: 2,
    ...Platform.select({
      ios: { shadowColor: '#061413', shadowOpacity: 0.25, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 2 },
      default: {},
    }),
  },
  knobOn: { marginLeft: 22 },
});
