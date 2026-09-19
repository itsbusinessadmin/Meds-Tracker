import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = 'file://' + path.join(ROOT, 'index.html');
let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n); } };

(async () => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(APP);

  console.log('\nAdd medicine, 4 steps:');
  await page.click('[data-act="add"]');
  await page.click('[data-act="step:1"]');                       // no name -> blocked
  ok('blocks step 1 without a name', await page.$eval('#e-name', e => !!e.textContent));
  await page.fill('#f-name', 'Amlodipine');
  await page.fill('#f-dose', '5 mg');
  await page.click('[data-act="step:1"]');
  ok('advances to schedule', (await page.$eval('.step-caption', e => e.textContent)).includes('Schedule'));
  await page.click('[data-act="freq:1"]');
  ok('once-daily sets one time', await page.$$eval('[data-timeidx]', n => n.length === 1));
  await page.click('[data-act="step:1"]');
  await page.click('[data-act="lead:15"]');
  await page.click('[data-act="step:1"]');
  await page.fill('#f-pills', '30');
  ok('live supply estimate', (await page.$eval('#supply-est', e => e.textContent)).includes('30 days'));
  await page.click('[data-act="saveform"]');
  await page.waitForTimeout(200);
  ok('medicine saved', await page.evaluate(() => state.meds.some(m => m.name === 'Amlodipine')));
  ok('lands on Supply', await page.evaluate(() => state.tab === 'supply'));

  console.log('\nDose recording and undo:');
  await page.evaluate(() => { state.tab = 'today'; render(); });
  // act on the dose the control actually targets, not a guessed medicine
  const target = await page.$eval('[data-act^="toggledose:"]', el => {
    const id = el.dataset.act.slice('toggledose:'.length);
    return { id, medId: Number(id.split('|')[1]), wasTaken: !!state.records[id] };
  });
  const before = await page.evaluate(m => state.meds.find(x => x.id === m).pills, target.medId);
  await page.click('[data-act^="toggledose:"]');
  await page.waitForTimeout(150);
  const after = await page.evaluate(m => state.meds.find(x => x.id === m).pills, target.medId);
  ok(`supply moves by one on take (${before} -> ${after})`,
     target.wasTaken ? after === before + 1 : after === before - 1);
  ok('toast offers undo', await page.$('.toast-action') !== null);
  await page.click('.toast-action');
  await page.waitForTimeout(150);
  ok('undo restores supply',
     await page.evaluate(m => state.meds.find(x => x.id === m).pills, target.medId) === before);
  ok('undo restores the record too',
     await page.evaluate(t => !!state.records[t.id] === t.wasTaken, target));

  console.log('\nPast records ask before changing:');
  await page.evaluate(() => { state.tab = 'history'; render(); });
  await page.evaluate(() => {
    const d = new Date(); d.setDate(d.getDate() - 3);
    state.histSelected = d; render();
  });
  const past = await page.$('[data-act^="confirmdose:"]');
  ok('past dose uses the confirming control', past !== null);
  if (past) {
    await past.click(); await page.waitForTimeout(200);
    ok('confirmation sheet appears', await page.$('[role="alertdialog"]') !== null);
    await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    ok('escape closes it', await page.$('[role="alertdialog"]') === null);
  }

  console.log('\nRefill:');
  await page.evaluate(() => { state.tab = 'supply'; render(); });
  await page.click('[data-act^="refill:"]');
  await page.click('[data-act="refillset:60"]');
  ok('preview before committing', (await page.$eval('.tint-success', e => e.textContent)).includes('New total'));
  await page.click('[data-act="confirmrefill"]');
  await page.waitForTimeout(200);
  ok('refill applied', await page.$eval('.toast-msg', e => e.textContent.includes('restocked')));

  console.log('\nDelete all:');
  await page.evaluate(() => { state.tab = 'settings'; render(); });
  await page.click('[data-act="deleteall"]');
  await page.click('[data-act="dodeleteall"]');
  await page.waitForTimeout(200);
  ok('data cleared', await page.evaluate(() => state.meds.length === 0));
  ok('empty state shown', await page.$('.empty-title') !== null);

  console.log('\nKeyboard:');
  await page.evaluate(() => { state.meds = [{id:9,name:'T',dose:'1',instruction:'',times:['08:00'],pills:10,threshold:5,remindersOn:true,lead:0}]; state.tab='today'; render(); });
  await page.keyboard.press('Tab');
  ok('tab reaches a control', await page.evaluate(() => document.activeElement.tagName === 'BUTTON'));

  ok('no runtime errors', errs.length === 0);
  if (errs.length) console.log(errs);
  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
