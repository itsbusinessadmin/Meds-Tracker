/* ============================================================================
 * PILLBOX
 * Reference prototype of the design system in design-system/pillbox/MASTER.md.
 *
 * Structure mirrors the intended React Native component tree so the port is a
 * translation rather than a rewrite:
 *   icons / format  -> shared primitives
 *   components      -> MedicationCard, DoseRow, StatusBadge, SupplyIndicator...
 *   screens         -> Today, Supply, History, Settings
 *   sheets          -> AddMedication, Refill, Confirm, Picker
 *
 * No element is styled inline. Every visual value comes from a token in the
 * stylesheet. If something needs a new value, it goes in MASTER.md first.
 * ========================================================================== */
'use strict';

/* ---------------------------------------------------------------- utilities */

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const $ = (sel, root = document) => root.querySelector(sel);

const pad = (n) => String(n).padStart(2, '0');

/* ------------------------------------------------------------------- icons */
/* One family: outline, 1.75 stroke, round caps, 24-box, currentColor.
   Status glyphs are filled — a deliberate hierarchy signal, per MASTER §7. */

const PATHS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  slash: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
  box: '<path d="M3 8h18M3 8l2-4h14l2 4M3 8v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8"/>',
  boxDown: '<path d="M3 8h18M3 8l2-4h14l2 4M3 8v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8"/><path d="M12 11v6M9.5 14.5 12 17l2.5-2.5"/>',
  pill: '<path d="M10.5 20.5a5 5 0 0 1-7-7l6-6a5 5 0 0 1 7 7Z"/><path d="m8.5 8.5 7 7"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  clockCheck: '<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.4L3 8"/><path d="M3 3.5V8h4.5"/><path d="M12 7.5V12l3 1.8"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.4 2.4 4.6-4.8"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 1.8"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  share: '<path d="M12 15V3M8 7l4-4 4 4"/><path d="M4 13v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/>',
  shield: '<path d="M12 2 4 5.5v6c0 5 3.4 9.3 8 10.5 4.6-1.2 8-5.5 8-10.5v-6Z"/>',
  doc: '<path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5M9 13h6M9 17h4"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.6-2.5 2.6M12 17h.01"/>',
  mail: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  undo: '<path d="M3 8h11a5.5 5.5 0 0 1 0 11H9"/><path d="M6.5 4.5 3 8l3.5 3.5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  filter: '<path d="M3 5h18M6 12h12M10 19h4"/>',
};

const TAB_ICONS = {
  today: {
    outline: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.4 2.4 4.6-4.8"/>',
    filled: '<circle cx="12" cy="12" r="9.2" fill="currentColor" stroke="none"/>'
      + '<path class="ic-ko" d="m8.3 12.2 2.5 2.5 4.9-5.1"/>',
  },
  supply: {
    outline: '<path d="M3 8h18M3 8l2-4h14l2 4M3 8v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8"/>',
    filled: '<path fill="currentColor" stroke="none" d="M5.1 3.4h13.8l1.9 3.7a.9.9 0 0 1-.8 1.4H4a.9.9 0 0 1-.8-1.4Z"/>'
      + '<path fill="currentColor" stroke="none" d="M3.9 10.1h16.2V19a2.6 2.6 0 0 1-2.6 2.6H6.5A2.6 2.6 0 0 1 3.9 19Z"/>'
      + '<path class="ic-ko" d="M12 12.6v5.4M9.3 15.3h5.4"/>',
  },
  history: {
    outline: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M16 3v4M8 3v4M3 11h18"/>',
    filled: '<path fill="currentColor" stroke="none" d="M3 10.4h18V19a2.6 2.6 0 0 1-2.6 2.6H5.6A2.6 2.6 0 0 1 3 19Z"/>'
      + '<path fill="currentColor" stroke="none" d="M5.6 4.4h12.8A2.6 2.6 0 0 1 21 7v1.6H3V7a2.6 2.6 0 0 1 2.6-2.6Z"/>'
      + '<path class="ic-ko" d="M7.4 14h2M14.6 14h2M7.4 17.6h2M14.6 17.6h2"/>'
      + '<path d="M8 2.6v3.2M16 2.6v3.2"/>',
  },
};

function tabIcon(name, active) {
  const set = TAB_ICONS[name];
  return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" focusable="false">${active ? set.filled : set.outline}</svg>`;
}

function icon(name, size = 'md', filled = false) {
  const sizes = { sm: 18, md: 24, lg: 26, xl: 32 };
  const px = sizes[size] || size;
  return `<svg width="${px}" height="${px}" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}"
    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" focusable="false">${PATHS[name] || ''}</svg>`;
}

/* -------------------------------------------------------- date & formatting */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const sameDay = (a, b) => keyOf(a) === keyOf(b);

/** "08:00" -> "8:00 AM" */
function fmtTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(m)} ${suffix}`;
}

/** Minutes from now to a "HH:MM" today. Negative = past. */
function minutesUntil(hhmm, now = new Date()) {
  const [h, m] = hhmm.split(':').map(Number);
  return (h * 60 + m) - (now.getHours() * 60 + now.getMinutes());
}

function fmtRelative(mins) {
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

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/* ------------------------------------------------------------------- domain */

const DOSE_GRACE_MIN = 60;   // after this, an untaken dose counts as missed
const DUE_WINDOW_MIN = 30;   // before scheduled time, a dose reads as "due now"
const SUPPLY_SCALE_DAYS = 30; // fixed bar scale so medicines compare

const STATUS = {
  taken:    { word: 'Taken',    icon: 'checkCircle', badge: 'badge-taken',    shape: 'shape-full' },
  due:      { word: 'Due now',  icon: 'clock',       badge: 'badge-due',      shape: 'shape-ring' },
  upcoming: { word: 'Upcoming', icon: 'clock',       badge: 'badge-upcoming', shape: 'shape-ring' },
  missed:   { word: 'Missed',   icon: 'alert',       badge: 'badge-missed',   shape: 'shape-ring' },
  skipped:  { word: 'Skipped',  icon: 'slash',       badge: 'badge-skipped',  shape: 'shape-slash' },
};

function dosesPerDay(med) { return med.times.length; }

function daysLeft(med) {
  if (med.pills == null) return null;
  return Math.floor(med.pills / dosesPerDay(med));
}

function supplyBand(med) {
  const d = daysLeft(med);
  if (d == null) return 'untracked';
  if (d <= 3) return 'critical';
  if (d <= 14 || med.pills <= med.threshold) return 'low';
  return 'healthy';
}

/** Status of one scheduled dose, from the record if any, otherwise from time. */
function doseStatus(med, time, date, now = new Date()) {
  const rec = state.records[`${keyOf(date)}|${med.id}|${time}`];
  if (rec) return rec.status;
  if (date > now && !sameDay(date, now)) return 'upcoming';
  if (!sameDay(date, now)) return 'missed';
  const mins = minutesUntil(time, now);
  if (mins < -DOSE_GRACE_MIN) return 'missed';
  if (mins <= DUE_WINDOW_MIN) return 'due';
  return 'upcoming';
}

/** Every dose scheduled on a date, in time order. */
function dosesOn(date, medFilter = null) {
  const out = [];
  state.meds.forEach((med) => {
    if (medFilter && med.id !== medFilter) return;
    med.times.forEach((time) => {
      out.push({
        id: `${keyOf(date)}|${med.id}|${time}`,
        med, time, date,
        status: doseStatus(med, time, date),
        record: state.records[`${keyOf(date)}|${med.id}|${time}`] || null,
      });
    });
  });
  return out.sort((a, b) => a.time.localeCompare(b.time));
}

function dayRollup(date, medFilter = null) {
  const list = dosesOn(date, medFilter);
  if (!list.length) return 'none';
  if (date > new Date() && !sameDay(date, new Date())) return 'future';
  const taken = list.filter((d) => d.status === 'taken').length;
  const skipped = list.filter((d) => d.status === 'skipped').length;
  if (taken === list.length) return 'taken';
  if (skipped === list.length) return 'skipped';
  if (taken === 0 && skipped === 0) return 'missed';
  return 'partial';
}

/* --------------------------------------------------------------- seed state */

const today = new Date();

const SEED_MEDS = [
  { id: 1, name: 'Metformin',    dose: '500 mg', instruction: 'With food', times: ['08:00', '20:00'], pills: 48, threshold: 15, remindersOn: true,  lead: 0 },
  { id: 2, name: 'Lisinopril',   dose: '10 mg',  instruction: '',          times: ['08:00', '20:00'], pills: 16, threshold: 15, remindersOn: true,  lead: 5 },
  { id: 3, name: 'Atorvastatin', dose: '20 mg',  instruction: 'Before bed',times: ['22:30'],          pills: 6,  threshold: 10, remindersOn: true,  lead: 15 },
];

/* Deterministic history so the calendar is honest and stable across reloads.
   The old build hardcoded a single month and rendered every other month as
   "future", including years in the past. */
function seedHistory(meds) {
  const records = {};
  let seed = 20260919;
  const rand = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };

  for (let back = 45; back >= 1; back--) {
    const date = addDays(today, -back);
    meds.forEach((med) => {
      med.times.forEach((time) => {
        const r = rand();
        let status = 'taken';
        if (r > 0.975) status = 'missed';
        else if (r > 0.955) status = 'skipped';
        const [h, m] = time.split(':').map(Number);
        const drift = Math.floor(rand() * 18);
        records[`${keyOf(date)}|${med.id}|${time}`] = {
          status,
          at: status === 'taken' ? `${pad(h)}:${pad(Math.min(59, m + drift))}` : null,
        };
      });
    });
  }
  // A couple of this morning's doses already taken, so Today has real content.
  const morning = today.getHours() >= 9;
  if (morning) {
    records[`${keyOf(today)}|1|08:00`] = { status: 'taken', at: '08:12' };
    records[`${keyOf(today)}|2|08:00`] = { status: 'taken', at: '08:12' };
  }
  return records;
}

const state = {
  tab: 'today',
  meds: SEED_MEDS.map((m) => ({ ...m })),
  records: seedHistory(SEED_MEDS),

  theme: 'system',
  textScale: 1,
  reduceMotion: false,
  lowSupplyAlerts: true,
  medicationReminders: true,
  globalThreshold: 15,

  sheet: null,
  toast: null,
  banner: null,

  // history screen
  histMode: 'month',
  histDate: new Date(today),
  histSelected: new Date(today),
  histMedFilter: null,

  // add/edit flow
  form: null,
  step: 0,

  // refill
  refill: null,

  scroll: {},
  lastFocus: null,
  _toastTimer: null,
  _bannerTimer: null,
};

/* ------------------------------------------------------------- side effects */

function announce(msg) {
  const el = $('#live');
  if (el) { el.textContent = ''; setTimeout(() => { el.textContent = msg; }, 50); }
}

function haptic() { if (navigator.vibrate) navigator.vibrate(8); }

function toast(msg, action = null) {
  clearTimeout(state._toastTimer);
  state.toast = { msg, action };
  announce(msg);
  render();
  state._toastTimer = setTimeout(() => { state.toast = null; render(); }, 6000);
}

function showBanner(title, body, act) {
  clearTimeout(state._bannerTimer);
  state.banner = { title, body, act };
  announce(`${title}. ${body}`);
  render();
  state._bannerTimer = setTimeout(() => { state.banner = null; render(); }, 8000);
}

/* -------------------------------------------------------------- mutations */

function setDoseStatus(doseId, status, opts = {}) {
  const [dateKey, medIdStr, time] = doseId.split('|');
  const medId = Number(medIdStr);
  const med = state.meds.find((m) => m.id === medId);
  if (!med) return;

  const prev = state.records[doseId] || null;
  const wasTaken = prev && prev.status === 'taken';

  if (status === null) {
    delete state.records[doseId];
  } else {
    const now = new Date();
    state.records[doseId] = {
      status,
      at: status === 'taken' ? `${pad(now.getHours())}:${pad(now.getMinutes())}` : null,
    };
  }

  // Supply only moves for doses actually consumed.
  const isTaken = status === 'taken';
  if (isTaken && !wasTaken && med.pills != null) {
    const before = med.pills;
    med.pills = Math.max(0, med.pills - 1);
    const crossed = med.pills <= med.threshold && before > med.threshold;
    if (crossed && state.lowSupplyAlerts) {
      setTimeout(() => showBanner(
        `${med.name} is running low`,
        `${plural(med.pills, 'pill', 'pills')} left — about ${plural(daysLeft(med), 'day', 'days')}. Tap to refill.`,
        `refill:${med.id}`
      ), 500);
    }
  } else if (!isTaken && wasTaken && med.pills != null) {
    med.pills += 1;
  }

  if (!opts.silent) {
    haptic();
    const label = STATUS[status] ? STATUS[status].word.toLowerCase() : 'cleared';
    if (status === null) toast(`${med.name} — dose cleared`);
    else toast(`${med.name} ${label} · ${fmtTime(time)}`, { label: 'Undo', act: `undo:${doseId}:${prev ? prev.status : ''}` });
  }
  render();
}

function undoDose(doseId, prevStatus) {
  clearTimeout(state._toastTimer);
  state.toast = null;
  setDoseStatus(doseId, prevStatus || null, { silent: true });
  announce('Change undone');
  render();
}

/* =========================================================================
 * COMPONENTS
 * ========================================================================= */

function StatusBadge(status) {
  const s = STATUS[status];
  if (!s) return '';
  return `<span class="badge ${s.badge}">${icon(s.icon, 14, status === 'taken')}${esc(s.word)}</span>`;
}

function supplyBadge(med) {
  const band = supplyBand(med);
  if (band === 'critical') return `<span class="badge badge-critical">${icon('alert', 14, true)}Critical</span>`;
  if (band === 'low') return `<span class="badge badge-low">${icon('boxDown', 14)}Low</span>`;
  return '';
}

function SupplyIndicator(med) {
  const band = supplyBand(med);
  if (band === 'untracked') {
    return `<p class="supply-days">Supply not tracked</p>`;
  }
  const d = daysLeft(med);
  const pct = Math.max(3, Math.min(100, Math.round((d / SUPPLY_SCALE_DAYS) * 100)));
  const cls = band === 'critical' ? 'bar-critical' : band === 'low' ? 'bar-low' : 'bar-healthy';
  return `
    <div class="supply-figures">
      <span class="supply-count tnum">${plural(med.pills, 'pill', 'pills')}</span>
      <span class="supply-days">about ${plural(d, 'day', 'days')} left</span>
    </div>
    <div class="bar" role="img" aria-label="${plural(d, 'day', 'days')} of supply remaining, ${esc(band)}">
      <div class="bar-fill ${cls}" style="width:${pct}%"></div>
    </div>`;
}

/** One scheduled dose. The core repeating unit of the app. */
function DoseRow(d, { editable = true, confirmChange = false } = {}) {
  const s = STATUS[d.status];
  const taken = d.status === 'taken';
  const stamp = taken && d.record && d.record.at ? `Taken ${fmtTime(d.record.at)}` : null;
  const sub = [d.med.dose, d.med.instruction].filter(Boolean).join(' · ');

  const dotClass = `is-${d.status === 'due' ? 'due' : d.status}`;
  const glyph = taken ? icon('check', 16)
    : d.status === 'missed' ? icon('alert', 15)
    : d.status === 'skipped' ? icon('slash', 15)
    : '';

  const label = `${d.med.name}, ${d.med.dose}, ${fmtTime(d.time)}, ${s.word}${stamp ? ` at ${fmtTime(d.record.at)}` : ''}`;
  const action = taken ? 'Double tap to undo' : 'Double tap to mark taken';
  const act = confirmChange ? `confirmdose:${d.id}` : `toggledose:${d.id}`;

  return `
    <li class="dose">
      <span class="dose-time tnum" aria-hidden="true">${fmtTime(d.time).replace(' ', ' ')}</span>
      <span class="dose-main">
        <span class="dose-name">${esc(d.med.name)}</span>
        <span class="dose-sub">${esc(sub)}</span>
        <span class="dose-meta">
          ${StatusBadge(d.status)}
          ${stamp ? `<span class="row-sub tnum">${esc(stamp)}</span>` : ''}
        </span>
      </span>
      ${editable ? `
      <button class="status-btn" data-act="${act}" aria-pressed="${taken}"
              aria-label="${esc(label)}. ${action}">
        <span class="status-dot ${dotClass}${taken ? ' pop' : ''}">${glyph}</span>
      </button>` : `
      <span class="status-btn" aria-hidden="true"><span class="status-dot ${dotClass}">${glyph}</span></span>`}
    </li>`;
}

function SectionHeader(title, trailing = '') {
  return `<h2 class="section-header">${esc(title)}${trailing ? `<span class="trailing">${trailing}</span>` : ''}</h2>`;
}

function EmptyState({ iconName, title, body, action }) {
  return `
    <div class="empty">
      <span class="empty-icon">${icon(iconName, 'xl')}</span>
      <h2 class="empty-title">${esc(title)}</h2>
      <p class="empty-body">${esc(body)}</p>
      ${action ? `<button class="btn btn-primary" data-act="${action.act}">${esc(action.label)}</button>` : ''}
    </div>`;
}

function ProgressRing(taken, total) {
  const r = 22, c = 2 * Math.PI * r;
  const pct = total ? taken / total : 0;
  return `
    <svg class="ring" width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
      <circle class="ring-track" cx="28" cy="28" r="${r}" fill="none" stroke-width="5"/>
      <circle class="ring-fill" cx="28" cy="28" r="${r}" fill="none" stroke-width="5"
        stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"
        transform="rotate(-90 28 28)"/>
    </svg>`;
}

function NavBar(title, actions = '') {
  return `
    <header class="nav" id="nav">
      <div class="nav-bar">
        <span class="nav-compact-title" aria-hidden="true">${esc(title)}</span>
        <span class="nav-actions">${actions}</span>
      </div>
    </header>`;
}

/** The large title scrolls with the content and collapses into the bar. */
function LargeTitle(title) {
  return `<h1 class="large-title">${esc(title)}</h1>`;
}

function iconButton(name, label, act, cls = '') {
  return `<button class="icon-btn ${cls}" data-act="${act}" aria-label="${esc(label)}">${icon(name, 'md')}</button>`;
}

/* =========================================================================
 * SCREENS
 * ========================================================================= */

function TodayScreen() {
  const now = new Date();
  const list = dosesOn(now);
  const takenCount = list.filter((d) => d.status === 'taken').length;
  const missed = list.filter((d) => d.status === 'missed');
  const lowMeds = state.meds.filter((m) => ['low', 'critical'].includes(supplyBand(m)));

  if (!state.meds.length) {
    return NavBar('Today', iconButton('gear', 'Settings', 'tab:settings', 'plain'))
      + `<main class="screen" id="screen">${LargeTitle('Today')}${EmptyState({
        iconName: 'pill',
        title: 'No medicines yet',
        body: 'Add your first medicine to start tracking doses and supply.',
        action: { label: 'Add medicine', act: 'add' },
      })}</main>`;
  }

  // Next actionable dose: due first, then the soonest upcoming.
  const next = list.find((d) => d.status === 'due')
    || list.find((d) => d.status === 'upcoming')
    || null;

  const dateLine = `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`;

  let html = NavBar('Today',
    iconButton('plus', 'Add medicine', 'add')
    + iconButton('gear', 'Settings', 'tab:settings', 'plain'));

  html += `<main class="screen" id="screen">${LargeTitle('Today')}`;

  /* date + adherence */
  html += `
    <div class="ring-wrap">
      ${ProgressRing(takenCount, list.length)}
      <div>
        <p class="ring-count tnum" aria-hidden="true">${takenCount} of ${list.length} doses</p>
        <p class="ring-label">${esc(dateLine)}</p>
        <p class="sr-only">${takenCount} of ${list.length} doses taken today.</p>
      </div>
    </div>`;

  /* next dose — emphasis, never alarm */
  if (next) {
    const mins = minutesUntil(next.time, now);
    const sub = [next.med.dose, next.med.instruction].filter(Boolean).join(' · ');
    const band = supplyBand(next.med);
    html += `
      <section class="next" aria-labelledby="next-h">
        <p class="next-label" id="next-h">Next dose</p>
        <p class="next-name">${esc(next.med.name)}</p>
        <p class="next-dose-line">${esc(sub)}</p>
        <p class="next-time tnum">
          ${esc(fmtTime(next.time))}
          <span class="next-rel">${esc(fmtRelative(mins))}</span>
          ${next.status === 'due' ? StatusBadge('due') : ''}
        </p>
        ${band === 'critical' ? `<p class="next-dose-line">${supplyBadge(next.med)}</p>` : ''}
        <div class="next-actions">
          <button class="btn btn-primary" data-act="toggledose:${next.id}"
            aria-label="Take ${esc(next.med.name)}, ${esc(next.med.dose)}, scheduled ${esc(fmtTime(next.time))}">Take</button>
          <button class="btn btn-secondary" data-act="skip:${next.id}"
            aria-label="Skip ${esc(next.med.name)} at ${esc(fmtTime(next.time))}">Skip</button>
        </div>
      </section>`;
  }

  /* attention: missed first, then supply. Never merged. */
  if (missed.length) {
    html += `
      <section class="section">
        <div class="tintcard tint-danger">
          <p class="row-title"><strong>${plural(missed.length, 'dose', 'doses')} missed today</strong></p>
          <p class="row-sub">${esc(missed.map((d) => `${d.med.name} at ${fmtTime(d.time)}`).join(', '))}</p>
        </div>
      </section>`;
  }

  if (lowMeds.length) {
    const critical = lowMeds.filter((m) => supplyBand(m) === 'critical');
    const worst = critical[0] || lowMeds[0];
    const tint = critical.length ? 'tint-danger' : 'tint-warning';
    html += `
      <section class="section">
        <button class="tintcard ${tint} u-block" data-act="refill:${worst.id}"
          aria-label="Refill ${esc(worst.name)}. ${plural(worst.pills, 'pill', 'pills')} left, about ${plural(daysLeft(worst), 'day', 'days')}">
          <span class="row u-flat">
            ${icon(critical.length ? 'alert' : 'boxDown', 'md', !!critical.length)}
            <span class="u-fill">
              <span class="row-title"><strong>${esc(worst.name)} — ${plural(worst.pills, 'pill', 'pills')} left</strong></span>
              <span class="row-sub">About ${plural(daysLeft(worst), 'day', 'days')} left${lowMeds.length > 1 ? ` · ${lowMeds.length - 1} more low` : ''}</span>
            </span>
            ${icon('chevronRight', 'sm')}
          </span>
        </button>
      </section>`;
  }

  /* the schedule */
  html += `<section class="section">${SectionHeader('Schedule')}`;
  if (!list.length) {
    html += `<div class="card"><p class="row-sub">Nothing scheduled today.</p></div>`;
  } else {
    html += `<ul class="group">${list.map((d) => DoseRow(d)).join('')}</ul>`;
    if (takenCount === list.length) {
      html += `<p class="group-footer">${icon('checkCircle', 14)} All doses taken today.</p>`;
    }
  }
  html += `</section></main>`;
  return html;
}

function SupplyScreen() {
  if (!state.meds.length) {
    return NavBar('Supply', iconButton('plus', 'Add medicine', 'add'))
      + `<main class="screen" id="screen">${LargeTitle('Supply')}${EmptyState({
        iconName: 'box',
        title: 'No medicines tracked',
        body: 'Add a medicine to track how much you have left.',
        action: { label: 'Add medicine', act: 'add' },
      })}</main>`;
  }

  const rank = { critical: 0, low: 1, healthy: 2, untracked: 3 };
  const meds = [...state.meds].sort((a, b) => {
    const r = rank[supplyBand(a)] - rank[supplyBand(b)];
    if (r !== 0) return r;
    return (daysLeft(a) ?? 1e6) - (daysLeft(b) ?? 1e6);
  });

  const critical = meds.filter((m) => supplyBand(m) === 'critical');
  const low = meds.filter((m) => supplyBand(m) === 'low');

  let headline, headlineTint = '';
  if (critical.length) {
    headline = `${critical[0].name} runs out in ${plural(daysLeft(critical[0]), 'day', 'days')}`;
    headlineTint = 'tint-danger';
  } else if (low.length) {
    headline = `${plural(low.length, 'medicine', 'medicines')} running low`;
  } else {
    headline = 'All medicines stocked';
  }

  let html = NavBar('Supply', iconButton('plus', 'Add medicine', 'add'));
  html += `<main class="screen" id="screen">${LargeTitle('Supply')}`;
  html += `<p class="large-title u-headline u-mb-3">${esc(headline)}</p>`;

  html += `<section class="section u-section-mid">`;
  html += meds.map((med) => {
    const band = supplyBand(med);
    const badge = supplyBadge(med);
    const sched = `${med.dose} · ${plural(dosesPerDay(med), 'dose', 'doses')} daily`;
    return `
      <article class="card u-mb-3 ${band === 'critical' ? 'card-critical' : ''}">
        <div class="row u-flat u-gap-2 u-top">
          <div class="u-fill">
            <h3 class="dose-name">${esc(med.name)}</h3>
            <p class="dose-sub">${esc(sched)}</p>
          </div>
          ${badge}
        </div>
        ${SupplyIndicator(med)}
        <div class="row u-flat u-gap-2 u-section-actions">
          <button class="btn btn-secondary" data-act="refill:${med.id}"
            aria-label="Refill ${esc(med.name)}">Refill</button>
          <button class="btn btn-ghost" data-act="edit:${med.id}"
            aria-label="Edit ${esc(med.name)}">Edit</button>
        </div>
      </article>`;
  }).join('');
  html += `</section></main>`;
  return html;
}

function HistoryScreen() {
  const d = state.histDate;
  const filterName = state.histMedFilter
    ? (state.meds.find((m) => m.id === state.histMedFilter) || {}).name
    : 'All medicines';

  let html = NavBar('History', iconButton('gear', 'Settings', 'tab:settings', 'plain'));
  html += `<main class="screen" id="screen">${LargeTitle('History')}`;

  /* mode + filter */
  html += `
    <div class="section u-section-tight">
      <div class="segmented" role="tablist" aria-label="History view">
        <button class="segment" role="tab" aria-selected="${state.histMode === 'month'}" data-act="histmode:month">Month</button>
        <button class="segment" role="tab" aria-selected="${state.histMode === 'list'}" data-act="histmode:list">List</button>
      </div>
      <button class="row card u-mt-3 u-block" data-act="medfilter"
        aria-label="Filter by medicine. Currently ${esc(filterName)}">
        ${icon('filter', 'sm')}
        <span class="row-title">${esc(filterName)}</span>
        <span class="row-value">${icon('chevronDown', 'sm')}</span>
      </button>
    </div>`;

  /* stats for the visible month */
  const monthDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  let taken = 0, missedN = 0, skipped = 0;
  for (let day = 1; day <= monthDays; day++) {
    const date = new Date(d.getFullYear(), d.getMonth(), day);
    if (date > today) continue;
    dosesOn(date, state.histMedFilter).forEach((x) => {
      if (x.status === 'taken') taken++;
      else if (x.status === 'missed') missedN++;
      else if (x.status === 'skipped') skipped++;
    });
  }
  const scheduled = taken + missedN + skipped;
  const adherence = scheduled ? Math.round((taken / scheduled) * 100) : null;

  html += `
    <div class="section u-section-loose">
      ${SectionHeader(`${MONTHS[d.getMonth()]} ${d.getFullYear()}`)}
      <div class="group">
        <div class="row"><span class="row-title">Adherence</span>
          <span class="row-value tnum">${adherence == null ? 'No data' : adherence + '%'}</span></div>
        <div class="row"><span class="row-title">${icon('checkCircle', 14)} Taken</span>
          <span class="row-value tnum">${taken}</span></div>
        <div class="row"><span class="row-title">${icon('alert', 14)} Missed</span>
          <span class="row-value tnum">${missedN}</span></div>
        <div class="row"><span class="row-title">${icon('slash', 14)} Skipped</span>
          <span class="row-value tnum">${skipped}</span></div>
      </div>
    </div>`;

  html += state.histMode === 'month' ? CalendarBlock(d, monthDays) : ListBlock();
  html += `</main>`;
  return html;
}

function CalendarBlock(d, monthDays) {
  const firstCol = (new Date(d.getFullYear(), d.getMonth(), 1).getDay() + 6) % 7;
  const heads = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  let cells = '';
  for (let i = 0; i < firstCol; i++) cells += `<span></span>`;
  for (let day = 1; day <= monthDays; day++) {
    const date = new Date(d.getFullYear(), d.getMonth(), day);
    const roll = dayRollup(date, state.histMedFilter);
    const isToday = sameDay(date, today);
    const isSel = sameDay(date, state.histSelected);
    const map = {
      taken:   { cls: 'st-taken',   shape: 'shape-full',  word: 'all taken' },
      partial: { cls: 'st-partial', shape: 'shape-half',  word: 'partly taken' },
      missed:  { cls: 'st-missed',  shape: 'shape-ring',  word: 'missed' },
      skipped: { cls: 'st-skipped', shape: 'shape-slash', word: 'skipped' },
      future:  { cls: 'st-future',  shape: '',            word: 'scheduled' },
      none:    { cls: 'st-future',  shape: '',            word: 'no data' },
    }[roll];
    cells += `
      <button class="cal-cell ${map.cls}${isToday ? ' is-today' : ''}" data-act="selday:${keyOf(date)}"
        aria-pressed="${isSel}" aria-label="${day} ${MONTHS[d.getMonth()]}, ${map.word}${isToday ? ', today' : ''}">
        <span class="tnum" aria-hidden="true">${day}</span>
        ${map.shape ? `<span class="shape ${map.shape}" aria-hidden="true"></span>` : '<span class="shape" aria-hidden="true"></span>'}
      </button>`;
  }

  const sel = state.histSelected;
  const selList = dosesOn(sel, state.histMedFilter);
  const selRoll = dayRollup(sel, state.histMedFilter);
  const isFuture = sel > today && !sameDay(sel, today);
  const rollWord = { taken: 'All taken', partial: 'Partly taken', missed: 'All missed', skipped: 'All skipped', future: 'Scheduled', none: 'No data' }[selRoll];

  return `
    <section class="section">
      <div class="card">
        <div class="row u-flat u-cal-head">
          ${iconButton('chevronLeft', 'Previous month', 'month:-1', 'plain')}
          <span class="row-title u-fill u-center u-semibold">${MONTHS[state.histDate.getMonth()]} ${state.histDate.getFullYear()}</span>
          ${iconButton('chevronRight', 'Next month', 'month:1', 'plain')}
        </div>
        <div class="cal" aria-hidden="true">${heads.map((h) => `<span class="cal-head">${h}</span>`).join('')}</div>
        <div class="cal" role="grid" aria-label="${MONTHS[state.histDate.getMonth()]} ${state.histDate.getFullYear()}">${cells}</div>
        <div class="legend">
          <span class="legend-item"><span class="shape shape-full u-success"></span>All taken</span>
          <span class="legend-item"><span class="shape shape-half u-warning"></span>Partly</span>
          <span class="legend-item"><span class="shape shape-ring u-danger"></span>Missed</span>
          <span class="legend-item"><span class="shape shape-slash u-muted"></span>Skipped</span>
        </div>
      </div>
    </section>

    <section class="section">
      ${SectionHeader(`${DAYS[sel.getDay()]} ${sel.getDate()} ${MONTHS[sel.getMonth()]}`, esc(rollWord))}
      ${selList.length
        ? `<ul class="group">${selList.map((x) => DoseRow(x, { editable: !isFuture, confirmChange: !sameDay(sel, today) })).join('')}</ul>`
        : `<div class="card"><p class="row-sub">No doses recorded for this day.</p></div>`}
      ${isFuture ? `<p class="group-footer">Scheduled — not yet due.</p>` : ''}
    </section>`;
}

function ListBlock() {
  const groups = [];
  for (let back = 0; back < 14; back++) {
    const date = addDays(today, -back);
    const list = dosesOn(date, state.histMedFilter);
    if (!list.length) continue;
    const taken = list.filter((x) => x.status === 'taken').length;
    groups.push(`
      <section class="section">
        ${SectionHeader(
          back === 0 ? 'Today' : back === 1 ? 'Yesterday' : `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`,
          `${taken} of ${list.length} taken`)}
        <ul class="group">${list.map((x) => DoseRow(x, { editable: true, confirmChange: back !== 0 })).join('')}</ul>
      </section>`);
  }
  if (!groups.length) {
    return EmptyState({
      iconName: 'clockCheck',
      title: 'No history yet',
      body: 'Doses you record will appear here.',
      action: null,
    });
  }
  return groups.join('');
}

function SettingsScreen() {
  const row = (label, value, act, opts = {}) => `
    <button class="row" data-act="${act}" ${opts.destructive ? 'aria-describedby="del-warn"' : ''}>
      ${opts.icon ? icon(opts.icon, 'sm') : ''}
      <span class="row-title ${opts.destructive ? 'u-danger' : ''}">${esc(label)}</span>
      <span class="row-value">${value ? esc(value) : ''} ${icon('chevronRight', 'sm')}</span>
    </button>`;

  const switchRow = (label, on, act, sub = '') => `
    <button class="row" data-act="${act}" role="switch" aria-checked="${on}">
      <span class="u-fill">
        <span class="row-title">${esc(label)}</span>
        ${sub ? `<span class="row-sub">${esc(sub)}</span>` : ''}
      </span>
      <span class="switch" aria-hidden="true" aria-checked="${on}"></span>
    </button>`;

  let html = NavBar('Settings', iconButton('close', 'Close settings', 'tab:today', 'plain'));
  html += `<main class="screen" id="screen">${LargeTitle('Settings')}`;

  /* Notifications */
  html += `<section class="section">${SectionHeader('Notifications')}<div class="group">
    ${switchRow('Medication Reminders', state.medicationReminders, 'toggle:medicationReminders', 'Notify at each scheduled dose time')}
    ${switchRow('Low Supply Alerts', state.lowSupplyAlerts, 'toggle:lowSupplyAlerts', 'Notify when a medicine reaches its warning level')}
    <div class="row">
      <span class="u-fill"><span class="row-title">Default warning level</span>
      <span class="row-sub">Used when a medicine has no level of its own</span></span>
      <span class="stepper">
        <button class="stepper-btn" data-act="thresh:-5" aria-label="Decrease default warning level" ${state.globalThreshold <= 5 ? 'disabled' : ''}>${icon('minus', 'sm')}</button>
        <span class="stepper-val tnum" aria-live="polite">${state.globalThreshold}</span>
        <button class="stepper-btn" data-act="thresh:5" aria-label="Increase default warning level" ${state.globalThreshold >= 60 ? 'disabled' : ''}>${icon('plus', 'sm')}</button>
      </span>
    </div>
  </div><p class="group-footer">Reminders and alerts are delivered by iOS. Pillbox never sends your data anywhere.</p></section>`;

  /* Appearance */
  const themeSeg = ['system', 'light', 'dark'].map((t) => `
    <button class="segment" role="tab" aria-selected="${state.theme === t}" data-act="theme:${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('');
  html += `<section class="section">${SectionHeader('Appearance')}
    <div class="group">
      <div class="row u-stack">
        <span class="row-title">Theme</span>
        <span class="segmented" role="tablist" aria-label="Theme">${themeSeg}</span>
      </div>
      <div class="row u-stack">
        <span class="row-title">Text Size</span>
        <span class="segmented" role="tablist" aria-label="Text size">
          ${[['1', 'Default'], ['1.3', 'Large'], ['1.6', 'Larger'], ['2', 'Largest']].map(([v, l]) => `
            <button class="segment" role="tab" aria-selected="${String(state.textScale) === v}" data-act="textscale:${v}">${l}</button>`).join('')}
        </span>
      </div>
      ${switchRow('Reduce Motion', state.reduceMotion, 'toggle:reduceMotion', 'Replaces movement with a gentle fade')}
    </div>
    <p class="group-footer">On iPhone these follow your system settings in Settings &rsaquo; Display &amp; Brightness and Accessibility.</p>
  </section>`;

  /* Data & Privacy */
  html += `<section class="section">${SectionHeader('Data & Privacy')}<div class="group">
    ${row('Medication Data', `${state.meds.length}`, 'tab:supply', { icon: 'pill' })}
    ${row('Export Data', '', 'export', { icon: 'share' })}
    </div>
    <div class="group u-mt-5">
      <button class="row" data-act="deleteall">
        ${icon('trash', 'sm')}<span class="row-title u-danger">Delete All My Data</span>
      </button>
    </div>
    <p class="group-footer" id="del-warn">Deletes every medicine, schedule and history record on this iPhone. This cannot be undone.</p>
  </section>`;

  /* Help */
  html += `<section class="section">${SectionHeader('Help')}<div class="group">
    ${row('Help & Support', '', 'info:help', { icon: 'help' })}
    ${row('Contact', '', 'info:contact', { icon: 'mail' })}
  </div></section>`;

  /* Legal */
  html += `<section class="section">${SectionHeader('Legal')}<div class="group">
    ${row('Privacy Policy', '', 'info:privacy', { icon: 'shield' })}
    ${row('Terms of Use', '', 'info:terms', { icon: 'doc' })}
    ${row('Medical Disclaimer', '', 'info:disclaimer', { icon: 'info' })}
  </div></section>`;

  /* About */
  html += `<section class="section">${SectionHeader('About')}<div class="group">
    <div class="row"><span class="row-title">Pillbox</span><span class="row-value">Medication tracker</span></div>
    <div class="row"><span class="row-title">Version</span><span class="row-value tnum">2.0.0</span></div>
  </div>
  <p class="group-footer">Pillbox helps you track medicines you have been prescribed. It does not give medical advice.</p>
  </section>`;

  html += `</main>`;
  return html;
}

/* =========================================================================
 * TAB BAR
 * ========================================================================= */

function TabBar() {
  const tabs = [
    { id: 'today', label: 'Today' },
    { id: 'supply', label: 'Supply' },
    { id: 'history', label: 'History' },
  ];
  return `
    <nav class="tabbar" role="tablist" aria-label="Main">
      ${tabs.map((t) => {
        const on = state.tab === t.id;
        return `<button class="tab" role="tab" aria-selected="${on}" data-act="tab:${t.id}"
          aria-label="${esc(t.label)}${on ? ', selected' : ''}">
          ${tabIcon(t.id, on)}
          <span class="tab-label">${esc(t.label)}</span>
        </button>`;
      }).join('')}
    </nav>`;
}

/* =========================================================================
 * SHEETS
 * ========================================================================= */

const FREQ_PRESETS = {
  1: ['08:00'],
  2: ['08:00', '20:00'],
  3: ['08:00', '14:00', '20:00'],
};

function blankForm() {
  return { id: null, name: '', dose: '', instruction: '', freq: 2, times: ['08:00', '20:00'], remindersOn: true, lead: 0, pills: '', threshold: '', errors: {} };
}

function AddSheet() {
  const f = state.form;
  const step = state.step;
  const titles = ['Medicine', 'Schedule', 'Reminders', 'Supply'];
  const editing = f.id != null;

  const pips = titles.map((_, i) => `<span class="step-pip ${i <= step ? 'done' : ''}"></span>`).join('');

  let body = '';
  if (step === 0) {
    body = `
      <div class="field">
        <label class="label" for="f-name">Medicine name</label>
        <input class="input ${f.errors.name ? 'has-error' : ''}" id="f-name" data-field="name"
          value="${esc(f.name)}" autocapitalize="words" autocomplete="off"
          placeholder="Metformin" ${f.errors.name ? 'aria-invalid="true" aria-describedby="e-name"' : ''}>
        ${f.errors.name ? `<p class="error" id="e-name">${icon('alert', 14, true)}${esc(f.errors.name)}</p>` : ''}
      </div>
      <div class="field">
        <label class="label" for="f-dose">Dose</label>
        <input class="input" id="f-dose" data-field="dose" value="${esc(f.dose)}"
          placeholder="500 mg" autocomplete="off">
        <p class="hint">Whatever is on the label — “500 mg”, “2 tablets”, “10 units”. Left empty, doses are recorded as “1 dose”.</p>
      </div>
      <div class="field">
        <label class="label" for="f-instr">Instructions <span class="u-optional">(optional)</span></label>
        <input class="input" id="f-instr" data-field="instruction" value="${esc(f.instruction)}"
          placeholder="With food" autocomplete="off">
      </div>`;
  } else if (step === 1) {
    const freqBtn = (n, label) => `
      <button class="chip" data-act="freq:${n}" aria-pressed="${f.freq === n}">${label}</button>`;
    const summary = f.times.length
      ? `${f.times.length === 1 ? 'Once' : f.times.length === 2 ? 'Twice' : f.times.length + ' times'} daily at ${f.times.map(fmtTime).join(', ')}.`
      : '';
    body = `
      <div class="field">
        <span class="label" id="freq-l">How often?</span>
        <div class="chips" role="group" aria-labelledby="freq-l">
          ${freqBtn(1, 'Once daily')}${freqBtn(2, 'Twice daily')}${freqBtn(3, '3 times')}${freqBtn('custom', 'Custom')}
        </div>
        ${f.errors.freq ? `<p class="error">${icon('alert', 14, true)}${esc(f.errors.freq)}</p>` : ''}
      </div>
      <div class="field">
        <span class="label" id="times-l">At what times?</span>
        <div class="chips" role="group" aria-labelledby="times-l">
          ${f.times.map((t, i) => `
            <label class="chip time-chip">
              <span class="sr-only">Dose ${i + 1} time</span>
              <input type="time" value="${t}" data-timeidx="${i}"
                class="u-timeinput"
                aria-label="Dose ${i + 1} time">
            </label>`).join('')}
          ${f.freq === 'custom' && f.times.length < 12
            ? `<button class="chip" data-act="addtime" aria-label="Add another dose time">${icon('plus', 14)}Add time</button>` : ''}
          ${f.freq === 'custom' && f.times.length > 1
            ? `<button class="chip" data-act="rmtime" aria-label="Remove last dose time">${icon('minus', 14)}Remove</button>` : ''}
        </div>
        <p class="hint">${esc(summary)}</p>
      </div>`;
  } else if (step === 2) {
    body = `
      <div class="group u-mb-5">
        <button class="row" data-act="toggleform:remindersOn" role="switch" aria-checked="${f.remindersOn}">
          <span class="u-fill"><span class="row-title">Remind me</span>
          <span class="row-sub">A notification at each dose time</span></span>
          <span class="switch" aria-hidden="true" aria-checked="${f.remindersOn}"></span>
        </button>
      </div>
      ${f.remindersOn ? `
      <div class="field">
        <span class="label" id="lead-l">When?</span>
        <div class="chips" role="group" aria-labelledby="lead-l">
          ${[[0, 'At dose time'], [5, '5 min before'], [15, '15 min'], [30, '30 min']].map(([v, l]) => `
            <button class="chip" data-act="lead:${v}" aria-pressed="${f.lead === v}">${l}</button>`).join('')}
        </div>
      </div>` : `<p class="hint">You can turn reminders on later from this medicine's settings.</p>`}`;
  } else {
    const n = parseInt(f.pills, 10);
    const per = f.times.length || 1;
    const est = !isNaN(n) && n > 0 ? `${plural(n, 'pill', 'pills')} · about ${plural(Math.floor(n / per), 'day', 'days')} at this schedule` : '';
    body = `
      <div class="field">
        <label class="label" for="f-pills">Pills on hand <span class="u-optional">(optional)</span></label>
        <input class="input ${f.errors.pills ? 'has-error' : ''}" id="f-pills" data-field="pills"
          inputmode="numeric" value="${esc(f.pills)}" placeholder="60"
          ${f.errors.pills ? 'aria-invalid="true" aria-describedby="e-pills"' : ''}>
        ${f.errors.pills ? `<p class="error" id="e-pills">${icon('alert', 14, true)}${esc(f.errors.pills)}</p>` : ''}
        <p class="hint" id="supply-est" aria-live="polite">${esc(est)}</p>
      </div>
      <div class="field">
        <label class="label" for="f-thresh">Warn me at</label>
        <input class="input" id="f-thresh" data-field="threshold" inputmode="numeric"
          value="${esc(f.threshold)}" placeholder="${state.globalThreshold}">
        <p class="hint">Pills remaining before Pillbox warns you. Left empty, your default of ${state.globalThreshold} is used.</p>
      </div>`;
  }

  const lastStep = step === 3;
  return `
    <div class="scrim" data-act="closesheet"></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-t">
      <div class="grabber" aria-hidden="true"></div>
      <div class="sheet-head">
        <button class="sheet-head-btn" data-act="${step === 0 ? 'closesheet' : 'step:-1'}">${step === 0 ? 'Cancel' : 'Back'}</button>
        <span class="sheet-title" id="sheet-t">${editing ? 'Edit medicine' : 'Add medicine'}</span>
        <button class="sheet-head-btn u-end" data-act="${lastStep ? 'saveform' : 'step:1'}">${lastStep ? 'Save' : 'Next'}</button>
      </div>
      <div class="steps" aria-hidden="true">${pips}</div>
      <p class="step-caption">Step ${step + 1} of 4 · ${titles[step]}</p>
      <div class="sheet-body">${body}</div>
      <div class="sheet-foot">
        <button class="btn btn-primary btn-block" data-act="${lastStep ? 'saveform' : 'step:1'}">
          ${lastStep ? (editing ? 'Save changes' : 'Save medicine') : 'Next'}</button>
        ${step === 3 && !editing ? `<button class="btn btn-ghost btn-block" data-act="saveform">Set up supply later</button>` : ''}
      </div>
    </div>`;
}

function RefillSheet() {
  const med = state.meds.find((m) => m.id === state.refill.medId);
  if (!med) return '';
  const add = state.refill.amount;
  const newTotal = med.pills + add;
  const newDays = Math.floor(newTotal / dosesPerDay(med));

  return `
    <div class="scrim" data-act="closesheet"></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="refill-t">
      <div class="grabber" aria-hidden="true"></div>
      <div class="sheet-head">
        <button class="sheet-head-btn" data-act="closesheet">Cancel</button>
        <span class="sheet-title" id="refill-t">Refill</span>
        <span class="sheet-head-btn" aria-hidden="true"></span>
      </div>
      <div class="sheet-body">
        <div class="card u-mb-5">
          <h3 class="dose-name">${esc(med.name)}</h3>
          <p class="dose-sub">${esc(med.dose)}</p>
          ${SupplyIndicator(med)}
        </div>
        <div class="field">
          <span class="label" id="quick-l">Add pills</span>
          <div class="chips" role="group" aria-labelledby="quick-l">
            ${[30, 60, 90].map((n) => `<button class="chip" data-act="refillset:${n}" aria-pressed="${add === n}">+${n}</button>`).join('')}
          </div>
        </div>
        <div class="field">
          <label class="label" for="r-amt">Or enter an amount</label>
          <div class="row u-flat">
            <input class="input u-fill ${state.refill.error ? 'has-error' : ''}" id="r-amt" data-field="refillAmount"
              inputmode="numeric" value="${add || ''}" placeholder="0"
              ${state.refill.error ? 'aria-invalid="true" aria-describedby="e-refill"' : ''}>
            <span class="stepper">
              <button class="stepper-btn" data-act="refilladd:-1" aria-label="One fewer pill" ${add <= 0 ? 'disabled' : ''}>${icon('minus', 'sm')}</button>
              <button class="stepper-btn" data-act="refilladd:1" aria-label="One more pill">${icon('plus', 'sm')}</button>
            </span>
          </div>
          ${state.refill.error ? `<p class="error" id="e-refill">${icon('alert', 14, true)}${esc(state.refill.error)}</p>` : ''}
        </div>
        ${add > 0 ? `<div class="tintcard tint-success" aria-live="polite">
          <p class="row-title"><strong>New total: ${plural(newTotal, 'pill', 'pills')}</strong></p>
          <p class="row-sub">About ${plural(newDays, 'day', 'days')} at this schedule</p>
        </div>` : ''}
      </div>
      <div class="sheet-foot">
        <button class="btn btn-primary btn-block" data-act="confirmrefill" ${add <= 0 ? 'disabled' : ''}>
          ${add > 0 ? `Add ${plural(add, 'pill', 'pills')}` : 'Add pills'}</button>
      </div>
    </div>`;
}

function ConfirmSheet() {
  const c = state.sheet.confirm;
  return `
    <div class="scrim" data-act="closesheet"></div>
    <div class="sheet" role="alertdialog" aria-modal="true" aria-labelledby="c-t" aria-describedby="c-b">
      <div class="grabber" aria-hidden="true"></div>
      <div class="sheet-body u-section-loose u-center">
        <h2 class="empty-title" id="c-t">${esc(c.title)}</h2>
        <p class="empty-body u-confirm-body" id="c-b">${esc(c.body)}</p>
      </div>
      <div class="sheet-foot">
        <button class="btn ${c.destructive ? 'btn-destructive-filled' : 'btn-primary'} btn-block" data-act="${c.act}">${esc(c.confirmLabel)}</button>
        <button class="btn btn-secondary btn-block" data-act="closesheet">Cancel</button>
      </div>
    </div>`;
}

function PickerSheet() {
  const opts = [{ id: null, name: 'All medicines' }, ...state.meds];
  return `
    <div class="scrim" data-act="closesheet"></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="p-t">
      <div class="grabber" aria-hidden="true"></div>
      <div class="sheet-head">
        <button class="sheet-head-btn" data-act="closesheet">Cancel</button>
        <span class="sheet-title" id="p-t">Filter by medicine</span>
        <span class="sheet-head-btn" aria-hidden="true"></span>
      </div>
      <div class="sheet-body u-pb-5">
        <div class="group">
          ${opts.map((m) => {
            const on = state.histMedFilter === m.id;
            return `<button class="row" data-act="setfilter:${m.id ?? 'all'}" aria-pressed="${on}">
              <span class="row-title">${esc(m.name)}</span>
              <span class="row-value">${on ? icon('check', 'sm') : ''}</span>
            </button>`;
          }).join('')}
        </div>
      </div>
      <div class="sheet-foot"></div>
    </div>`;
}

function InfoSheet() {
  const TEXT = {
    help: ['Help & Support', 'Pillbox tracks the medicines you have been prescribed. Tap a dose on Today to record it, and Supply to see what needs reordering. Nothing you enter leaves your iPhone.'],
    contact: ['Contact', 'This is a prototype, so there is no support inbox yet. In the shipping app this row opens Mail with a pre-filled diagnostic report you can review before sending.'],
    privacy: ['Privacy Policy', 'Pillbox stores your medicines, schedules and dose history on your iPhone only. There is no account, no server and no analytics. Nothing is uploaded, sold or shared. Deleting the app deletes the data with it.'],
    terms: ['Terms of Use', 'Pillbox is provided as-is for personal medication tracking. You are responsible for the accuracy of what you enter. Reminders depend on iOS notification delivery and should not be your only safeguard for a critical medicine.'],
    disclaimer: ['Medical Disclaimer', 'Pillbox is a tracking tool, not a medical device. It does not give medical advice, recommend doses, or interpret your adherence as a measure of health. Never change how you take a medicine based on this app. Talk to your doctor or pharmacist about anything concerning a prescription.'],
  }[state.sheet.info];

  return `
    <div class="scrim" data-act="closesheet"></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="i-t">
      <div class="grabber" aria-hidden="true"></div>
      <div class="sheet-head">
        <span class="sheet-head-btn" aria-hidden="true"></span>
        <span class="sheet-title" id="i-t">${esc(TEXT[0])}</span>
        <button class="sheet-head-btn u-end" data-act="closesheet">Done</button>
      </div>
      <div class="sheet-body"><p class="empty-body u-measure-none">${esc(TEXT[1])}</p></div>
      <div class="sheet-foot"></div>
    </div>`;
}

/* =========================================================================
 * RENDER
 * ========================================================================= */

function render() {
  const root = document.documentElement;
  root.dataset.theme = state.theme;
  root.dataset.motion = state.reduceMotion ? 'reduced' : 'normal';
  root.style.setProperty('--text-scale', state.textScale);

  const prevScroll = $('#screen') ? $('#screen').scrollTop : 0;
  const activeId = document.activeElement ? document.activeElement.id : null;
  const activeAct = document.activeElement ? document.activeElement.dataset?.act : null;

  const screens = {
    today: TodayScreen,
    supply: SupplyScreen,
    history: HistoryScreen,
    settings: SettingsScreen,
  };
  $('#root').innerHTML = (screens[state.tab] || TodayScreen)()
    + (state.tab === 'settings' ? '' : TabBar());

  /* overlays */
  let ov = '';
  if (state.sheet) {
    if (state.sheet.kind === 'add') ov = AddSheet();
    else if (state.sheet.kind === 'refill') ov = RefillSheet();
    else if (state.sheet.kind === 'confirm') ov = ConfirmSheet();
    else if (state.sheet.kind === 'picker') ov = PickerSheet();
    else if (state.sheet.kind === 'info') ov = InfoSheet();
  }
  if (state.banner) {
    ov += `<button class="banner" data-act="${state.banner.act}">
      <span class="u-bell">${icon('bell', 'sm')}</span>
      <span class="u-fill">
        <span class="banner-app">Pillbox</span>
        <span class="banner-title">${esc(state.banner.title)}</span>
        <span class="banner-body">${esc(state.banner.body)}</span>
      </span></button>`;
  }
  if (state.toast) {
    ov += `<div class="toast" role="status">
      <span class="toast-msg">${esc(state.toast.msg)}</span>
      ${state.toast.action ? `<button class="toast-action" data-act="${state.toast.action.act}">${esc(state.toast.action.label)}</button>` : ''}
    </div>`;
  }
  $('#overlays').innerHTML = ov;

  /* restore scroll and focus */
  const screen = $('#screen');
  if (screen) {
    screen.scrollTop = state.sheet ? prevScroll : (state.scroll[state.tab] ?? prevScroll);
    screen.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  if (activeId && document.getElementById(activeId)) {
    const el = document.getElementById(activeId);
    el.focus();
    if (el.setSelectionRange && el.type === 'text') {
      const n = el.value.length; try { el.setSelectionRange(n, n); } catch (_) {}
    }
  } else if (activeAct) {
    const el = document.querySelector(`[data-act="${CSS.escape(activeAct)}"]`);
    if (el) el.focus();
  }
  /* move focus into a newly opened sheet */
  const sheet = $('.sheet');
  if (sheet && !sheet.contains(document.activeElement)) {
    const target = sheet.querySelector('input, button:not([disabled])');
    if (target) target.focus({ preventScroll: true });
  }
}

function onScroll() {
  const screen = $('#screen'), nav = $('#nav');
  if (!screen || !nav) return;
  nav.classList.toggle('is-scrolled', screen.scrollTop > 12);
  if (!state.sheet) state.scroll[state.tab] = screen.scrollTop;
}

/* =========================================================================
 * EVENTS
 * ========================================================================= */

function closeSheet() {
  state.sheet = null;
  state.form = null;
  state.refill = null;
  render();
  if (state.lastFocus) {
    const el = document.querySelector(`[data-act="${CSS.escape(state.lastFocus)}"]`);
    if (el) el.focus();
    state.lastFocus = null;
  }
}

function openSheet(kind, extra = {}) {
  state.lastFocus = document.activeElement?.dataset?.act || null;
  state.sheet = { kind, ...extra };
  render();
}

function validateStep(step) {
  const f = state.form;
  f.errors = {};
  if (step === 0 && !f.name.trim()) f.errors.name = 'Give the medicine a name so you can recognise it.';
  if (step === 1 && !f.times.length) f.errors.freq = 'Choose how often you take this medicine.';
  if (step === 3 && f.pills.trim()) {
    const n = parseInt(f.pills, 10);
    if (isNaN(n) || n < 0) f.errors.pills = 'Enter a whole number of pills, or leave this empty.';
  }
  return !Object.keys(f.errors).length;
}

function saveForm() {
  const f = state.form;
  for (let s = 0; s <= 3; s++) {
    if (!validateStep(s)) { state.step = s; render(); focusFirstError(); return; }
  }
  const pills = f.pills.trim() ? parseInt(f.pills, 10) : null;
  const threshold = f.threshold.trim() ? parseInt(f.threshold, 10) : state.globalThreshold;
  const data = {
    name: f.name.trim(),
    dose: f.dose.trim() || '1 dose',
    instruction: f.instruction.trim(),
    times: [...f.times].sort(),
    pills,
    threshold: isNaN(threshold) ? state.globalThreshold : threshold,
    remindersOn: f.remindersOn,
    lead: f.lead,
  };
  if (f.id != null) {
    const med = state.meds.find((m) => m.id === f.id);
    Object.assign(med, data);
  } else {
    state.meds.push({ id: Date.now(), ...data });
  }
  const name = data.name;
  const editing = f.id != null;
  closeSheet();
  state.tab = editing ? state.tab : 'supply';
  toast(`${name} ${editing ? 'updated' : 'added'}`);
}

function focusFirstError() {
  const el = $('.input.has-error');
  if (el) { el.focus(); el.scrollIntoView({ block: 'center', behavior: state.reduceMotion ? 'auto' : 'smooth' }); }
}

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el) return;
  const [cmd, a, b] = el.dataset.act.split(':');

  switch (cmd) {
    case 'tab':
      state.tab = a; state.sheet = null; render(); break;

    case 'add':
      state.form = blankForm(); state.step = 0; openSheet('add'); break;

    case 'edit': {
      const med = state.meds.find((m) => m.id === Number(a));
      const freq = FREQ_PRESETS[med.times.length] &&
        FREQ_PRESETS[med.times.length].join() === med.times.join() ? med.times.length : 'custom';
      state.form = {
        id: med.id, name: med.name, dose: med.dose, instruction: med.instruction,
        freq, times: [...med.times], remindersOn: med.remindersOn, lead: med.lead,
        pills: med.pills == null ? '' : String(med.pills),
        threshold: String(med.threshold), errors: {},
      };
      state.step = 0; openSheet('add'); break;
    }

    case 'step': {
      const dir = Number(a);
      if (dir > 0 && !validateStep(state.step)) { render(); focusFirstError(); return; }
      state.step = Math.max(0, Math.min(3, state.step + dir));
      render(); break;
    }

    case 'saveform': saveForm(); break;

    case 'freq': {
      const f = state.form;
      if (a === 'custom') { f.freq = 'custom'; }
      else { f.freq = Number(a); f.times = [...FREQ_PRESETS[a]]; }
      f.errors = {}; render(); break;
    }
    case 'addtime': state.form.times.push('12:00'); render(); break;
    case 'rmtime': state.form.times.pop(); render(); break;
    case 'lead': state.form.lead = Number(a); render(); break;
    case 'toggleform': state.form[a] = !state.form[a]; render(); break;

    case 'toggledose': {
      const doseId = el.dataset.act.slice('toggledose:'.length);
      const cur = state.records[doseId];
      setDoseStatus(doseId, cur && cur.status === 'taken' ? null : 'taken');
      break;
    }

    case 'confirmdose': {
      const doseId = el.dataset.act.slice('confirmdose:'.length);
      const cur = state.records[doseId];
      const willTake = !(cur && cur.status === 'taken');
      const [, medIdStr, time] = doseId.split('|');
      const med = state.meds.find((m) => m.id === Number(medIdStr));
      openSheet('confirm', {
        confirm: {
          title: willTake ? 'Mark as taken?' : 'Mark as missed?',
          body: `${med.name} at ${fmtTime(time)}. This changes a past record in your history.`,
          confirmLabel: willTake ? 'Mark taken' : 'Mark missed',
          destructive: !willTake,
          act: `dodose:${doseId}:${willTake ? 'taken' : 'missed'}`,
        },
      });
      break;
    }

    case 'dodose': {
      const parts = el.dataset.act.split(':');
      const status = parts[parts.length - 1];
      const doseId = parts.slice(1, -1).join(':');
      closeSheet();
      setDoseStatus(doseId, status);
      break;
    }

    case 'skip': {
      const doseId = el.dataset.act.slice('skip:'.length);
      setDoseStatus(doseId, 'skipped');
      break;
    }

    case 'undo': {
      const parts = el.dataset.act.split(':');
      const prev = parts[parts.length - 1];
      const doseId = parts.slice(1, -1).join(':');
      undoDose(doseId, prev || null);
      break;
    }

    case 'refill':
      state.refill = { medId: Number(a), amount: 0, error: '' };
      state.banner = null;
      openSheet('refill');
      break;
    case 'refillset': state.refill.amount = Number(a); state.refill.error = ''; render(); break;
    case 'refilladd':
      state.refill.amount = Math.max(0, state.refill.amount + Number(a));
      state.refill.error = ''; render(); break;
    case 'confirmrefill': {
      const r = state.refill;
      if (!r.amount) { r.error = 'Enter how many pills you added.'; render(); return; }
      const med = state.meds.find((m) => m.id === r.medId);
      med.pills += r.amount;
      const name = med.name, total = med.pills;
      closeSheet();
      toast(`${name} restocked — ${plural(total, 'pill', 'pills')}`);
      break;
    }

    case 'histmode': state.histMode = a; render(); break;
    case 'medfilter': openSheet('picker'); break;
    case 'setfilter':
      state.histMedFilter = a === 'all' ? null : Number(a);
      closeSheet(); break;
    case 'month': {
      const d = new Date(state.histDate);
      d.setMonth(d.getMonth() + Number(a));
      state.histDate = d; render(); break;
    }
    case 'selday': {
      const [y, m, dd] = a.split('-').map(Number);
      state.histSelected = new Date(y, m - 1, dd);
      render(); break;
    }

    case 'theme': state.theme = a; render(); break;
    case 'textscale': state.textScale = Number(a); render(); break;
    case 'toggle': state[a] = !state[a]; render(); break;
    case 'thresh':
      state.globalThreshold = Math.max(5, Math.min(60, state.globalThreshold + Number(a)));
      render(); break;

    case 'export':
      toast('Export prepared — 3 medicines, 45 days of history');
      break;

    case 'deleteall':
      openSheet('confirm', {
        confirm: {
          title: 'Delete all data?',
          body: 'This deletes every medicine, schedule and history record on this iPhone. This cannot be undone.',
          confirmLabel: 'Delete Everything',
          destructive: true,
          act: 'dodeleteall',
        },
      });
      break;
    case 'dodeleteall':
      state.meds = []; state.records = {};
      closeSheet(); state.tab = 'today';
      toast('All data deleted');
      break;

    case 'info': openSheet('info', { info: a }); break;
    case 'closesheet': closeSheet(); break;
    default: break;
  }
});

/* text inputs update state without a re-render, so focus and caret survive */
document.addEventListener('input', (ev) => {
  const el = ev.target;
  const field = el.dataset.field;
  if (field) {
    if (field === 'refillAmount') {
      const v = el.value.replace(/[^0-9]/g, '').slice(0, 4);
      if (v !== el.value) el.value = v;
      state.refill.amount = parseInt(v, 10) || 0;
      state.refill.error = '';
      render();
      const again = document.getElementById('r-amt');
      if (again) { again.focus(); again.setSelectionRange(again.value.length, again.value.length); }
      return;
    }
    if (field === 'pills' || field === 'threshold') {
      const v = el.value.replace(/[^0-9]/g, '').slice(0, 4);
      if (v !== el.value) el.value = v;
      state.form[field] = v;
      if (field === 'pills') {
        const n = parseInt(v, 10);
        const per = state.form.times.length || 1;
        const est = document.getElementById('supply-est');
        if (est) {
          est.textContent = !isNaN(n) && n > 0
            ? `${plural(n, 'pill', 'pills')} · about ${plural(Math.floor(n / per), 'day', 'days')} at this schedule`
            : '';
        }
      }
      return;
    }
    state.form[field] = el.value;
    return;
  }
  if (el.dataset.timeidx != null) {
    state.form.times[Number(el.dataset.timeidx)] = el.value;
    render();
  }
});

/* Escape closes the top overlay; Tab is trapped inside an open sheet */
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && state.sheet) { ev.preventDefault(); closeSheet(); return; }
  if (ev.key !== 'Tab' || !state.sheet) return;
  const sheet = $('.sheet');
  if (!sheet) return;
  const f = [...sheet.querySelectorAll('button:not([disabled]), input, [tabindex]:not([tabindex="-1"])')]
    .filter((n) => n.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
  else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
});

render();
