import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { daysLeft, plural, supplyBand } from '@/domain/medication';
import { useStore } from '@/store';
import { useSheets } from '@/sheets';
import { GUTTER, space, useTheme } from '@/theme';
import { Button, IconButton, Text } from '@/components/primitives';
import { EmptyState, Screen, Section } from '@/components/layout';
import { MedicationCard } from '@/components/medication';

const RANK: Record<ReturnType<typeof supplyBand>, number> = {
  critical: 0,
  low: 1,
  healthy: 2,
  untracked: 3,
};

export default function SupplyScreen() {
  const { c } = useTheme();
  const { meds, hydrated } = useStore();
  const { openAdd, openRefill } = useSheets();

  /* Urgency, not alphabetical. What needs action is always at the top. */
  const sorted = useMemo(
    () =>
      [...meds].sort((a, b) => {
        const r = RANK[supplyBand(a)] - RANK[supplyBand(b)];
        if (r !== 0) return r;
        return (daysLeft(a) ?? Infinity) - (daysLeft(b) ?? Infinity);
      }),
    [meds],
  );

  const actions = <IconButton name="plus" label="Add medicine" onPress={() => openAdd()} />;

  if (hydrated && !meds.length) {
    return (
      <Screen title="Supply" actions={actions}>
        <EmptyState
          icon="box"
          title="No medicines tracked"
          body="Add a medicine to track how much you have left."
          action={<Button title="Add medicine" onPress={() => openAdd()} />}
        />
      </Screen>
    );
  }

  const critical = sorted.filter((m) => supplyBand(m) === 'critical');
  const low = sorted.filter((m) => supplyBand(m) === 'low');

  /*
   * Red on the headline is reserved for genuinely critical. The predecessor
   * turned the whole headline red whenever anything was merely low, which
   * spends the loudest signal the screen has on a non-event.
   */
  let headline = 'All medicines stocked';
  let headlineColor: string | undefined;
  if (critical.length) {
    headline = `${critical[0].name} runs out in ${plural(daysLeft(critical[0]) ?? 0, 'day', 'days')}`;
    headlineColor = c.dangerText;
  } else if (low.length) {
    headline = `${plural(low.length, 'medicine', 'medicines')} running low`;
  }

  return (
    <Screen title="Supply" actions={actions}>
      <Text variant="title1" color={headlineColor} style={styles.headline}>
        {headline}
      </Text>

      <Section style={styles.list}>
        {sorted.map((med) => (
          <MedicationCard
            key={med.id}
            med={med}
            onRefill={() => openRefill(med.id)}
            onEdit={() => openAdd(med)}
          />
        ))}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headline: { paddingHorizontal: GUTTER, paddingBottom: space.s2 },
  list: { paddingTop: space.s4 },
});
