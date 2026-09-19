import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import {
  Dose,
  DoseStatus,
  Medication,
  daysLeft,
  dosesPerDay,
  formatTime,
  plural,
  supplyBand,
} from '@/domain/medication';
import { SUPPLY_SCALE_DAYS, TARGET, radius, space, useTheme } from '@/theme';
import { Icon, IconName, Text } from './primitives';

/* ------------------------------------------------------- MedicationStatus */
/*
 * Colour, icon and word for every state. Nothing in the app renders a status
 * from colour alone — MASTER.md §2.4. "Upcoming" and "Skipped" deliberately
 * share a colour and are told apart by icon and word, which keeps the palette
 * from sprawling into six hues.
 */

type StatusMeta = { word: string; icon: IconName; filled: boolean };

export const STATUS: Record<DoseStatus, StatusMeta> = {
  taken: { word: 'Taken', icon: 'checkCircle', filled: true },
  due: { word: 'Due now', icon: 'clock', filled: false },
  upcoming: { word: 'Upcoming', icon: 'clock', filled: false },
  missed: { word: 'Missed', icon: 'alert', filled: false },
  skipped: { word: 'Skipped', icon: 'skip', filled: false },
};

export function useStatusColors(status: DoseStatus) {
  const { c } = useTheme();
  switch (status) {
    case 'taken': return { fg: c.successOnTint, bg: c.successTint };
    case 'due': return { fg: c.primaryOnTint, bg: c.primaryTint };
    case 'missed': return { fg: c.dangerOnTint, bg: c.dangerTint };
    case 'skipped': return { fg: c.mutedText, bg: c.mutedTint };
    default: return { fg: c.mutedText, bg: c.mutedTint };
  }
}

/* ------------------------------------------------------------- StatusBadge */

export function StatusBadge({ status }: { status: DoseStatus }) {
  const meta = STATUS[status];
  const { fg, bg } = useStatusColors(status);
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Icon name={meta.icon} size={13} color={fg} />
      <Text variant="caption" color={fg} style={styles.badgeText}>
        {meta.word}
      </Text>
    </View>
  );
}

export function SupplyBadge({ med }: { med: Medication }) {
  const band = supplyBand(med);
  const { c } = useTheme();
  if (band === 'critical') {
    return (
      <View style={[styles.badge, { backgroundColor: c.dangerTint }]}>
        <Icon name="alert" size={13} color={c.dangerOnTint} />
        <Text variant="caption" color={c.dangerOnTint} style={styles.badgeText}>Critical</Text>
      </View>
    );
  }
  if (band === 'low') {
    return (
      <View style={[styles.badge, { backgroundColor: c.warningTint }]}>
        <Icon name="boxDown" size={13} color={c.warningOnTint} />
        <Text variant="caption" color={c.warningOnTint} style={styles.badgeText}>Low</Text>
      </View>
    );
  }
  return null;
}

/* ----------------------------------------------------------------- DoseRow */

/**
 * The core repeating unit. The status control is a 44×44 target wrapping a
 * 28px circle — the prototype's predecessor used a bare 28px hit area, which
 * is both under target and easy to catch while scrolling.
 *
 * Taken rows keep full text contrast. Greying and striking through a taken
 * medicine name pushes it below comfortable reading for exactly the users most
 * likely to have already taken it; the check and the timestamp carry the state.
 */
export function DoseRow({
  dose,
  onToggle,
  editable = true,
}: {
  dose: Dose;
  onToggle?: (dose: Dose) => void;
  editable?: boolean;
}) {
  const { c } = useTheme();
  const meta = STATUS[dose.status];
  const { fg, bg } = useStatusColors(dose.status);
  const taken = dose.status === 'taken';
  const stamp = taken && dose.record?.at ? `Taken ${formatTime(dose.record.at)}` : null;
  const sub = [dose.med.dose, dose.med.instruction].filter(Boolean).join(' · ');

  const label =
    `${dose.med.name}, ${dose.med.dose}, ${formatTime(dose.time)}, ${meta.word}` +
    (stamp && dose.record?.at ? ` at ${formatTime(dose.record.at)}` : '');

  return (
    <View style={styles.dose}>
      <Text variant="subhead" tone="secondary" style={styles.doseTime}>
        {formatTime(dose.time)}
      </Text>
      <View style={styles.doseMain}>
        <Text variant="headline">{dose.med.name}</Text>
        {sub ? (
          <Text variant="subhead" tone="secondary" style={styles.doseSub}>
            {sub}
          </Text>
        ) : null}
        <View style={styles.doseMeta}>
          <StatusBadge status={dose.status} />
          {stamp ? (
            <Text variant="footnote" tone="secondary" style={styles.tnum}>
              {stamp}
            </Text>
          ) : null}
        </View>
      </View>

      {editable && onToggle ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ checked: taken }}
          accessibilityLabel={label}
          accessibilityHint={taken ? 'Marks this dose as not taken' : 'Records this dose as taken'}
          onPress={() => onToggle(dose)}
          hitSlop={6}
          style={({ pressed }) => [styles.statusBtn, pressed && { opacity: 0.6 }]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: taken || dose.status === 'missed' || dose.status === 'skipped' ? bg : 'transparent' },
              (dose.status === 'due' || dose.status === 'upcoming') && {
                borderWidth: 2,
                borderColor: dose.status === 'due' ? c.primaryText : c.separator,
              },
            ]}
          >
            {taken ? <Icon name="check" size={16} color={fg} /> : null}
            {dose.status === 'missed' ? <Icon name="alert" size={15} color={fg} /> : null}
            {dose.status === 'skipped' ? <Icon name="skip" size={15} color={fg} /> : null}
          </View>
        </Pressable>
      ) : (
        <View style={styles.statusBtn} accessibilityElementsHidden>
          <View style={[styles.statusDot, { backgroundColor: bg }]} />
        </View>
      )}
    </View>
  );
}

/* --------------------------------------------------------- SupplyIndicator */

/**
 * Days remaining on a fixed 30-day scale, so bars compare between medicines.
 * The predecessor filled the bar as a fraction of a stored "capacity" that
 * drifted on every refill and meant nothing to the person reading it.
 */
export function SupplyIndicator({ med }: { med: Medication }) {
  const { c } = useTheme();
  const band = supplyBand(med);
  const d = daysLeft(med);

  if (band === 'untracked' || d == null || med.pills == null) {
    return (
      <Text variant="subhead" tone="secondary" style={styles.supplyDays}>
        Supply not tracked
      </Text>
    );
  }

  const pct = Math.max(3, Math.min(100, Math.round((d / SUPPLY_SCALE_DAYS) * 100)));
  const fill = band === 'critical' ? c.dangerText : band === 'low' ? c.warningText : c.primary;

  return (
    <View>
      <View style={styles.supplyFigures}>
        <Text variant="title2" style={styles.tnum}>
          {plural(med.pills, 'pill', 'pills')}
        </Text>
        <Text variant="subhead" tone="secondary">
          about {plural(d, 'day', 'days')} left
        </Text>
      </View>
      <View
        style={[styles.bar, { backgroundColor: c.surfaceRaised }]}
        accessibilityRole="progressbar"
        accessibilityLabel={`${plural(d, 'day', 'days')} of supply remaining`}
        accessibilityValue={{ min: 0, max: SUPPLY_SCALE_DAYS, now: Math.min(d, SUPPLY_SCALE_DAYS) }}
      >
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: fill }]} />
      </View>
    </View>
  );
}

/* ---------------------------------------------------------- MedicationCard */

export function MedicationCard({
  med,
  onRefill,
  onEdit,
}: {
  med: Medication;
  onRefill: () => void;
  onEdit: () => void;
}) {
  const { c } = useTheme();
  const band = supplyBand(med);
  return (
    <View
      style={[
        styles.medCard,
        { backgroundColor: c.surface },
        band === 'critical' && { borderLeftWidth: 3, borderLeftColor: c.dangerText },
      ]}
    >
      <View style={styles.medHead}>
        <View style={styles.medHeadMain}>
          <Text variant="headline">{med.name}</Text>
          <Text variant="subhead" tone="secondary" style={styles.doseSub}>
            {med.dose} · {plural(dosesPerDay(med), 'dose', 'doses')} daily
          </Text>
        </View>
        <SupplyBadge med={med} />
      </View>

      <View style={styles.medSupply}>
        <SupplyIndicator med={med} />
      </View>

      <View style={styles.medActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Refill ${med.name}`}
          onPress={onRefill}
          style={({ pressed }) => [
            styles.medBtn,
            { backgroundColor: c.surfaceRaised },
            pressed && { opacity: 0.6 },
          ]}
        >
          <Text variant="headline">Refill</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${med.name}`}
          onPress={onEdit}
          style={({ pressed }) => [styles.medBtn, pressed && { opacity: 0.5 }]}
        >
          <Text variant="headline" tone="primary">Edit</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* -------------------------------------------------------- ProgressIndicator */

export function ProgressRing({ taken, total }: { taken: number; total: number }) {
  const { c } = useTheme();
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const pct = total ? taken / total : 0;
  return (
    <Svg width={56} height={56} accessibilityElementsHidden>
      <Circle cx={28} cy={28} r={r} stroke={c.surfaceRaised} strokeWidth={5} fill="none" />
      <Circle
        cx={28}
        cy={28}
        r={r}
        stroke={c.primaryText}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={circumference * (1 - pct)}
        transform={`rotate(-90 28 28)`}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s1,
    paddingHorizontal: space.s2,
    paddingVertical: 3,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
  },
  badgeText: { fontWeight: '600' },
  tnum: { fontVariant: ['tabular-nums'] },

  dose: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.s3,
    paddingHorizontal: space.s4,
    paddingVertical: space.s3,
  },
  doseTime: { width: 72, fontWeight: '500', fontVariant: ['tabular-nums'] },
  doseMain: { flex: 1, minWidth: 0 },
  doseSub: { marginTop: 2 },
  doseMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.s2, marginTop: space.s2 },
  statusBtn: { minWidth: TARGET, minHeight: TARGET, alignItems: 'center', justifyContent: 'center' },
  statusDot: { width: 28, height: 28, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },

  supplyFigures: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: space.s2, marginTop: space.s3 },
  supplyDays: { marginTop: space.s3 },
  bar: { height: 8, borderRadius: radius.full, overflow: 'hidden', marginTop: space.s3 },
  barFill: { height: '100%', borderRadius: radius.full },

  medCard: { borderRadius: radius.md, padding: space.s4, marginBottom: space.s3 },
  medHead: { flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap', gap: space.s2 },
  medHeadMain: { flex: 1, minWidth: 0 },
  medSupply: {},
  medActions: { flexDirection: 'row', alignItems: 'center', gap: space.s2, marginTop: space.s4 },
  medBtn: {
    minHeight: TARGET,
    paddingHorizontal: space.s5,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
