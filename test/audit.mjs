import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = 'file://' + path.join(ROOT, 'index.html');

const CHECKS = `
(() => {
  const out = { targets: [], names: [], overflow: null, contrast: [] };

  // 1. touch targets >= 44x44
  document.querySelectorAll('button, input, [role="switch"], [role="tab"]').forEach(el => {
    if (el.offsetParent === null && el.type !== 'time') return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    if (r.width < 43.5 || r.height < 43.5) {
      out.targets.push({
        tag: el.tagName, act: el.dataset.act || el.id || el.className.slice(0,40),
        w: Math.round(r.width), h: Math.round(r.height),
      });
    }
  });

  // 2. accessible name on every interactive element
  document.querySelectorAll('button, input').forEach(el => {
    if (el.offsetParent === null && el.type !== 'time') return;
    const name = el.getAttribute('aria-label')
      || (el.getAttribute('aria-labelledby') && document.getElementById(el.getAttribute('aria-labelledby'))?.textContent)
      || el.textContent.trim()
      || (el.labels && el.labels[0] && el.labels[0].textContent.trim());
    if (!name) out.names.push({ tag: el.tagName, act: el.dataset.act || el.id || el.className.slice(0,40) });
  });

  // 3. horizontal overflow
  const doc = document.documentElement;
  out.overflow = doc.scrollWidth > doc.clientWidth + 1
    ? { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth } : null;

  // 4. contrast of every visible text node against its painted background
  function lum(rgb) {
    const [r,g,b] = rgb;
    const f = c => { c/=255; return c<=.04045 ? c/12.92 : Math.pow((c+.055)/1.055, 2.4); };
    return .2126*f(r) + .7152*f(g) + .0722*f(b);
  }
  function parse(s) { const m = s.match(/\\d+(\\.\\d+)?/g); return m ? m.slice(0,3).map(Number) : null; }
  function bgOf(el) {
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      const c = parse(cs.backgroundColor);
      const a = cs.backgroundColor.includes('rgba') ? parseFloat(cs.backgroundColor.split(',')[3]) : 1;
      if (c && a > .5) return c;
      n = n.parentElement;
    }
    return parse(getComputedStyle(document.body).backgroundColor) || [255,255,255];
  }
  document.querySelectorAll('*').forEach(el => {
    if (el.offsetParent === null) return;
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!hasText) return;
    if (el.closest('.sr-only')) return;
    const cs = getComputedStyle(el);
    const fg = parse(cs.color); if (!fg) return;
    const bg = bgOf(el);
    const l1 = lum(fg), l2 = lum(bg);
    const ratio = (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
    const px = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight,10) >= 700;
    const large = px >= 24 || (px >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    if (ratio < need) {
      out.contrast.push({
        text: el.textContent.trim().slice(0,32), ratio: +ratio.toFixed(2), need,
        px: +px.toFixed(1), cls: el.className.slice(0,30),
      });
    }
  });
  return out;
})()
`;

(async () => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const scenarios = [];
  for (const dark of [false, true]) {
    for (const tab of ['today', 'supply', 'history', 'settings']) {
      scenarios.push({ tab, dark, scale: 1, width: 393 });
    }
  }
  scenarios.push({ tab: 'today', dark: false, scale: 2, width: 393 });
  scenarios.push({ tab: 'supply', dark: false, scale: 2, width: 320 });
  scenarios.push({ tab: 'history', dark: false, scale: 1, width: 320 });
  scenarios.push({ tab: 'today', dark: false, scale: 1, width: 320, sheet: 'add' });
  scenarios.push({ tab: 'supply', dark: true, scale: 1, width: 393, sheet: 'refill' });

  let fails = 0;
  for (const sc of scenarios) {
    const ctx = await browser.newContext({
      viewport: { width: sc.width, height: 852 },
      colorScheme: sc.dark ? 'dark' : 'light', isMobile: true, hasTouch: true,
    });
    const page = await ctx.newPage();
    await page.goto(APP);
    await page.evaluate(([tab, dark, scale]) => {
      state.tab = tab; if (dark) state.theme = 'dark'; state.textScale = scale; render();
    }, [sc.tab, sc.dark, sc.scale]);
    if (sc.sheet === 'add') await page.evaluate(() => { state.form = blankForm(); state.step = 0; openSheet('add'); });
    if (sc.sheet === 'refill') await page.evaluate(() => { state.refill = { medId: 2, amount: 0, error: '' }; openSheet('refill'); });
    await page.waitForTimeout(150);

    const r = await page.evaluate(CHECKS);
    const tag = `${sc.tab}${sc.sheet ? '/' + sc.sheet : ''} ${sc.dark ? 'dark' : 'light'} ${sc.scale}x @${sc.width}`;
    const issues = [];
    if (r.targets.length) issues.push(`TARGETS<44: ${JSON.stringify(r.targets)}`);
    if (r.names.length) issues.push(`NO ACCESSIBLE NAME: ${JSON.stringify(r.names)}`);
    if (r.overflow) issues.push(`H-OVERFLOW: ${JSON.stringify(r.overflow)}`);
    if (r.contrast.length) issues.push(`CONTRAST: ${JSON.stringify(r.contrast)}`);
    if (issues.length) { fails++; console.log(`\n✗ ${tag}\n  ` + issues.join('\n  ')); }
    else console.log(`✓ ${tag}`);
    await ctx.close();
  }
  await browser.close();
  console.log(`\n${fails ? fails + ' scenario(s) with findings' : 'all scenarios clean'}`);
})();
