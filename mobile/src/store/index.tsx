/**
 * Pillbox state, persisted to the device.
 *
 * The HTML prototype kept everything in memory and lost it on reload. For a
 * medication app that is the difference between a demo and a tool, so this
 * layer is the other half of the port's job. Writes are debounced; reads
 * happen once at launch behind a hydration flag so no screen ever renders
 * against empty state and flashes an "add your first medicine" empty state to
 * someone who has twelve.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import {
  DoseStatus,
  Medication,
  Records,
  addDays,
  dateKey,
  daysLeft,
  dosesPerDay,
} from '@/domain/medication';
import { notifyLowSupply, rescheduleAll } from '@/domain/notifications';
import type { ThemePreference } from '@/theme';

const KEY = 'pillbox.state.v1';

export type Settings = {
  theme: ThemePreference;
  medicationReminders: boolean;
  lowSupplyAlerts: boolean;
  globalThreshold: number;
};

export type PersistedState = {
  meds: Medication[];
  records: Records;
  settings: Settings;
};

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  medicationReminders: true,
  lowSupplyAlerts: true,
  globalThreshold: 15,
};

/* ------------------------------------------------------------------- seed */
/*
 * First-run content, generated relative to today so the calendar holds real
 * data in whatever month it is opened. The prototype hardcoded September 2026
 * and rendered every other month as "future", including months in the past.
 */

function seed(): PersistedState {
  const today = new Date();
  const meds: Medication[] = [
    { id: 'm1', name: 'Metformin', dose: '500 mg', instruction: 'With food', times: ['08:00', '20:00'], pills: 48, threshold: 15, remindersOn: true, lead: 0 },
    { id: 'm2', name: 'Lisinopril', dose: '10 mg', instruction: '', times: ['08:00', '20:00'], pills: 16, threshold: 15, remindersOn: true, lead: 5 },
    { id: 'm3', name: 'Atorvastatin', dose: '20 mg', instruction: 'Before bed', times: ['22:30'], pills: 6, threshold: 10, remindersOn: true, lead: 15 },
  ];

  const records: Records = {};
  let s = 20260919;
  const rand = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  for (let back = 45; back >= 1; back--) {
    const date = addDays(today, -back);
    for (const med of meds) {
      for (const time of med.times) {
        const r = rand();
        const status: 'taken' | 'missed' | 'skipped' =
          r > 0.975 ? 'missed' : r > 0.955 ? 'skipped' : 'taken';
        const [h, m] = time.split(':').map(Number);
        const drift = Math.floor(rand() * 18);
        records[`${dateKey(date)}|${med.id}|${time}`] = {
          status,
          at: status === 'taken'
            ? `${String(h).padStart(2, '0')}:${String(Math.min(59, m + drift)).padStart(2, '0')}`
            : null,
        };
      }
    }
  }
  if (today.getHours() >= 9) {
    records[`${dateKey(today)}|m1|08:00`] = { status: 'taken', at: '08:12' };
    records[`${dateKey(today)}|m2|08:00`] = { status: 'taken', at: '08:12' };
  }
  return { meds, records, settings: DEFAULT_SETTINGS };
}

/* ------------------------------------------------------------------ store */

export type Toast = {
  message: string;
  undo?: () => void;
};

type StoreValue = PersistedState & {
  hydrated: boolean;
  toast: Toast | null;
  showToast: (t: Toast) => void;
  dismissToast: () => void;

  setDose: (id: string, status: DoseStatus | null, opts?: { silent?: boolean }) => void;
  saveMedication: (med: Omit<Medication, 'id'> & { id?: string }) => Medication;
  deleteMedication: (id: string) => void;
  refill: (medId: string, amount: number) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  deleteEverything: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

const tap = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Haptics.impactAsync(style).catch(() => {});
  }
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => ({
    meds: [],
    records: {},
    settings: DEFAULT_SETTINGS,
  }));
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* load once */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        const loaded: PersistedState = raw ? JSON.parse(raw) : seed();
        // Merge settings so a new field added in a later version does not
        // arrive undefined on an existing install.
        loaded.settings = { ...DEFAULT_SETTINGS, ...loaded.settings };
        if (alive) setState(loaded);
      } catch (e) {
        console.warn('[pillbox] could not read saved data, starting fresh', e);
        if (alive) setState(seed());
      } finally {
        if (alive) setHydrated(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* persist on change, debounced */
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(KEY, JSON.stringify(state)).catch((e) =>
        console.warn('[pillbox] could not save', e),
      );
    }, 250);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, hydrated]);

  /* keep the notification schedule in step with the medicines */
  useEffect(() => {
    if (!hydrated) return;
    rescheduleAll(state.meds, state.settings.medicationReminders);
  }, [state.meds, state.settings.medicationReminders, hydrated]);

  const showToast = useCallback((t: Toast) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(t);
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  const setDose = useCallback<StoreValue['setDose']>(
    (id, status, opts) => {
      setState((prev) => {
        const [, medId] = id.split('|');
        const med = prev.meds.find((m) => m.id === medId);
        if (!med) return prev;

        const previous = prev.records[id] ?? null;
        const wasTaken = previous?.status === 'taken';
        const records = { ...prev.records };

        if (status === null) {
          delete records[id];
        } else {
          const now = new Date();
          records[id] = {
            status: status as never,
            at:
              status === 'taken'
                ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
                : null,
          };
        }

        // Supply only moves for doses actually consumed. Skipping a dose does
        // not take a pill out of the bottle, and neither does marking a past
        // dose missed.
        let meds = prev.meds;
        const isTaken = status === 'taken';
        if (med.pills != null && isTaken !== wasTaken) {
          const delta = isTaken ? -1 : 1;
          const updated = { ...med, pills: Math.max(0, med.pills + delta) };
          meds = prev.meds.map((m) => (m.id === med.id ? updated : m));

          const crossed =
            delta === -1 &&
            updated.pills <= updated.threshold &&
            med.pills > updated.threshold;
          if (crossed && prev.settings.lowSupplyAlerts) notifyLowSupply(updated);
        }

        return { ...prev, records, meds };
      });

      if (!opts?.silent) tap();
    },
    [],
  );

  const saveMedication = useCallback<StoreValue['saveMedication']>((input) => {
    const med: Medication = {
      ...input,
      id: input.id ?? `m${Date.now()}`,
      times: [...input.times].sort(),
    };
    setState((prev) => ({
      ...prev,
      meds: input.id
        ? prev.meds.map((m) => (m.id === input.id ? med : m))
        : [...prev.meds, med],
    }));
    tap(Haptics.ImpactFeedbackStyle.Medium);
    return med;
  }, []);

  const deleteMedication = useCallback<StoreValue['deleteMedication']>((id) => {
    setState((prev) => {
      const records = { ...prev.records };
      for (const k of Object.keys(records)) {
        if (k.split('|')[1] === id) delete records[k];
      }
      return { ...prev, meds: prev.meds.filter((m) => m.id !== id), records };
    });
  }, []);

  const refill = useCallback<StoreValue['refill']>((medId, amount) => {
    setState((prev) => ({
      ...prev,
      meds: prev.meds.map((m) =>
        m.id === medId ? { ...m, pills: (m.pills ?? 0) + amount } : m,
      ),
    }));
    tap(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const updateSettings = useCallback<StoreValue['updateSettings']>((patch) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const deleteEverything = useCallback(() => {
    setState({ meds: [], records: {}, settings: DEFAULT_SETTINGS });
    AsyncStorage.removeItem(KEY).catch(() => {});
    rescheduleAll([], false);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      hydrated,
      toast,
      showToast,
      dismissToast,
      setDose,
      saveMedication,
      deleteMedication,
      refill,
      updateSettings,
      deleteEverything,
    }),
    [state, hydrated, toast, showToast, dismissToast, setDose, saveMedication,
     deleteMedication, refill, updateSettings, deleteEverything],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(StoreContext);
  if (!v) throw new Error('useStore must be used inside <StoreProvider>');
  return v;
}

/** Days of supply a given pill count buys at a medicine's schedule. */
export function estimateDays(pills: number, med: Pick<Medication, 'times'>): number {
  return Math.floor(pills / Math.max(1, dosesPerDay(med as Medication)));
}

export { daysLeft };
