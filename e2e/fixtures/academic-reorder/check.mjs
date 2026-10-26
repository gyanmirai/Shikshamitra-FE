import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect as playwrightExpect } from '@playwright/test';

const expect = playwrightExpect.configure({ timeout: 15000 });

const origin = process.argv[2] || 'http://127.0.0.1:4325';
const output = '.artifacts/class-division-reorder';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(45000);
page.setDefaultNavigationTimeout(90000);
const results = [];
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const check = async (name, action) => {
  await action();
  results.push({ name, status: 'passed' });
  console.log(`PASS ${name}`);
};
async function json(path) {
  const response = await page.request.get(`${origin}${path}`);
  assert.equal(response.ok(), true, `${path}: ${response.status()}`);
  return response.json();
}
async function post(path, data) {
  const response = await page.request.post(`${origin}${path}`, { data });
  assert.equal(response.ok(), true, `${path}: ${response.status()} ${await response.text()}`);
  return response.json();
}
async function selectMedium() {
  await page.getByRole('button', { name: 'Open Board CBSE', exact: true }).click();
  await page.getByRole('button', { name: 'Open Medium English', exact: true }).click();
}
async function selectStage() {
  await selectMedium();
  await page.getByRole('button', { name: 'Open Stage Primary', exact: true }).click();
}
async function openMedium() {
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await selectMedium();
}
async function openStage() {
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await selectStage();
}
const details = (label) => page.getByRole('region', { name: `${label} details`, exact: true });
const cards = (label, child) =>
  details(label).getByRole('button', { name: new RegExp(`^Open ${child} `) });
const cardNames = async (label, child) =>
  cards(label, child).evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('aria-label').replace(/^Open \S+ /, ''))
  );
const orderNames = () =>
  page
    .getByRole('list', { name: 'Display order' })
    .getByRole('button', { name: /^Drag / })
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('aria-label').slice(5))
    );
const save = async () => {
  await page.getByRole('button', { name: 'Save order', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
};
try {
  const { stageId } = await json('/fixture/context');
  const boards = (await json('/api/app/education-board')).items;
  const medium = boards
    .flatMap((board) => board.educationMediums)
    .find((item) => item.educationMediumStages.some((stage) => stage.id === stageId));
  assert.ok(medium);
  const extraStages = [];
  for (const name of ['Middle', 'Secondary']) {
    extraStages.push(
      medium.educationMediumStages.find((stage) => stage.name === name) ??
        (await post('/api/app/education-medium-stage', { name, educationMediumId: medium.id }))
    );
  }
  const existingClasses = (await json('/api/app/standard?MaxResultCount=1000')).items;
  for (const stage of extraStages) {
    if (
      !existingClasses.some(
        (item) => item.educationMediumStageId === stage.id && item.name === `${stage.name} Grade`
      )
    )
      await post('/api/app/standard', {
        name: `${stage.name} Grade`,
        ageLowerLimit: 10,
        educationMediumStageId: stage.id,
      });
  }
  await openMedium();
  await check('stages start in creation order and save their chosen sibling order', async () => {
    assert.deepEqual(await cardNames('Medium', 'Stage'), ['Primary', 'Middle', 'Secondary']);
    await page.getByRole('button', { name: 'Reorder stages', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Reorder Stages' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save order', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Move Secondary up', exact: true }).click();
    await page.getByRole('button', { name: 'Move Secondary up', exact: true }).click();
    assert.deepEqual(await orderNames(), ['Secondary', 'Primary', 'Middle']);
    await page.screenshot({ path: `${output}/stages-dialog-desktop.png` });
    await save();
    await expect
      .poll(() => cardNames('Medium', 'Stage'))
      .toEqual(['Secondary', 'Primary', 'Middle']);
  });
  await check('stage order survives reload and agrees with the default stage API', async () => {
    await openMedium();
    assert.deepEqual(await cardNames('Medium', 'Stage'), ['Secondary', 'Primary', 'Middle']);
    const saved = (await json('/api/app/education-medium-stage')).items.filter(
      (item) => item.educationMediumId === medium.id
    );
    assert.deepEqual(
      saved.map((item) => item.name),
      ['Secondary', 'Primary', 'Middle']
    );
    assert.deepEqual(
      saved.map((item) => item.sortOrder),
      [0, 1, 2]
    );
    const classes = await json(`/api/education-medium/${medium.id}/standards`);
    assert.deepEqual(
      classes.map((item) => item.name),
      ['Secondary Grade', 'Class 1', 'Class 3', 'Middle Grade']
    );
  });
  await check('cancelling stage changes preserves the saved sequence', async () => {
    await page.getByRole('button', { name: 'Reorder stages', exact: true }).click();
    await page.getByRole('button', { name: 'Move Middle up', exact: true }).click();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('button', { name: 'Keep editing', exact: true }).click();
    assert.deepEqual(await orderNames(), ['Secondary', 'Middle', 'Primary']);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
    assert.deepEqual(await cardNames('Medium', 'Stage'), ['Secondary', 'Primary', 'Middle']);
  });
  await check('new stages append after the saved order', async () => {
    await post('/api/app/education-medium-stage', { name: 'Senior', educationMediumId: medium.id });
    await openMedium();
    assert.deepEqual(await cardNames('Medium', 'Stage'), [
      'Secondary',
      'Primary',
      'Middle',
      'Senior',
    ]);
  });
  const standards = (await json('/api/app/standard')).items.filter(
    (item) => item.educationMediumStageId === stageId
  );
  let classTwo = standards.find((item) => item.name === 'Class 2');
  if (!classTwo)
    classTwo = await post('/api/app/standard', {
      name: 'Class 2',
      ageLowerLimit: 6,
      educationMediumStageId: stageId,
    });
  const classOne = standards.find((item) => item.name === 'Class 1');
  assert.ok(classOne);
  const divisions = (await json('/api/app/division')).items.filter(
    (item) => item.standardId === classOne.id
  );
  for (const name of ['C', 'A', 'B']) {
    if (!divisions.some((item) => item.name === name))
      await post('/api/app/division', { name, strength: 40, standardId: classOne.id });
  }
  await openStage();
  await check('classes start in creation order, then save an explicit order', async () => {
    assert.deepEqual(await cardNames('Stage', 'Standard'), ['Class 1', 'Class 3', 'Class 2']);
    await page.getByRole('button', { name: 'Reorder classes', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Reorder Classes' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save order', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Move Class 1 up', exact: true })).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Move Class 2 down', exact: true })
    ).toBeDisabled();
    const move = page.getByRole('button', { name: 'Move Class 2 up', exact: true });
    await move.focus();
    await move.press('Enter');
    await move.press('Enter');
    assert.deepEqual(await orderNames(), ['Class 2', 'Class 1', 'Class 3']);
    await page.screenshot({ path: `${output}/classes-dialog-desktop.png` });
    await save();
    await expect
      .poll(() => cardNames('Stage', 'Standard'))
      .toEqual(['Class 2', 'Class 1', 'Class 3']);
  });
  await check('class order persists after reload and the default class API agrees', async () => {
    await openStage();
    assert.deepEqual(await cardNames('Stage', 'Standard'), ['Class 2', 'Class 1', 'Class 3']);
    const saved = (await json('/api/app/standard')).items.filter(
      (item) => item.educationMediumStageId === stageId
    );
    assert.deepEqual(
      saved.map((item) => item.name),
      ['Class 2', 'Class 1', 'Class 3']
    );
    assert.deepEqual(
      saved.map((item) => item.sortOrder),
      [0, 1, 2]
    );
  });
  await check('dirty Cancel supports keep editing and discard without writing', async () => {
    await page.getByRole('button', { name: 'Reorder classes', exact: true }).click();
    await page.getByRole('button', { name: 'Move Class 3 up', exact: true }).click();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('button', { name: 'Keep editing', exact: true }).click();
    assert.deepEqual(await orderNames(), ['Class 2', 'Class 3', 'Class 1']);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    assert.deepEqual(await cardNames('Stage', 'Standard'), ['Class 2', 'Class 1', 'Class 3']);
  });
  await check('new classes append after the saved class order', async () => {
    await post('/api/app/standard', {
      name: 'Class 10',
      ageLowerLimit: 6,
      educationMediumStageId: stageId,
    });
    await openStage();
    assert.deepEqual(await cardNames('Stage', 'Standard'), [
      'Class 2',
      'Class 1',
      'Class 3',
      'Class 10',
    ]);
  });
  await check(
    'a sibling added elsewhere rejects a stale save and reopening loads the new list',
    async () => {
      await page.getByRole('button', { name: 'Reorder classes', exact: true }).click();
      await page.getByRole('button', { name: 'Move Class 3 up', exact: true }).click();
      await post('/api/app/standard', {
        name: 'Class 4',
        ageLowerLimit: 6,
        educationMediumStageId: stageId,
      });
      await page.getByRole('button', { name: 'Save order', exact: true }).click();
      await expect(
        page.getByRole('alert').filter({ hasText: 'Could not save the order' })
      ).toBeVisible();
      await expect(page.getByRole('alert').filter({ hasText: 'This list changed' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Save order', exact: true })).toBeDisabled();
      await page.getByRole('button', { name: 'Cancel', exact: true }).click();
      await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
      await page.getByRole('button', { name: 'Reorder classes', exact: true }).click();
      assert.deepEqual(await orderNames(), [
        'Class 2',
        'Class 1',
        'Class 3',
        'Class 10',
        'Class 4',
      ]);
      await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    }
  );
  await page.getByRole('button', { name: 'Open Standard Class 1', exact: true }).click();
  await check('divisions save independently of class order and persist after reload', async () => {
    assert.deepEqual(await cardNames('Standard', 'Division'), ['C', 'A', 'B']);
    await page.getByRole('button', { name: 'Reorder divisions', exact: true }).click();
    await page.getByRole('button', { name: 'Move B up', exact: true }).click();
    await page.getByRole('button', { name: 'Move B up', exact: true }).click();
    await save();
    await expect.poll(() => cardNames('Standard', 'Division')).toEqual(['B', 'C', 'A']);
    await openStage();
    await page.getByRole('button', { name: 'Open Standard Class 1', exact: true }).click();
    assert.deepEqual(await cardNames('Standard', 'Division'), ['B', 'C', 'A']);
    const saved = (await json('/api/app/division')).items.filter(
      (item) => item.standardId === classOne.id
    );
    assert.deepEqual(
      saved.map((item) => item.name),
      ['B', 'C', 'A']
    );
  });
  await check('a failed save keeps the draft and permits a successful retry', async () => {
    await page.getByRole('button', { name: 'Reorder divisions', exact: true }).click();
    await page.getByRole('button', { name: 'Move A up', exact: true }).click();
    await page.route(
      '**/api/standards/*/divisions/order',
      (route) => route.fulfill({ status: 503, json: { title: 'Synthetic retry check' } }),
      { times: 1 }
    );
    await page.getByRole('button', { name: 'Save order', exact: true }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'Could not save the order' })
    ).toBeVisible();
    assert.deepEqual(await orderNames(), ['B', 'A', 'C']);
    await save();
    await expect.poll(() => cardNames('Standard', 'Division')).toEqual(['B', 'A', 'C']);
  });
  await check('keyboard drag changes a draft and Escape asks before discarding', async () => {
    const saved = (await json('/api/app/division')).items.filter(
      (item) => item.standardId === classOne.id
    );
    const sourceId = saved.find((item) => item.name === 'B').id;
    const targetId = saved.find((item) => item.name === 'A').id;
    await page.getByRole('button', { name: 'Reorder divisions', exact: true }).click();
    const handle = page.getByRole('button', { name: 'Drag B', exact: true });
    await handle.focus();
    await handle.press('Space');
    await expect(handle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('status')).toContainText(`droppable area ${sourceId}`);
    await handle.press('ArrowDown');
    await expect(page.getByRole('status')).toContainText(`droppable area ${targetId}`);
    await handle.press('Space');
    await expect.poll(orderNames).toEqual(['A', 'B', 'C']);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
  await check('phone dark dialog fits and keeps 44 pixel move targets', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Toggle theme', exact: true }).click();
    await selectMedium();
    await page.getByRole('button', { name: 'Reorder stages', exact: true }).click();
    const stageDialog = await page.getByRole('dialog', { name: 'Reorder Stages' }).boundingBox();
    assert.ok(stageDialog && stageDialog.x >= 0 && stageDialog.x + stageDialog.width <= 390);
    await page.screenshot({ path: `${output}/stages-dialog-phone-dark.png` });
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('button', { name: 'Open Stage Primary', exact: true }).click();
    await page.getByRole('button', { name: 'Open Standard Class 1', exact: true }).click();
    await page.getByRole('button', { name: 'Reorder divisions', exact: true }).click();
    const dialog = await page.getByRole('dialog', { name: 'Reorder Divisions' }).boundingBox();
    assert.ok(dialog && dialog.x >= 0 && dialog.x + dialog.width <= 390);
    const move = await page.getByRole('button', { name: 'Move A up', exact: true }).boundingBox();
    assert.ok(move && move.width >= 44 && move.height >= 44);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      true
    );
    await page.screenshot({ path: `${output}/divisions-dialog-phone-dark.png` });
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  });
  await check('view-only frontend access hides all three reorder controls', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${origin}/?access=view`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Open Board CBSE', exact: true }).click();
    await page.getByRole('button', { name: 'Open Medium English', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Reorder stages', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Open Stage Primary', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Reorder classes', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Open Standard Class 1', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Reorder divisions', exact: true })).toHaveCount(
      0
    );
  });
  assert.deepEqual(errors, []);
  await writeFile(`${output}/browser-results.json`, JSON.stringify({ results, errors }, null, 2));
} catch (error) {
  await page.screenshot({ path: `${output}/failure.png` });
  await writeFile(
    `${output}/browser-results.json`,
    JSON.stringify({ results, errors, failure: String(error) }, null, 2)
  );
  throw error;
} finally {
  await browser.close();
}
