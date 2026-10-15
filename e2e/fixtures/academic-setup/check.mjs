import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const origin = 'http://127.0.0.1:4322';
const output = new URL('../../../.artifacts/academic-setup/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
const results = [];
const room = {
  id: '11111111-1111-1111-1111-111111111111',
  roomName: 'B102',
  buildingName: 'Main',
  floorName: 'First',
};
page.on('pageerror', (error) => errors.push(error.message));
const check = async (name, action) => {
  await action();
  results.push({ name, status: 'passed' });
  console.log(`PASS ${name}`);
};
const submit = async () => {
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
};
try {
  // Room options are synthetic; division saves still use the disposable real ABP backend.
  await page.route('**/api/app/room**', (route) =>
    route.fulfill({
      json: route.request().url().includes(`/room/${room.id}`)
        ? room
        : { items: [room], totalCount: 1 },
    })
  );
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: 'Edit Class 3', exact: true })).toBeVisible();
  const { stageId } = await (await page.request.get(`${origin}/fixture/context`)).json();
  const standardBody = (name) => ({ name, ageLowerLimit: 6, educationMediumStageId: stageId });
  await check(
    'existing duplicates are blocked inline before confirmation or API submission',
    async () => {
      let posts = 0;
      const track = (request) => {
        if (request.method() === 'POST' && request.url().endsWith('/api/app/standard')) posts += 1;
      };
      page.on('request', track);
      await page.getByRole('button', { name: 'Add Standard', exact: true }).click();
      await page.getByRole('textbox', { name: 'Class Name' }).fill(' class 3 ');
      await page.getByRole('spinbutton', { name: 'Limit Of Age' }).fill('6');
      await page.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(
        page.getByText(/A standard named 'Class 3' already exists in this academic stage./i)
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Confirm', exact: true })).toHaveCount(0);
      expect(posts).toBe(0);
      page.off('request', track);
      await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    }
  );
  await check(
    'a duplicate added after opening the form produces a specific toast and editable field error',
    async () => {
      await page.getByRole('button', { name: 'Add Standard', exact: true }).click();
      await page.getByRole('textbox', { name: 'Class Name' }).fill('Class 5');
      await page.getByRole('spinbutton', { name: 'Limit Of Age' }).fill('6');
      const external = await page.request.post(`${origin}/api/app/standard`, {
        data: standardBody('Class 5'),
      });
      expect(external.ok()).toBe(true);
      const response = page.waitForResponse(
        (item) => item.url().endsWith('/api/app/standard') && item.request().method() === 'POST'
      );
      await submit();
      expect((await response).status()).toBe(409);
      await expect(
        page
          .locator('[data-sonner-toast]')
          .filter({ hasText: "A standard named 'Class 5' already exists" })
      ).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Class Name' })).toHaveValue('Class 5');
      await page.getByRole('textbox', { name: 'Class Name' }).fill('Class 6');
      await submit();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Edit Class 6', exact: true })).toBeVisible();
    }
  );
  await check('an unchanged standard can be edited without colliding with itself', async () => {
    await page.getByRole('button', { name: 'Edit Class 3', exact: true }).click();
    await page.getByRole('spinbutton', { name: 'Limit Of Age' }).fill('7');
    await submit();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
  await check(
    'onboarding also validates duplicates without introducing shift or room inputs',
    async () => {
      await page.getByRole('button', { name: 'Onboarding Standard', exact: true }).click();
      await expect(page.getByRole('combobox')).toHaveCount(0);
      await page.getByRole('textbox', { name: 'Class Name' }).fill('Class 3');
      await page.getByRole('spinbutton', { name: 'Limit Of Age' }).fill('6');
      await page.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(
        page.getByText(/A standard named 'Class 3' already exists in this academic stage./)
      ).toBeVisible();
      await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    }
  );
  await check('initial setup division creation has no room field or room payload', async () => {
    await page.getByRole('button', { name: 'Onboarding Division', exact: true }).click();
    await expect(page.getByRole('combobox')).toHaveCount(0);
    await expect(page.getByText('Room (optional)', { exact: true })).toHaveCount(0);
    await page.getByRole('textbox', { name: 'Division Name' }).fill('A');
    await page.getByRole('spinbutton', { name: 'Strength' }).fill('50');
    const request = page.waitForRequest(
      (item) => item.method() === 'POST' && item.url().endsWith('/api/app/division')
    );
    await submit();
    expect((await request).postDataJSON()).not.toHaveProperty('roomNumber');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(
      page.getByText('A: 50 seats; saved room: unassigned', { exact: true })
    ).toBeVisible();
  });
  await check(
    'division duplicates are blocked inline in onboarding and management without an API call',
    async () => {
      let posts = 0;
      const track = (request) => {
        if (request.method() === 'POST' && request.url().endsWith('/api/app/division')) posts += 1;
      };
      page.on('request', track);
      for (const button of ['Onboarding Division', 'Add Division']) {
        await page.getByRole('button', { name: button, exact: true }).click();
        await page.getByRole('textbox', { name: 'Division Name' }).fill(' a ');
        await page.getByRole('spinbutton', { name: 'Strength' }).fill('50');
        await page.getByRole('button', { name: 'Submit', exact: true }).click();
        await expect(
          page.getByText(/A division named 'A' already exists in this standard./i)
        ).toBeVisible();
        await expect(page.getByRole('button', { name: 'Confirm', exact: true })).toHaveCount(0);
        await page.screenshot({
          path: fileURLToPath(
            new URL(`division-duplicate-${button.replaceAll(' ', '-')}.png`, output)
          ),
        });
        await page.getByRole('button', { name: 'Cancel', exact: true }).click();
      }
      expect(posts).toBe(0);
      page.off('request', track);
    }
  );
  await check(
    'stale division names return 409 with an editable draft and corrected retry succeeds',
    async () => {
      const { items } = await (await page.request.get(`${origin}/api/app/division`)).json();
      const standardId = items.find((item) => item.name === 'A').standardId;
      await page.getByRole('button', { name: 'Onboarding Division', exact: true }).click();
      await page.getByRole('textbox', { name: 'Division Name' }).fill('Race');
      await page.getByRole('spinbutton', { name: 'Strength' }).fill('50');
      const external = await page.request.post(`${origin}/api/app/division`, {
        data: { name: 'Race', strength: 50, standardId },
      });
      expect(external.ok()).toBe(true);
      const response = page.waitForResponse(
        (item) => item.url().endsWith('/api/app/division') && item.request().method() === 'POST'
      );
      await submit();
      expect((await response).status()).toBe(409);
      await expect(page.getByRole('button', { name: 'Confirm', exact: true })).toHaveCount(0);
      await expect(page.getByRole('textbox', { name: 'Division Name' })).toHaveValue('Race');
      await expect(page.getByRole('textbox', { name: 'Division Name' })).toBeFocused();
      await expect(page.getByRole('spinbutton', { name: 'Strength' })).toHaveValue('50');
      await expect(
        page
          .locator('[data-sonner-toast]')
          .filter({ hasText: "A division named 'Race' already exists" })
      ).toBeVisible();
      await expect(
        page
          .locator('.MuiFormHelperText-root')
          .filter({ hasText: "A division named 'Race' already exists" })
      ).toBeVisible();
      await page.getByRole('textbox', { name: 'Division Name' }).fill('Corrected');
      await submit();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await page.reload();
      await expect(
        page.getByText('Corrected: 50 seats; saved room: unassigned', { exact: true })
      ).toBeVisible();
    }
  );
  await check(
    'division edits persist strength and preserve room allocations after reload',
    async () => {
      const { items } = await (await page.request.get(`${origin}/api/app/division`)).json();
      const division = items.find((item) => item.name === 'A');
      expect(
        (
          await page.request.put(`${origin}/api/app/division/${division.id}`, {
            data: { name: 'A', strength: 50, standardId: division.standardId, roomNumber: 'B101' },
          })
        ).ok()
      ).toBe(true);
      await page.reload();
      await page.getByRole('button', { name: 'Edit Division A', exact: true }).click();
      await expect(page.getByRole('combobox', { name: 'Room (optional)' })).toHaveValue('B101');
      await page.getByRole('spinbutton', { name: 'Strength' }).fill('45');
      const request = page.waitForRequest(
        (item) => item.method() === 'PUT' && item.url().includes('/api/app/division/')
      );
      await submit();
      expect((await request).postDataJSON()).toHaveProperty('roomNumber', 'B101');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await page.reload();
      await expect(page.getByText('A: 45 seats; saved room: B101', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Edit Division A', exact: true }).click();
      await expect(page.getByRole('spinbutton', { name: 'Strength' })).toHaveValue('45');
      await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    }
  );
  await check(
    'management assigns and clears rooms; initial setup edits preserve assignments',
    async () => {
      await page.getByRole('button', { name: 'Edit Division A', exact: true }).click();
      await page.getByRole('combobox', { name: 'Room (optional)' }).fill('B102');
      await page.getByRole('option', { name: 'Main > First > B102' }).click();
      let request = page.waitForRequest(
        (item) => item.method() === 'PUT' && item.url().includes('/api/app/division/')
      );
      await submit();
      expect((await request).postDataJSON()).toHaveProperty('roomNumber', room.id);
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await page.getByRole('button', { name: 'Onboarding Edit Division A', exact: true }).click();
      await expect(page.getByRole('combobox')).toHaveCount(0);
      await page.getByRole('spinbutton', { name: 'Strength' }).fill('44');
      request = page.waitForRequest(
        (item) => item.method() === 'PUT' && item.url().includes('/api/app/division/')
      );
      await submit();
      expect((await request).postDataJSON()).not.toHaveProperty('roomNumber');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await page.getByRole('button', { name: 'Edit Division A', exact: true }).click();
      await expect(page.getByRole('combobox', { name: 'Room (optional)' })).toHaveValue(
        'Main > First > B102'
      );
      await page.getByRole('combobox', { name: 'Room (optional)' }).hover();
      await page.getByRole('button', { name: 'Clear', exact: true }).click();
      request = page.waitForRequest(
        (item) => item.method() === 'PUT' && item.url().includes('/api/app/division/')
      );
      await submit();
      expect((await request).postDataJSON()).toHaveProperty('roomNumber', '');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await page.reload();
      await expect(
        page.getByText('A: 44 seats; saved room: unassigned', { exact: true })
      ).toBeVisible();
    }
  );
  await check('management creates a division with an optional room', async () => {
    await page.getByRole('button', { name: 'Add Division', exact: true }).click();
    await page.getByRole('textbox', { name: 'Division Name' }).fill('B');
    await page.getByRole('spinbutton', { name: 'Strength' }).fill('40');
    await page.getByRole('combobox', { name: 'Room (optional)' }).fill('B102');
    await page.getByRole('option', { name: 'Main > First > B102' }).click();
    const request = page.waitForRequest(
      (item) => item.method() === 'POST' && item.url().endsWith('/api/app/division')
    );
    await submit();
    expect((await request).postDataJSON()).toHaveProperty('roomNumber', room.id);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
  await check('dialogs fit narrow, tablet and desktop viewports in both themes', async () => {
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      for (const theme of ['light', 'dark']) {
        await page.getByRole('button', { name: 'Onboarding Division', exact: true }).click();
        await page.getByRole('textbox', { name: 'Division Name' }).fill('A');
        await page.getByRole('spinbutton', { name: 'Strength' }).fill('50');
        await page.getByRole('button', { name: 'Submit', exact: true }).click();
        await expect(
          page.getByText("A division named 'A' already exists in this standard.", { exact: true })
        ).toBeVisible();
        const bounds = await page.getByRole('dialog').boundingBox();
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
        await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeInViewport();
        await page.screenshot({
          path: fileURLToPath(new URL(`division-${width}-${theme}.png`, output)),
        });
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await page.getByRole('button', { name: 'Toggle Theme', exact: true }).click();
      }
    }
  });
  expect(errors).toEqual([]);
  await writeFile(new URL('results.json', output), JSON.stringify({ results, errors }, null, 2));
} finally {
  await browser.close();
}
