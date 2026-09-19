import React, { useMemo } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  DAYS,
  Dose,
  MONTHS,
  daysLeft,
  dosesOn,
  formatRelative,
  formatTime,
  minutesUntil,
  nextDose,
  plural,
  supplyBand,
} from '@/domain/medication';
import { useStore } from '@/store';
import { useSheets } from '@/sheets';
import { GUTTER, radius, space, useTheme } from '@/theme';
import { Button, Icon, IconButton, Text } from '@/components/primitives';
import { Card, EmptyState, ListGroup, Screen, Section, SectionHeader } from '@/components/layout';
import { DoseRow, ProgressRing, StatusBadge } from '@/components/medication';

export default function TodayScreen() {
  const { c } = useTheme();
  const { meds, records, settings, hydrated, setDose, showToast } = useStore();
  const { openAdd, openRefill } = useSheets();

  const now = useMemo(() => new Date(), [records, meds]);
  const list = useMemo(() => dosesOn(meds, records, now, null, now), [meds, records, now]);

  const takenCount = list.filter((d) => d.status === 'taken').length;
  const missed = list.filter((d) => d.status === 'missed');
  const lowMeds = meds.filter((m) => ['low', 'critical'].includes(supplyBand(m)));
  const next = nextDose(list);

  const actions = (
    <>
      <IconButton name="plus" label="Add medicine" onPress={() => openAdd()} />
      <IconButton name="gear" label="Settings" tone="default" onPress={() => router.push('/settings')} />
    </>
  );

  /* Hydration gate: never flash "no medicines yet" at somebody who has twelve. */
  if (!hydrated) {
    return (
      <Screen title="Today" actions={actions}>
        <Section>
          <View style={[styles.skeleton, { backgroundColor: c.surfaceRaised }]} />
          <View style={[styles.skeleton, { backgroundColor: c.surfaceRaised }]} />
        </Section>
      </Screen>
    );
  }

  if (!meds.length) {
    return (
      <Screen title="Today" actions={actions}>
        <EmptyState
          icon="pill"
          title="No medicines yet"
          body="Add your first medicine to start tracking doses and supply."
          action={<Button title="Add medicine" onPress={() => openAdd()} />}
        />
      </Screen>
    );
  }

  const toggle = (dose: Dose) => {
    const wasTaken = dose.status === 'taken';
    const previous = dose.record?.status ?? null;
    setDose(dose.id, wasTaken ? null : 'taken');
    showToast({
      message: wasTaken
        ? `${dose.med.name} — dose cleared`
        : `${dose.med.name} taken · ${formatTime(dose.time)}`,
      undo: () => setDose(dose.id, previous, { silent: true }),
    });
  };

  const skip = (dose: Dose) => {
    const previous = dose.record?.status ?? null;
    setDose(dose.id, 'skipped');
    showToast({
      message: `${dose.med.name} skipped · ${formatTime(dose.time)}`,
      undo: () => setDose(dose.id, previous, { silent: true }),
    });
  };

  const worst = lowMeds.find((m) => supplyBand(m) === 'critical') ?? lowMeds[0];
  const anyCritical = lowMeds.some((m) => supplyBand(m) === 'critical');

  return (
    <Screen title="Today" actions={actions}>
      {/* Q3: what have I already taken? */}
      <View style={styles.ringRow}>
        <ProgressRing taken={takenCount} total={list.length} />
        <View style={styles.flex1}>
          <Text variant="title3" style={styles.tnum} accessibilityElementsHidden>
            {takenCount} of {list.length} doses
          </Text>
          <Text variant="footnote" tone="secondary">
            {DAYS[now.getDay()]} {now.getDate()} {MONTHS[now.getMonth()]}
          </Text>
          <Text variant="footnote" style={styles.srOnly} accessibilityRole="summary">
            {takenCount} of {list.length} doses taken today.
          </Text>
        </View>
      </View>

      {/* Q1, Q2, Q5: what next, when, and what do I do now. Emphasis, not alarm —
          an overdue dose keeps the calm teal tint and gains a badge. */}
      {next ? (
        <Card tone="emphasis" style={styles.next}>
          <Text variant="caption" color={c.primaryOnTint} style={styles.nextLabel}>
            NEXT DOSE
          </Text>
          <Text variant="title2" style={styles.nextName}>
            {next.med.name}
          </Text>
          <Text variant="subhead" tone="secondary">
            {[next.med.dose, next.med.instruction].filter(Boolean).join(' · ')}
          </Text>
          <View style={styles.nextTime}>
            <Text variant="title3" style={styles.tnum}>
              {formatTime(next.time)}
            </Text>
            <Text variant="subhead" tone="secondary">
              {formatRelative(minutesUntil(next.time, now))}
            </Text>
            {next.status === 'due' ? <StatusBadge status="due" /> : null}
          </View>
          <View style={styles.nextActions}>
            <Button
              title="Take"
              style={styles.flex1}
              onPress={() => toggle(next)}
              accessibilityLabel={`Take ${next.med.name}, ${next.med.dose}, scheduled ${formatTime(next.time)}`}
            />
            <Button
              title="Skip"
              variant="secondary"
              onPress={() => skip(next)}
              accessibilityLabel={`Skip ${next.med.name} at ${formatTime(next.time)}`}
            />
          </View>
        </Card>
      ) : null}

      {/* Q4: did I miss anything. Kept separate from supply — one red thing at
          a time, each saying what it actually is. */}
      {missed.length ? (
        <Section>
          <Card tone="danger">
            <Text variant="headline" color={c.dangerOnTint}>
              {plural(missed.length, 'dose', 'doses')} missed today
            </Text>
            <Text variant="footnote" color={c.dangerOnTint}>
              {missed.map((d) => `${d.med.name} at ${formatTime(d.time)}`).join(', ')}
            </Text>
          </Card>
        </Section>
      ) : null}

      {worst ? (
        <Section>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Refill ${worst.name}. ${plural(worst.pills ?? 0, 'pill', 'pills')} left, about ${plural(daysLeft(worst) ?? 0, 'day', 'days')}`}
            onPress={() => openRefill(worst.id)}
            style={({ pressed }) => [
              styles.supplyBanner,
              { backgroundColor: anyCritical ? c.dangerTint : c.warningTint },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Icon
              name={anyCritical ? 'alert' : 'boxDown'}
              size={22}
              color={anyCritical ? c.dangerOnTint : c.warningOnTint}
            />
            <View style={styles.flex1}>
              <Text variant="headline" color={anyCritical ? c.dangerOnTint : c.warningOnTint}>
                {worst.name} — {plural(worst.pills ?? 0, 'pill', 'pills')} left
              </Text>
              <Text variant="footnote" color={anyCritical ? c.dangerOnTint : c.warningOnTint}>
                About {plural(daysLeft(worst) ?? 0, 'day', 'days')} left
                {lowMeds.length > 1 ? ` · ${lowMeds.length - 1} more low` : ''}
              </Text>
            </View>
            <Icon
              name="chevronRight"
              size={18}
              color={anyCritical ? c.dangerOnTint : c.warningOnTint}
            />
          </Pressable>
        </Section>
      ) : null}

      <Section>
        <SectionHeader title="Schedule" />
        {list.length ? (
          <ListGroup
            footer={takenCount === list.length ? 'All doses taken today.' : undefined}
          >
            {list.map((d) => (
              <DoseRow key={d.id} dose={d} onToggle={toggle} />
            ))}
          </ListGroup>
        ) : (
          <Card>
            <Text variant="subhead" tone="secondary">Nothing scheduled today.</Text>
          </Card>
        )}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  tnum: { fontVariant: ['tabular-nums'] },
  srOnly: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 },
  skeleton: { height: 92, borderRadius: radius.md, marginBottom: space.s3 },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s4,
    paddingHorizontal: GUTTER,
    paddingTop: space.s3,
  },
  next: { marginHorizontal: GUTTER, marginTop: space.s4 },
  nextLabel: { fontWeight: '700', letterSpacing: 0.6 },
  nextName: { marginTop: space.s2 },
  nextTime: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space.s2,
    marginTop: space.s3,
  },
  nextActions: { flexDirection: 'row', gap: space.s2, marginTop: space.s4 },
  supplyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    padding: space.s4,
    borderRadius: radius.md,
  },
});
