import React, { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  DAYS,
  Dose,
  DayRollup,
  MONTHS,
  addDays,
  dateKey,
  dayRollup,
  dosesOn,
  formatTime,
  sameDay,
} from '@/domain/medication';
import { useStore } from '@/store';
import { useSheets } from '@/sheets';
import { TARGET, radius, space, useTheme } from '@/theme';
import { Icon, IconButton, Segmented, Text } from '@/components/primitives';
import {
  Card,
  EmptyState,
  ListGroup,
  ListRow,
  Screen,
  Section,
  SectionHeader,
} from '@/components/layout';
import { DoseRow } from '@/components/medication';

type Mode = 'month' | 'list';

export default function HistoryScreen() {
  const { c } = useTheme();
  const { meds, records, setDose, showToast } = useStore();
  const { confirm } = useSheets();

  const today = useMemo(() => new Date(), []);
  const [mode, setMode] = useState<Mode>('month');
  const [cursor, setCursor] = useState(() => new Date(today));
  const [selected, setSelected] = useState(() => new Date(today));
  const [filter, setFilter] = useState<string | null>(null);
  const [pickingFilter, setPickingFilter] = useState(false);

  const filterName = filter ? meds.find((m) => m.id === filter)?.name ?? 'All medicines' : 'All medicines';

  /* stats for the visible month */
  const stats = useMemo(() => {
    const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    let taken = 0, missed = 0, skipped = 0;
    for (let d = 1; d <= days; d++) {
      const date = new Date(cursor.getFullYear(), cursor.getMonth(), d);
      if (date > today) continue;
      for (const dose of dosesOn(meds, records, date, filter, today)) {
        if (dose.status === 'taken') taken++;
        else if (dose.status === 'missed') missed++;
        else if (dose.status === 'skipped') skipped++;
      }
    }
    const scheduled = taken + missed + skipped;
    return {
      taken, missed, skipped, days,
      adherence: scheduled ? Math.round((taken / scheduled) * 100) : null,
    };
  }, [cursor, meds, records, filter, today]);

  /**
   * Changing a past record asks first. Unlike today's doses, where a mis-tap is
   * obvious immediately, a wrong edit to last Tuesday is invisible afterwards.
   */
  const editPast = (dose: Dose) => {
    const willTake = dose.status !== 'taken';
    confirm({
      title: willTake ? 'Mark as taken?' : 'Mark as missed?',
      body: `${dose.med.name} at ${formatTime(dose.time)} on ${DAYS[dose.date.getDay()]} ${dose.date.getDate()} ${MONTHS[dose.date.getMonth()]}. This changes a past record in your history.`,
      confirmLabel: willTake ? 'Mark taken' : 'Mark missed',
      destructive: !willTake,
      onConfirm: () => {
        setDose(dose.id, willTake ? 'taken' : 'missed');
        showToast({ message: `${dose.med.name} updated` });
      },
    });
  };

  const actions = (
    <IconButton name="gear" label="Settings" tone="default" onPress={() => router.push('/settings')} />
  );

  if (!meds.length) {
    return (
      <Screen title="History" actions={actions}>
        <EmptyState
          icon="calendar"
          title="No history yet"
          body="Doses you record will appear here."
        />
      </Screen>
    );
  }

  return (
    <Screen title="History" actions={actions}>
      <Section style={styles.tight}>
        <Segmented
          label="History view"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'month', label: 'Month' },
            { value: 'list', label: 'List' },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Filter by medicine. Currently ${filterName}`}
          onPress={() => setPickingFilter((v) => !v)}
          style={({ pressed }) => [
            styles.filter,
            { backgroundColor: c.surface },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Icon name="filter" size={18} tone="secondary" />
          <Text variant="body" style={styles.flex1}>{filterName}</Text>
          <Icon name="chevronDown" size={18} tone="secondary" />
        </Pressable>

        {pickingFilter ? (
          <ListGroup style={styles.filterList}>
            {[{ id: null as string | null, name: 'All medicines' }, ...meds].map((m) => (
              <ListRow
                key={m.id ?? 'all'}
                title={m.name}
                accessibilityState={{ selected: filter === m.id }}
                onPress={() => {
                  setFilter(m.id);
                  setPickingFilter(false);
                }}
                accessory={filter === m.id ? <Icon name="check" size={18} tone="primary" /> : undefined}
              />
            ))}
          </ListGroup>
        ) : null}
      </Section>

      <Section>
        <SectionHeader title={`${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`} />
        <ListGroup>
          <ListRow title="Adherence" value={stats.adherence == null ? 'No data' : `${stats.adherence}%`} />
          <ListRow title="Taken" icon="checkCircle" value={String(stats.taken)} />
          <ListRow title="Missed" icon="alert" value={String(stats.missed)} />
          <ListRow title="Skipped" icon="skip" value={String(stats.skipped)} />
        </ListGroup>
      </Section>

      {mode === 'month' ? (
        <MonthBlock
          cursor={cursor}
          setCursor={setCursor}
          selected={selected}
          setSelected={setSelected}
          today={today}
          filter={filter}
          onEditPast={editPast}
        />
      ) : (
        <ListBlock today={today} filter={filter} onEditPast={editPast} />
      )}
    </Screen>
  );
}

/* ------------------------------------------------------------ month view */

/**
 * Every cell carries a SHAPE as well as a tint. A month rendered in red and
 * green alone is unreadable to roughly one man in twelve, and this grid is the
 * whole point of the screen.
 */
const SHAPE: Record<DayRollup, 'full' | 'half' | 'ring' | 'slash' | null> = {
  taken: 'full',
  partial: 'half',
  missed: 'ring',
  skipped: 'slash',
  future: null,
  none: null,
};

const ROLLUP_WORD: Record<DayRollup, string> = {
  taken: 'all taken',
  partial: 'partly taken',
  missed: 'missed',
  skipped: 'skipped',
  future: 'scheduled',
  none: 'no data',
};

function MonthBlock({
  cursor, setCursor, selected, setSelected, today, filter, onEditPast,
}: {
  cursor: Date;
  setCursor: (d: Date) => void;
  selected: Date;
  setSelected: (d: Date) => void;
  today: Date;
  filter: string | null;
  onEditPast: (d: Dose) => void;
}) {
  const { c } = useTheme();
  const { meds, records } = useStore();

  const monthDays = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const firstCol = (new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay() + 6) % 7;

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstCol; i++) cells.push(<View key={`b${i}`} style={styles.cell} />);
  for (let d = 1; d <= monthDays; d++) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth(), d);
    const roll = dayRollup(meds, records, date, filter, today);
    const isToday = sameDay(date, today);
    const isSel = sameDay(date, selected);
    const tint = {
      taken: c.successTint, partial: c.warningTint, missed: c.dangerTint,
      skipped: c.mutedTint, future: 'transparent', none: 'transparent',
    }[roll];
    const fg = {
      taken: c.successOnTint, partial: c.warningOnTint, missed: c.dangerOnTint,
      skipped: c.mutedText, future: c.textSecondary, none: c.textSecondary,
    }[roll];
    const shape = SHAPE[roll];

    cells.push(
      <Pressable
        key={dateKey(date)}
        accessibilityRole="button"
        accessibilityState={{ selected: isSel }}
        accessibilityLabel={`${d} ${MONTHS[cursor.getMonth()]}, ${ROLLUP_WORD[roll]}${isToday ? ', today' : ''}`}
        onPress={() => setSelected(date)}
        style={[
          styles.cell,
          { backgroundColor: tint },
          isToday && !isSel && { borderWidth: 2, borderColor: c.primaryText },
          isSel && { borderWidth: 2, borderColor: c.primaryText },
        ]}
      >
        <Text variant="subhead" color={fg} style={styles.cellNum}>{d}</Text>
        <View style={styles.shapeSlot}>
          {shape === 'full' ? <View style={[styles.shape, { backgroundColor: fg }]} /> : null}
          {shape === 'half' ? (
            <View style={[styles.shape, styles.shapeRing, { borderColor: fg }]}>
              <View style={[styles.shapeHalf, { backgroundColor: fg }]} />
            </View>
          ) : null}
          {shape === 'ring' ? <View style={[styles.shape, styles.shapeRing, { borderColor: fg }]} /> : null}
          {shape === 'slash' ? <View style={[styles.slash, { backgroundColor: fg }]} /> : null}
        </View>
      </Pressable>,
    );
  }

  const selList = dosesOn(meds, records, selected, filter, today);
  const selRoll = dayRollup(meds, records, selected, filter, today);
  const isFuture = selected > today && !sameDay(selected, today);

  return (
    <>
      <Section>
        <Card>
          <View style={styles.monthNav}>
            <IconButton
              name="chevronLeft"
              label="Previous month"
              tone="default"
              onPress={() => {
                const d = new Date(cursor);
                d.setMonth(d.getMonth() - 1);
                setCursor(d);
              }}
            />
            <Text variant="headline" style={styles.monthLabel}>
              {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
            </Text>
            <IconButton
              name="chevronRight"
              label="Next month"
              tone="default"
              onPress={() => {
                const d = new Date(cursor);
                d.setMonth(d.getMonth() + 1);
                setCursor(d);
              }}
            />
          </View>

          <View style={styles.grid} accessibilityElementsHidden>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((h, i) => (
              <Text key={i} variant="caption" tone="secondary" style={styles.head}>{h}</Text>
            ))}
          </View>
          <View style={styles.grid}>{cells}</View>

          <View style={[styles.legend, { borderTopColor: c.separator }]}>
            <LegendItem shape="full" color={c.successText} label="All taken" />
            <LegendItem shape="half" color={c.warningText} label="Partly" />
            <LegendItem shape="ring" color={c.dangerText} label="Missed" />
            <LegendItem shape="slash" color={c.mutedText} label="Skipped" />
          </View>
        </Card>
      </Section>

      <Section>
        <SectionHeader
          title={`${DAYS[selected.getDay()]} ${selected.getDate()} ${MONTHS[selected.getMonth()]}`}
          trailing={
            { taken: 'All taken', partial: 'Partly taken', missed: 'All missed',
              skipped: 'All skipped', future: 'Scheduled', none: 'No data' }[selRoll]
          }
        />
        {selList.length ? (
          <ListGroup footer={isFuture ? 'Scheduled — not yet due.' : undefined}>
            {selList.map((d) => (
              <DoseRow
                key={d.id}
                dose={d}
                editable={!isFuture}
                onToggle={sameDay(selected, today) ? undefined : onEditPast}
              />
            ))}
          </ListGroup>
        ) : (
          <Card>
            <Text variant="subhead" tone="secondary">No doses recorded for this day.</Text>
          </Card>
        )}
      </Section>
    </>
  );
}

function LegendItem({
  shape, color, label,
}: { shape: 'full' | 'half' | 'ring' | 'slash'; color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      {shape === 'full' ? <View style={[styles.shape, { backgroundColor: color }]} /> : null}
      {shape === 'half' ? (
        <View style={[styles.shape, styles.shapeRing, { borderColor: color }]}>
          <View style={[styles.shapeHalf, { backgroundColor: color }]} />
        </View>
      ) : null}
      {shape === 'ring' ? <View style={[styles.shape, styles.shapeRing, { borderColor: color }]} /> : null}
      {shape === 'slash' ? <View style={[styles.slash, { backgroundColor: color }]} /> : null}
      <Text variant="footnote" tone="secondary">{label}</Text>
    </View>
  );
}

/* ------------------------------------------------------------- list view */

function ListBlock({
  today, filter, onEditPast,
}: { today: Date; filter: string | null; onEditPast: (d: Dose) => void }) {
  const { meds, records } = useStore();
  const groups: React.ReactNode[] = [];

  for (let back = 0; back < 14; back++) {
    const date = addDays(today, -back);
    const list = dosesOn(meds, records, date, filter, today);
    if (!list.length) continue;
    const taken = list.filter((d) => d.status === 'taken').length;
    groups.push(
      <Section key={dateKey(date)}>
        <SectionHeader
          title={
            back === 0 ? 'Today'
              : back === 1 ? 'Yesterday'
              : `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`
          }
          trailing={`${taken} of ${list.length} taken`}
        />
        <ListGroup>
          {list.map((d) => (
            <DoseRow key={d.id} dose={d} onToggle={back === 0 ? undefined : onEditPast} />
          ))}
        </ListGroup>
      </Section>,
    );
  }

  if (!groups.length) {
    return (
      <EmptyState icon="calendar" title="No history yet" body="Doses you record will appear here." />
    );
  }
  return <>{groups}</>;
}

const styles = StyleSheet.create({
  tight: { paddingTop: space.s3, gap: space.s3 },
  flex1: { flex: 1 },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    minHeight: TARGET,
    paddingHorizontal: space.s4,
    borderRadius: radius.md,
  },
  filterList: { marginTop: space.s2 },
  monthNav: { flexDirection: 'row', alignItems: 'center', paddingBottom: space.s3 },
  monthLabel: { flex: 1, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  head: { width: `${100 / 7}%`, textAlign: 'center', paddingBottom: space.s2, fontWeight: '600' },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    minHeight: TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    gap: 2,
  },
  cellNum: { fontWeight: '600', fontVariant: ['tabular-nums'] },
  shapeSlot: { height: 7, justifyContent: 'center' },
  shape: { width: 6, height: 6, borderRadius: 3 },
  shapeRing: { borderWidth: 1.5, backgroundColor: 'transparent', overflow: 'hidden' },
  shapeHalf: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%' },
  slash: { width: 7, height: 1.5, transform: [{ rotate: '-45deg' }] },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.s3,
    marginTop: space.s4,
    paddingTop: space.s3,
    borderTopWidth: 1,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.s1 },
});
