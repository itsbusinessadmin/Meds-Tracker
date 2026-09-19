/**
 * Pillbox domain logic — dose status, supply bands, schedule expansion.
 *
 * Pure functions, no React, no storage. This is the layer that decides what a
 * dose *is*, so it is also the layer where medication-safety rules live.
 */

export type DoseStatus = 'taken' | 'due' | 'upcoming' | 'missed' | 'skipped';
export type SupplyBand = 'healthy' | 'low' | 'critical' | 'untracked';
export type DayRollup = 'taken' | 'partial' | 'missed' | 'skipped' | 'future' | 'none';

export type Medication = {
  id: string;
  name: string;
  /** Free text — "500 mg", "2 tablets", "10 units". Not every dose is a number. */
  dose: string;
  instruction: string;
  /** "HH:MM", 24-hour, sorted. One entry per dose per day. */
  times: string[];
  /** null means the user chose not to track supply for this medicine. */
  pills: number | null;
  threshold: number;
  remindersOn: boolean;
  /** Minutes before the dose time to notify. 0 = at the dose time. */
  lead: number;
};

export type DoseRecord = {
  status: Exclude<DoseStatus, 'due' | 'upcoming'>;
  /** "HH:MM" the dose was actually recorded, for taken doses only. */
  at: string | null;
};

/** Keyed "YYYY-MM-DD|medId|HH:MM". */
export type Records = Record<string, DoseRecord>;

export type Dose = {
  id: string;
  med: Medication;
  time: string;
  date: Date;
  status: DoseStatus;
  record: DoseRecord | null;
};

/** After this many minutes past its time, an untaken dose counts as missed. */
export const DOSE_GRACE_MIN = 60;
/** Within this many minutes before its time, a dose reads as "due now". */
export const DUE_WINDOW_MIN = 30;

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

const pad = (n: number) => String(n).padStart(2, '0');

export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const sameDay = (a: Date, b: Date) => dateKey(a) === dateKey(b);

export const doseId = (date: Date, medId: string, time: string) =>
  `${dateKey(date)}|${medId}|${time}`;

/** "08:00" -> "8:00 AM" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(m)} ${suffix}`;
}

/** Minutes from `now` until "HH:MM" on the same day. Negative means past. */
export function minutesUntil(hhmm: string, now = new Date()): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m - (now.getHours() * 60 + now.getMinutes());
}

export function formatRelative(mins: number): string {
  if (mins <= -60) {
    const h = Math.round(-mins / 60);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  if (mins < 0) return `${-mins} minute${mins === -1 ? '' : 's'} ago`;
  if (mins === 0) return 'now';
  if (mins < 60) return `in ${mins} minute${mins === 1 ? '' : 's'}`;
  const h = Math.round(mins / 60);
  return `in ${h} hour${h === 1 ? '' : 's'}`;
}

export const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

export const dosesPerDay = (med: Medication) => med.times.length;

/**
 * Days of supply remaining. Null when the medicine has no tracked supply —
 * which is different from zero, and must render differently.
 */
export function daysLeft(med: Medication): number | null {
  if (med.pills == null) return null;
  return Math.floor(med.pills / Math.max(1, dosesPerDay(med)));
}

export function supplyBand(med: Medication): SupplyBand {
  const d = daysLeft(med);
  if (d == null || med.pills == null) return 'untracked';
  if (d <= 3) return 'critical';
  if (d <= 14 || med.pills <= med.threshold) return 'low';
  return 'healthy';
}

/**
 * The status of one scheduled dose. A recorded status always wins; otherwise
 * it is derived from the clock, so a dose becomes "missed" on its own.
 */
export function doseStatus(
  records: Records,
  med: Medication,
  time: string,
  date: Date,
  now = new Date(),
): DoseStatus {
  const rec = records[doseId(date, med.id, time)];
  if (rec) return rec.status;
  if (!sameDay(date, now)) return date > now ? 'upcoming' : 'missed';
  const mins = minutesUntil(time, now);
  if (mins < -DOSE_GRACE_MIN) return 'missed';
  if (mins <= DUE_WINDOW_MIN) return 'due';
  return 'upcoming';
}

/** Every dose scheduled on a date, in time order. */
export function dosesOn(
  meds: Medication[],
  records: Records,
  date: Date,
  medFilter: string | null = null,
  now = new Date(),
): Dose[] {
  const out: Dose[] = [];
  for (const med of meds) {
    if (medFilter && med.id !== medFilter) continue;
    for (const time of med.times) {
      out.push({
        id: doseId(date, med.id, time),
        med,
        time,
        date,
        status: doseStatus(records, med, time, date, now),
        record: records[doseId(date, med.id, time)] ?? null,
      });
    }
  }
  return out.sort((a, b) => a.time.localeCompare(b.time));
}

export function dayRollup(
  meds: Medication[],
  records: Records,
  date: Date,
  medFilter: string | null = null,
  now = new Date(),
): DayRollup {
  const list = dosesOn(meds, records, date, medFilter, now);
  if (!list.length) return 'none';
  if (date > now && !sameDay(date, now)) return 'future';
  const taken = list.filter((d) => d.status === 'taken').length;
  const skipped = list.filter((d) => d.status === 'skipped').length;
  if (taken === list.length) return 'taken';
  if (skipped === list.length) return 'skipped';
  if (taken === 0 && skipped === 0) return 'missed';
  return 'partial';
}

/** The dose the Today screen should lead with: due first, then soonest. */
export function nextDose(list: Dose[]): Dose | null {
  return list.find((d) => d.status === 'due') ?? list.find((d) => d.status === 'upcoming') ?? null;
}

export const FREQ_PRESETS: Record<number, string[]> = {
  1: ['08:00'],
  2: ['08:00', '20:00'],
  3: ['08:00', '14:00', '20:00'],
};
