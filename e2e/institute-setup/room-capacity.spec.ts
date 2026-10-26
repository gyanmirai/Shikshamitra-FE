import { test, expect } from '@playwright/test';

import { createRoomFixture } from '../fixtures/room-capacity/mock-state';

['light', 'dark'].forEach((theme) => {
  test(`${theme}: edit the full floor limit and preserve the room draft`, async ({ page }) => {
    const fixture = createRoomFixture();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route('**/api/**', async (route) => {
      const request = route.request();
      const result = fixture.respond(
        request.method(),
        new URL(request.url()).pathname,
        request.postDataJSON() ?? {}
      );
      await route.fulfill(result);
    });
    await page.goto(`/?theme=${theme}`);
    await page.getByRole('button', { name: 'Add room', exact: true }).click();
    const room = page.getByRole('dialog', { name: 'Add Room', exact: true });
    await room.getByLabel('Room name/no.').fill('Test Room 102');
    await room.getByRole('combobox', { name: 'Building' }).click();
    await page.getByRole('option', { name: 'Test Building', exact: true }).click();
    await room.getByRole('combobox', { name: 'Floor' }).click();
    await page.getByRole('option', { name: 'Test Floor', exact: true }).click();
    await expect(room.getByText('Room Limit Reached', { exact: true })).toBeVisible();
    await expect(room.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled();
    await page.screenshot({
      path: test.info().outputPath(`capacity-full-${theme}.png`),
      fullPage: true,
    });
    expect(fixture.writes).toEqual([]);
    await room.getByRole('combobox', { name: 'Room type' }).click();
    await page.getByRole('option', { name: 'Classroom', exact: true }).click();
    await room.getByRole('spinbutton', { name: 'Columns' }).fill('2');
    await room.getByLabel('Students per bench').fill('2');
    await room.getByRole('spinbutton', { name: 'Column 1 rows' }).fill('3');
    await room.getByRole('spinbutton', { name: 'Column 2 rows' }).fill('4');
    await room.getByRole('checkbox', { name: 'Projector', exact: true }).check();
    await room.getByRole('button', { name: 'Edit building', exact: true }).click();
    const building = page.getByRole('dialog', { name: 'Edit Building', exact: true });
    await expect(building.getByLabel('Total rooms')).toHaveValue('1');
    await building.getByLabel('Total rooms').fill('2');
    await building.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(building).toHaveCount(0);
    await expect(room.getByText('Room Limit Reached', { exact: true })).toHaveCount(0);
    await expect(room.getByLabel('Room name/no.')).toBeFocused();
    await expect(room.getByLabel('Room name/no.')).toHaveValue('Test Room 102');
    await expect(room.getByRole('combobox', { name: 'Building' })).toContainText('Test Building');
    await expect(room.getByRole('combobox', { name: 'Floor' })).toContainText('Test Floor');
    await expect(room.getByRole('combobox', { name: 'Room type' })).toContainText('Classroom');
    await expect(room.getByRole('spinbutton', { name: 'Column 1 rows' })).toHaveValue('3');
    await expect(room.getByRole('spinbutton', { name: 'Column 2 rows' })).toHaveValue('4');
    await expect(room.getByRole('checkbox', { name: 'Projector', exact: true })).toBeChecked();
    await expect(room.getByRole('button', { name: 'Submit', exact: true })).toBeEnabled();
    expect(fixture.writes).toEqual([
      {
        method: 'PUT',
        path: '/api/institute-setup/buildings/synthetic-building',
        body: {
          buildingName: 'Test Building',
          description: 'Synthetic building for local browser validation.',
          totalFloors: 1,
          floorsToUpdate: [
            { id: 'synthetic-floor', floorNo: 1, floorName: 'Test Floor', totalRoom: 2 },
          ],
          floorsToAdd: [],
          floorIdsToDelete: [],
        },
      },
    ]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    await page.screenshot({
      path: test.info().outputPath(`capacity-recovered-${theme}.png`),
      fullPage: true,
    });
    await room.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(room).toHaveCount(0);
    expect(fixture.writes.filter((write) => write.method === 'POST')).toEqual([
      {
        method: 'POST',
        path: '/api/app/room',
        body: {
          roomName: 'Test Room 102',
          capacity: 14,
          buildingId: 'synthetic-building',
          buildingName: 'Test Building',
          floorId: 'synthetic-floor',
          floorName: 'Test Floor',
          roomTypeId: 'synthetic-type',
          roomTypeName: 'Classroom',
          totalBenches: 7,
          benchCapacity: 2,
          columnRows: [3, 4],
          benchesPerRow: 4,
          benchesPerColumn: 2,
          features: ['Projector'],
          removeImage: false,
        },
      },
    ]);
    expect(errors).toEqual([]);
  });
});
