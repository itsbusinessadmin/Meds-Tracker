/**
 * Real reminder scheduling — the thing the HTML prototype could only fake.
 *
 * Every dose time becomes a repeating daily local notification, offset by the
 * medicine's lead time. Low-supply warnings fire immediately when a medicine
 * crosses its threshold.
 *
 * Everything here is guarded: notifications are unavailable on web and can be
 * denied on device, and a medication app must keep working when they are. A
 * denied permission is surfaced in the UI (see the Reminders step of the add
 * flow) rather than failing silently at save time.
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { Medication, daysLeft, formatTime, plural } from './medication';

const SUPPORTED = Platform.OS === 'ios' || Platform.OS === 'android';

if (SUPPORTED) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function permissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  if (!SUPPORTED) return 'denied';
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status as 'granted' | 'denied' | 'undetermined';
  } catch {
    return 'denied';
  }
}

export async function requestPermission(): Promise<boolean> {
  if (!SUPPORTED) return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/** Apply a lead time to "HH:MM", wrapping backwards across midnight. */
function applyLead(hhmm: string, leadMinutes: number): { hour: number; minute: number } {
  const [h, m] = hhmm.split(':').map(Number);
  let total = h * 60 + m - leadMinutes;
  if (total < 0) total += 24 * 60;
  return { hour: Math.floor(total / 60), minute: total % 60 };
}

/**
 * Rebuild the whole schedule from scratch.
 *
 * Cancelling everything and re-adding is deliberate: reconciling individual
 * notifications against edited schedules is where duplicate and orphaned
 * reminders come from, and a missed or doubled medication reminder is a real
 * harm. Whole-schedule replacement is cheap and cannot drift.
 */
export async function rescheduleAll(
  meds: Medication[],
  remindersEnabled: boolean,
): Promise<void> {
  if (!SUPPORTED) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!remindersEnabled) return;
    if ((await permissionStatus()) !== 'granted') return;

    for (const med of meds) {
      if (!med.remindersOn) continue;
      for (const time of med.times) {
        const { hour, minute } = applyLead(time, med.lead);
        await Notifications.scheduleNotificationAsync({
          identifier: `dose:${med.id}:${time}`,
          content: {
            title: med.name,
            body: med.lead
              ? `${med.dose} at ${formatTime(time)} — in ${med.lead} minutes`
              : `${med.dose} — due now`,
            data: { medId: med.id, time },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
          },
        });
      }
    }
  } catch (e) {
    // Never let a scheduling failure take the app down with it.
    console.warn('[pillbox] could not reschedule reminders', e);
  }
}

/** Fired the moment a medicine crosses its own warning level. */
export async function notifyLowSupply(med: Medication): Promise<void> {
  if (!SUPPORTED) return;
  const d = daysLeft(med);
  if (d == null || med.pills == null) return;
  try {
    if ((await permissionStatus()) !== 'granted') return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${med.name} is running low`,
        body: `${plural(med.pills, 'pill', 'pills')} left — about ${plural(d, 'day', 'days')}.`,
        data: { medId: med.id, kind: 'lowSupply' },
      },
      trigger: null, // deliver now
    });
  } catch (e) {
    console.warn('[pillbox] could not post low-supply alert', e);
  }
}
