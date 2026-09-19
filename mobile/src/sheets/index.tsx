import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import {
  FREQ_PRESETS,
  Medication,
  daysLeft,
  dosesPerDay,
  formatTime,
  plural,
} from '@/domain/medication';
import { permissionStatus, requestPermission } from '@/domain/notifications';
import { useStore } from '@/store';
import { TARGET, radius, space, useTheme } from '@/theme';
import { Button, Icon, Segmented, Stepper, Text } from '@/components/primitives';
import { Card, ListGroup, ListRow } from '@/components/layout';
import { SupplyIndicator } from '@/components/medication';
import { ConfirmationSheet, Sheet } from '@/components/sheet';

/* ------------------------------------------------------------------ host */

type ConfirmSpec = {
  title: string;
  body: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
};

type SheetApi = {
  openAdd: (med?: Medication) => void;
  openRefill: (medId: string) => void;
  confirm: (spec: ConfirmSpec) => void;
};

const SheetContext = createContext<SheetApi | null>(null);

export function useSheets(): SheetApi {
  const v = useContext(SheetContext);
  if (!v) throw new Error('useSheets must be used inside <SheetHost>');
  return v;
}

export function SheetHost({ children }: { children: React.ReactNode }) {
  const [addFor, setAddFor] = useState<Medication | null | undefined>(undefined);
  const [refillId, setRefillId] = useState<string | null>(null);
  const [confirmSpec, setConfirmSpec] = useState<ConfirmSpec | null>(null);

  const api = useMemo<SheetApi>(
    () => ({
      openAdd: (med) => setAddFor(med ?? null),
      openRefill: (medId) => setRefillId(medId),
      confirm: (spec) => setConfirmSpec(spec),
    }),
    [],
  );

  return (
    <SheetContext.Provider value={api}>
      {children}
      {addFor !== undefined ? (
        <AddMedicationSheet med={addFor} onClose={() => setAddFor(undefined)} />
      ) : null}
      {refillId ? <RefillSheet medId={refillId} onClose={() => setRefillId(null)} /> : null}
      <ConfirmationSheet
        visible={!!confirmSpec}
        title={confirmSpec?.title ?? ''}
        body={confirmSpec?.body ?? ''}
        confirmLabel={confirmSpec?.confirmLabel ?? 'Confirm'}
        destructive={confirmSpec?.destructive}
        onConfirm={() => {
          const spec = confirmSpec;
          setConfirmSpec(null);
          spec?.onConfirm();
        }}
        onCancel={() => setConfirmSpec(null)}
      />
    </SheetContext.Provider>
  );
}

/* ----------------------------------------------------- AddMedicationSheet */

type Form = {
  name: string;
  dose: string;
  instruction: string;
  freq: number | 'custom';
  times: string[];
  remindersOn: boolean;
  lead: number;
  pills: string;
  threshold: string;
};

const STEP_TITLES = ['Medicine', 'Schedule', 'Reminders', 'Supply'];

/**
 * Four steps, one decision each, so nobody faces ten empty fields at once.
 * Only the name is truly required — a medicine you cannot name is not a
 * medicine, but everything else has a sensible default and can be revisited.
 */
function AddMedicationSheet({ med, onClose }: { med: Medication | null; onClose: () => void }) {
  const { c } = useTheme();
  const { saveMedication, deleteMedication, showToast, settings } = useStore();
  const { confirm } = useSheets();
  const editing = !!med;

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [pickingTime, setPickingTime] = useState<number | null>(null);
  const [notifDenied, setNotifDenied] = useState(false);

  const [form, setForm] = useState<Form>(() => {
    if (med) {
      const preset = Object.entries(FREQ_PRESETS).find(
        ([, times]) => times.join() === med.times.join(),
      );
      return {
        name: med.name,
        dose: med.dose,
        instruction: med.instruction,
        freq: preset ? Number(preset[0]) : 'custom',
        times: [...med.times],
        remindersOn: med.remindersOn,
        lead: med.lead,
        pills: med.pills == null ? '' : String(med.pills),
        threshold: String(med.threshold),
      };
    }
    return {
      name: '', dose: '', instruction: '',
      freq: 2, times: [...FREQ_PRESETS[2]],
      remindersOn: true, lead: 0, pills: '', threshold: '',
    };
  });

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = (s: number): boolean => {
    const e: typeof errors = {};
    if (s === 0 && !form.name.trim()) {
      e.name = 'Give the medicine a name so you can recognise it.';
    }
    if (s === 1 && !form.times.length) {
      e.times = 'Choose at least one time.';
    }
    if (s === 3 && form.pills.trim()) {
      const n = parseInt(form.pills, 10);
      if (isNaN(n) || n < 0) e.pills = 'Enter a whole number of pills, or leave this empty.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    if (step === 1 && form.remindersOn) {
      permissionStatus().then((s) => setNotifDenied(s === 'denied'));
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const save = () => {
    for (let s = 0; s <= 3; s++) {
      if (!validate(s)) {
        setStep(s);
        return;
      }
    }
    const pills = form.pills.trim() ? parseInt(form.pills, 10) : null;
    const thresholdRaw = form.threshold.trim() ? parseInt(form.threshold, 10) : NaN;
    const saved = saveMedication({
      id: med?.id,
      name: form.name.trim(),
      dose: form.dose.trim() || '1 dose',
      instruction: form.instruction.trim(),
      times: form.times,
      pills,
      threshold: isNaN(thresholdRaw) ? settings.globalThreshold : thresholdRaw,
      remindersOn: form.remindersOn,
      lead: form.lead,
    });
    onClose();
    showToast({ message: `${saved.name} ${editing ? 'updated' : 'added'}` });
  };

  const lastStep = step === 3;
  const estPills = parseInt(form.pills, 10);
  const estimate =
    !isNaN(estPills) && estPills > 0
      ? `${plural(estPills, 'pill', 'pills')} · about ${plural(
          Math.floor(estPills / Math.max(1, form.times.length)),
          'day',
          'days',
        )} at this schedule`
      : '';

  return (
    <Sheet
      visible
      title={editing ? 'Edit medicine' : 'Add medicine'}
      onClose={onClose}
      leading={step === 0 ? { label: 'Cancel', onPress: onClose } : { label: 'Back', onPress: () => setStep((s) => s - 1) }}
      trailing={lastStep ? { label: 'Save', onPress: save } : { label: 'Next', onPress: next }}
      footer={
        <>
          <Button
            title={lastStep ? (editing ? 'Save changes' : 'Save medicine') : 'Next'}
            block
            onPress={lastStep ? save : next}
          />
          {lastStep && !editing ? (
            <Button title="Set up supply later" variant="ghost" block onPress={save} />
          ) : null}
        </>
      }
    >
      {/* progress — always say where we are, never make them count dots */}
      <View style={styles.pips} accessibilityElementsHidden>
        {STEP_TITLES.map((t, i) => (
          <View
            key={t}
            style={[
              styles.pip,
              { backgroundColor: i <= step ? c.primaryText : c.separator },
            ]}
          />
        ))}
      </View>
      <Text variant="footnote" tone="secondary" style={styles.stepCaption} accessibilityRole="header">
        Step {step + 1} of 4 · {STEP_TITLES[step]}
      </Text>

      {step === 0 ? (
        <>
          <Field label="Medicine name" error={errors.name}>
            <Input
              value={form.name}
              onChangeText={(v) => set('name', v)}
              placeholder="Metformin"
              autoCapitalize="words"
              autoFocus={!editing}
              invalid={!!errors.name}
              accessibilityLabel="Medicine name"
            />
          </Field>
          <Field label="Dose" hint="Whatever is on the label — “500 mg”, “2 tablets”, “10 units”. Left empty, doses are recorded as “1 dose”.">
            <Input
              value={form.dose}
              onChangeText={(v) => set('dose', v)}
              placeholder="500 mg"
              accessibilityLabel="Dose"
            />
          </Field>
          <Field label="Instructions" optional>
            <Input
              value={form.instruction}
              onChangeText={(v) => set('instruction', v)}
              placeholder="With food"
              accessibilityLabel="Instructions"
            />
          </Field>

          {editing && med ? (
            <Button
              title="Delete medicine"
              variant="destructive"
              block
              onPress={() =>
                confirm({
                  title: `Delete ${med.name}?`,
                  body: 'This removes the medicine, its schedule and its dose history. This cannot be undone.',
                  confirmLabel: 'Delete medicine',
                  destructive: true,
                  onConfirm: () => {
                    deleteMedication(med.id);
                    onClose();
                    showToast({ message: `${med.name} deleted` });
                  },
                })
              }
            />
          ) : null}
        </>
      ) : null}

      {step === 1 ? (
        <>
          <Field label="How often?" error={errors.times}>
            <View style={styles.chips}>
              {([1, 2, 3] as const).map((n) => (
                <Chip
                  key={n}
                  label={n === 1 ? 'Once daily' : n === 2 ? 'Twice daily' : '3 times'}
                  selected={form.freq === n}
                  onPress={() => setForm((f) => ({ ...f, freq: n, times: [...FREQ_PRESETS[n]] }))}
                />
              ))}
              <Chip
                label="Custom"
                selected={form.freq === 'custom'}
                onPress={() => setForm((f) => ({ ...f, freq: 'custom' }))}
              />
            </View>
          </Field>

          <Field
            label="At what times?"
            hint={
              form.times.length
                ? `${form.times.length === 1 ? 'Once' : form.times.length === 2 ? 'Twice' : form.times.length + ' times'} daily at ${form.times.map(formatTime).join(', ')}.`
                : undefined
            }
          >
            <View style={styles.chips}>
              {form.times.map((t, i) => (
                <Chip
                  key={`${t}-${i}`}
                  label={formatTime(t)}
                  icon="clock"
                  onPress={() => setPickingTime(i)}
                  accessibilityLabel={`Dose ${i + 1} time, ${formatTime(t)}. Opens a time picker.`}
                />
              ))}
              {form.freq === 'custom' && form.times.length < 12 ? (
                <Chip
                  label="Add time"
                  icon="plus"
                  onPress={() => set('times', [...form.times, '12:00'])}
                />
              ) : null}
              {form.freq === 'custom' && form.times.length > 1 ? (
                <Chip
                  label="Remove"
                  icon="minus"
                  onPress={() => set('times', form.times.slice(0, -1))}
                />
              ) : null}
            </View>
          </Field>

          {pickingTime !== null && Platform.OS !== 'web' ? (
            <DateTimePicker
              value={timeToDate(form.times[pickingTime])}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => {
                if (Platform.OS !== 'ios') setPickingTime(null);
                if (!date) return;
                const next = [...form.times];
                next[pickingTime] = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                set('times', next);
              }}
            />
          ) : null}
          {pickingTime !== null && Platform.OS === 'ios' ? (
            <Button title="Done" variant="ghost" block onPress={() => setPickingTime(null)} />
          ) : null}
        </>
      ) : null}

      {step === 2 ? (
        <>
          <ListGroup style={styles.mb5}>
            <ListRow
              title="Remind me"
              subtitle="A notification at each dose time"
              accessibilityRole="switch"
              accessibilityState={{ checked: form.remindersOn }}
              onPress={() => set('remindersOn', !form.remindersOn)}
              accessory={<SwitchAccessory value={form.remindersOn} />}
            />
          </ListGroup>

          {form.remindersOn ? (
            <>
              <Field label="When?">
                <View style={styles.chips}>
                  {[
                    [0, 'At dose time'],
                    [5, '5 min before'],
                    [15, '15 min'],
                    [30, '30 min'],
                  ].map(([v, l]) => (
                    <Chip
                      key={String(v)}
                      label={l as string}
                      selected={form.lead === v}
                      onPress={() => set('lead', v as number)}
                    />
                  ))}
                </View>
              </Field>

              {/* Say it here, not silently at save time. */}
              {notifDenied ? (
                <Card tone="warning">
                  <Text variant="subhead" color={c.warningOnTint}>
                    Notifications are turned off for Pillbox, so reminders will not appear.
                  </Text>
                  <Button
                    title="Allow notifications"
                    variant="ghost"
                    onPress={() => requestPermission().then((ok) => setNotifDenied(!ok))}
                    style={styles.mt2}
                  />
                </Card>
              ) : null}
            </>
          ) : (
            <Text variant="footnote" tone="secondary">
              You can turn reminders on later from this medicine&rsquo;s settings.
            </Text>
          )}
        </>
      ) : null}

      {step === 3 ? (
        <>
          <Field label="Pills on hand" optional error={errors.pills} hint={estimate}>
            <Input
              value={form.pills}
              onChangeText={(v) => set('pills', v.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="60"
              keyboardType="number-pad"
              invalid={!!errors.pills}
              accessibilityLabel="Pills on hand"
            />
          </Field>
          <Field
            label="Warn me at"
            hint={`Pills remaining before Pillbox warns you. Left empty, your default of ${settings.globalThreshold} is used.`}
          >
            <Input
              value={form.threshold}
              onChangeText={(v) => set('threshold', v.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder={String(settings.globalThreshold)}
              keyboardType="number-pad"
              accessibilityLabel="Warning level in pills"
            />
          </Field>
        </>
      ) : null}
    </Sheet>
  );
}

/* ------------------------------------------------------------ RefillSheet */

function RefillSheet({ medId, onClose }: { medId: string; onClose: () => void }) {
  const { meds, refill, showToast } = useStore();
  const med = meds.find((m) => m.id === medId);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');

  if (!med) return null;

  const newTotal = (med.pills ?? 0) + amount;
  const newDays = Math.floor(newTotal / Math.max(1, dosesPerDay(med)));

  const commit = () => {
    if (amount <= 0) {
      setError('Enter how many pills you added.');
      return;
    }
    refill(med.id, amount);
    onClose();
    showToast({ message: `${med.name} restocked — ${plural(newTotal, 'pill', 'pills')}` });
  };

  return (
    <Sheet
      visible
      title="Refill"
      onClose={onClose}
      leading={{ label: 'Cancel', onPress: onClose }}
      footer={
        <Button
          title={amount > 0 ? `Add ${plural(amount, 'pill', 'pills')}` : 'Add pills'}
          block
          disabled={amount <= 0}
          onPress={commit}
        />
      }
    >
      <Card style={styles.mb5}>
        <Text variant="headline">{med.name}</Text>
        <Text variant="subhead" tone="secondary">{med.dose}</Text>
        <SupplyIndicator med={med} />
      </Card>

      <Field label="Add pills">
        <View style={styles.chips}>
          {[30, 60, 90].map((n) => (
            <Chip
              key={n}
              label={`+${n}`}
              selected={amount === n}
              onPress={() => { setAmount(n); setError(''); }}
            />
          ))}
        </View>
      </Field>

      <Field label="Or enter an amount" error={error}>
        <View style={styles.amountRow}>
          <Input
            value={amount ? String(amount) : ''}
            onChangeText={(v) => {
              setAmount(parseInt(v.replace(/[^0-9]/g, '').slice(0, 4), 10) || 0);
              setError('');
            }}
            placeholder="0"
            keyboardType="number-pad"
            invalid={!!error}
            accessibilityLabel="Number of pills to add"
            style={styles.flex1}
          />
          <Stepper value={amount} onChange={setAmount} min={0} max={9999} label="pills to add" />
        </View>
      </Field>

      {/* Show the consequence before committing it. */}
      {amount > 0 ? (
        <Card tone="success">
          <Text variant="headline">New total: {plural(newTotal, 'pill', 'pills')}</Text>
          <Text variant="subhead" tone="secondary">
            About {plural(newDays, 'day', 'days')} at this schedule
          </Text>
        </Card>
      ) : null}
    </Sheet>
  );
}

/* ------------------------------------------------------------ small parts */

function timeToDate(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

/** Every field has a visible label. Placeholder-only labelling is banned. */
function Field({
  label,
  children,
  hint,
  error,
  optional,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
  optional?: boolean;
}) {
  const { c } = useTheme();
  return (
    <View style={styles.field}>
      <Text variant="subhead" style={styles.label}>
        {label}
        {optional ? <Text variant="subhead" tone="secondary">  (optional)</Text> : null}
      </Text>
      {children}
      {error ? (
        <View style={styles.error}>
          <Icon name="alert" size={14} tone="danger" />
          <Text variant="footnote" tone="danger" style={styles.flex1}>{error}</Text>
        </View>
      ) : hint ? (
        <Text variant="footnote" tone="secondary" style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

function Input({
  invalid,
  style,
  ...rest
}: React.ComponentProps<typeof TextInput> & { invalid?: boolean }) {
  const { c } = useTheme();
  return (
    <TextInput
      placeholderTextColor={c.textSecondary}
      style={[
        styles.input,
        {
          backgroundColor: c.surfaceRaised,
          color: c.text,
          borderColor: invalid ? c.dangerText : 'transparent',
        },
        style,
      ]}
      {...rest}
    />
  );
}

function Chip({
  label,
  selected,
  onPress,
  icon,
  accessibilityLabel,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: 'clock' | 'plus' | 'minus';
  accessibilityLabel?: string;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: selected ? c.primaryTint : c.surfaceRaised },
        pressed && { opacity: 0.6 },
      ]}
    >
      {icon ? <Icon name={icon} size={15} tone={selected ? 'primary' : 'default'} /> : null}
      <Text
        variant="subhead"
        color={selected ? c.primaryOnTint : c.text}
        style={selected ? styles.chipOn : undefined}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SwitchAccessory({ value }: { value: boolean }) {
  const { c } = useTheme();
  return (
    <View
      style={[
        styles.switch,
        { backgroundColor: value ? c.primary : c.surfaceRaised },
        !value && { borderWidth: 1, borderColor: c.separator },
      ]}
      accessibilityElementsHidden
    >
      <View style={[styles.knob, value && styles.knobOn]} />
    </View>
  );
}

const styles = StyleSheet.create({
  pips: { flexDirection: 'row', gap: space.s1, marginBottom: space.s2 },
  pip: { flex: 1, height: 4, borderRadius: radius.full },
  stepCaption: { textAlign: 'center', marginBottom: space.s4 },
  field: { marginBottom: space.s5 },
  label: { fontWeight: '600', marginBottom: space.s2 },
  input: {
    minHeight: 50,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: space.s4,
    paddingVertical: space.s3,
    fontSize: 17,
  },
  hint: { marginTop: space.s2 },
  error: { flexDirection: 'row', alignItems: 'flex-start', gap: space.s1, marginTop: space.s2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s1,
    minHeight: TARGET,
    paddingHorizontal: space.s4,
    borderRadius: radius.sm,
  },
  chipOn: { fontWeight: '600' },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: space.s3 },
  flex1: { flex: 1 },
  mb5: { marginBottom: space.s5 },
  mt2: { marginTop: space.s2 },
  switch: { width: 51, height: 31, borderRadius: radius.full, justifyContent: 'center' },
  knob: { width: 27, height: 27, borderRadius: radius.full, backgroundColor: '#FFFFFF', marginLeft: 2 },
  knobOn: { marginLeft: 22 },
});
