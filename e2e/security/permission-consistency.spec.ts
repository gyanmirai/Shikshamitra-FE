import { randomUUID } from 'node:crypto';
import { test, expect, type Page, type Locator } from '@playwright/test';

const apiURL = process.env.SECURITY_API_URL!;

async function activate(target: Locator) {
  if (test.info().project.use.hasTouch) await target.tap();
  else await target.click();
}

async function login(page: Page) {
  if (!process.env.SECURITY_ADMIN_PASSWORD)
    throw new Error('Set the local synthetic admin password.');
  await page.addInitScript(() => localStorage.setItem('onboarding_completed', 'true'));
  await page.goto('/login');
  await page.getByLabel('School Code').fill('DDVS');
  await page.getByLabel('Email / Username').fill('admin-ddvs');
  await page.getByLabel('Password', { exact: true }).fill(process.env.SECURITY_ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 60_000 });
  if (await page.getByRole('button', { name: 'Skip', exact: true }).isVisible()) {
    await page.getByRole('button', { name: 'Skip', exact: true }).click();
  }
  // Session is only used in memory for local fixture setup. Never write tokens or auth state to reports.
  const session = await (await page.request.get('/api/auth/session')).json();
  expect(session.accessToken).toBeTruthy();
  return { Authorization: `Bearer ${session.accessToken}`, __tenant: 'DDVS' };
}

async function openActions(page: Page, kind: 'role' | 'user', name: string) {
  await page.goto(`/security/${kind}`);
  await page.getByRole('textbox', { name: 'Search table' }).fill(name);
  await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(1);
  await activate(
    page.getByRole('table').locator('tbody tr').getByRole('button', { name: 'More actions' })
  );
}

async function openPayrollPermissions(page: Page, kind: 'role' | 'user', name: string) {
  await openActions(page, kind, name);
  await page.getByRole('menuitem', { name: 'Module Permission', exact: true }).click();
  await page.getByRole('button', { name: 'HR/Staff', exact: true }).click();
  await page.getByRole('button', { name: 'Payroll Management', exact: true }).click();
  await expect(
    page.getByRole('switch', { name: 'Statutory Schemes: Activate', exact: true })
  ).toBeVisible();
}

const esiPrefix = 'HR.PayrollManagement.Settings.StatutorySchemes.';
const esiNames = ['View', 'Edit', 'Activate', 'ManageEnrollment', 'ApproveOverride'].map(
  (action) => esiPrefix + action
);
type Grant = {
  name: string;
  isGranted: boolean;
  grantedProviders: { providerName: string; providerKey: string }[];
};
async function readGrants(
  page: Page,
  headers: Record<string, string>,
  providerName: string,
  providerKey: string
): Promise<Grant[]> {
  const response = await page.request.get(
    `${apiURL}/api/permission-management/permissions?${new URLSearchParams({ providerName, providerKey })}`,
    { headers }
  );
  expect(response.ok()).toBeTruthy();
  return (await response.json()).groups.flatMap(
    (group: { permissions: Grant[] }) => group.permissions
  );
}
async function savePermissions(page: Page) {
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}

async function verifyBounds(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  await Promise.all(
    ['Submit', 'Cancel'].map(async (label) => {
      const box = await page.getByRole('button', { name: label, exact: true }).boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
    })
  );
}

async function verifyOriginalDialogs(page: Page, kind: 'role' | 'user', name: string) {
  await openActions(page, kind, name);
  await page.getByRole('menuitem', { name: 'Module Permission', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Permissions of');
  await expect(page.getByText('Select a module to manage', { exact: true })).toBeVisible();
  await expect(page.getByText('Select a Sub-module', { exact: true })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Permission group' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await openActions(page, kind, name);
  await page.getByRole('menuitem', { name: 'Set Module Visibility', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Set Module Visibility');
  await expect(
    page.getByText('Choose a module from the sidebar to manage its visibility settings.', {
      exact: true,
    })
  ).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Permission group' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}

[
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
].forEach((viewport) => {
  test(`retained-layout grant/revoke and inherited-user round trips at ${viewport.width}px`, async ({
    page,
  }) => {
    test.setTimeout(240_000);
    await page.setViewportSize(viewport);
    const headers = await login(page);
    const suffix = randomUUID().slice(0, 8);
    const roleName = `security-ui-${suffix}`;
    const createdRole = await page.request.post(`${apiURL}/api/identity/roles`, {
      headers,
      data: {
        name: roleName,
        isDefault: false,
        isPublic: false,
        employeeOnboardingAssignable: false,
        employeeGroupAudience: 'Both',
        extraProperties: {
          color: '#456789',
          roleAudience: 'Employee',
          employeeGroupAudience: 'Both',
          employeeOnboardingAssignable: false,
        },
      },
    });
    expect(createdRole.ok()).toBeTruthy();
    const initial = await page.request.put(
      `${apiURL}/api/permission-management/permissions?${new URLSearchParams({ providerName: 'R', providerKey: roleName })}`,
      {
        headers,
        data: {
          permissions: [
            { name: `${esiPrefix}Edit`, isGranted: true },
            { name: 'Finance.Settings.FeeStructure.View', isGranted: true },
          ],
        },
      }
    );
    expect(initial.ok()).toBeTruthy();
    // Use the fresh FullDemo synthetic account with verified role membership.
    // The existing identity-create roleNames path is not a reliable membership fixture.
    const fixtureUsers = await page.request.get(`${apiURL}/api/identity/users?filter=hr-manager`, {
      headers,
    });
    expect(fixtureUsers.ok()).toBeTruthy();
    const fixtureUser = (await fixtureUsers.json()).items.find(
      (item: { userName: string }) => item.userName === 'hr-manager'
    );
    expect(fixtureUser).toBeTruthy();
    const userId = fixtureUser.id;
    const userDisplayName = `${fixtureUser.name} ${fixtureUser.surname || ''}`.trim();
    const inheritedRole = 'HR Manager';
    const beforeUserGrants = await readGrants(page, headers, 'U', userId);
    expect(
      beforeUserGrants.filter(
        (grant) =>
          grant.name.startsWith('HR.PayrollManagement.') &&
          grant.grantedProviders.some(
            (provider) => provider.providerName === 'U' && provider.providerKey === userId
          )
      )
    ).toEqual([]);
    esiNames.forEach((name) => {
      expect(
        beforeUserGrants.find((grant) => grant.name === name)!.grantedProviders
      ).toContainEqual({ providerName: 'R', providerKey: inheritedRole });
    });
    const writes: { name: string; isGranted: boolean }[][] = [];
    page.on('request', (request) => {
      if (
        request.method() === 'PUT' &&
        new URL(request.url()).pathname === '/api/permission-management/permissions'
      ) {
        writes.push(request.postDataJSON().permissions);
      }
    });
    await openPayrollPermissions(page, 'role', roleName);
    await expect(page.getByText(/Navigation is hidden/)).toBeVisible();
    await verifyBounds(page);
    const activateSwitch = page.getByRole('switch', {
      name: 'Statutory Schemes: Activate',
      exact: true,
    });
    await activateSwitch.focus();
    await page.keyboard.press('Space');
    await expect(activateSwitch).toBeChecked();
    await expect(
      page.getByRole('switch', { name: 'Statutory Schemes: View', exact: true })
    ).not.toBeChecked();
    await expect(page.getByText('1 pending permission changes', { exact: true })).toBeVisible();
    page.once('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(activateSwitch).toBeChecked();
    await savePermissions(page);
    expect(writes).toEqual([[{ name: `${esiPrefix}Activate`, isGranted: true }]]);
    let grants = await readGrants(page, headers, 'R', roleName);
    expect(grants.find((grant) => grant.name === `${esiPrefix}Activate`)?.isGranted).toBe(true);
    expect(grants.find((grant) => grant.name === `${esiPrefix}View`)?.isGranted).toBe(false);
    await openPayrollPermissions(page, 'role', roleName);
    await expect(activateSwitch).toBeChecked();
    await page.getByRole('textbox', { name: 'Search permissions' }).fill('Activate');
    await expect(
      page.getByRole('switch', { name: 'Statutory Schemes: Edit', exact: true })
    ).toHaveCount(0);
    await page.getByRole('button', { name: /^Revoke All \(/ }).click();
    await savePermissions(page);
    grants = await readGrants(page, headers, 'R', roleName);
    expect(
      grants.filter((grant) => grant.name.startsWith('HR.PayrollManagement.') && grant.isGranted)
    ).toEqual([]);
    expect(
      grants.find((grant) => grant.name === 'Finance.Settings.FeeStructure.View')?.isGranted
    ).toBe(true);
    await openPayrollPermissions(page, 'role', roleName);
    // Five server-defined ESI actions, with no synthetic parent grant.
    await page
      .getByRole('heading', { name: 'Statutory Schemes', exact: true })
      .locator('..')
      .getByRole('button', { name: 'Grant All (5)', exact: true })
      .click();
    await savePermissions(page);
    grants = await readGrants(page, headers, 'R', roleName);
    expect(grants.filter((grant) => esiNames.includes(grant.name) && grant.isGranted)).toHaveLength(
      5
    );
    await openPayrollPermissions(page, 'user', userDisplayName);
    await verifyBounds(page);
    await expect(
      page.getByText(`Inherited from role ${inheritedRole}. Remains effective.`).first()
    ).toBeVisible();
    const enrollment = page.getByRole('switch', {
      name: 'Statutory Schemes: Manage Enrollment',
      exact: true,
    });
    await expect(enrollment).not.toBeChecked();
    await enrollment.check();
    await savePermissions(page);
    grants = await readGrants(page, headers, 'U', userId);
    expect(
      grants.find((grant) => grant.name === `${esiPrefix}ManageEnrollment`)!.grantedProviders
    ).toContainEqual({ providerName: 'U', providerKey: userId });
    await openPayrollPermissions(page, 'user', userDisplayName);
    await expect(enrollment).toBeChecked();
    await page.getByRole('textbox', { name: 'Search permissions' }).fill('Activate');
    await page.getByRole('button', { name: /^Remove direct grants \(/ }).click();
    await savePermissions(page);
    grants = await readGrants(page, headers, 'U', userId);
    const esi = grants.filter((grant) => esiNames.includes(grant.name));
    expect(esi).toHaveLength(5);
    esi.forEach((grant) => {
      expect(grant.isGranted).toBe(true);
      expect(grant.grantedProviders).toContainEqual({
        providerName: 'R',
        providerKey: inheritedRole,
      });
      expect(
        grant.grantedProviders.some(
          (provider) => provider.providerName === 'U' && provider.providerKey === userId
        )
      ).toBe(false);
    });
    expect(grants).toEqual(beforeUserGrants);
  });

  test(`original role and user dialogs remain separate at ${viewport.width}px without writes`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const headers = await login(page);
    const users = await page.request.get(`${apiURL}/api/identity/users?filter=hr-manager`, {
      headers,
    });
    expect(users.ok()).toBeTruthy();
    const user = (await users.json()).items.find(
      (item: { userName: string }) => item.userName === 'hr-manager'
    );
    expect(user).toBeTruthy();
    const writes: string[] = [];
    page.on('request', (request) => {
      if (
        !['GET', 'HEAD', 'OPTIONS'].includes(request.method()) &&
        /\/(permission-management|shikshamitra-permissions|identity)\//.test(
          new URL(request.url()).pathname
        )
      ) {
        writes.push(`${request.method()} ${new URL(request.url()).pathname}`);
      }
    });
    // Existing synthetic records only. No creation, grants, revocations, or scope changes.
    await verifyOriginalDialogs(page, 'role', 'HR Manager');
    await verifyOriginalDialogs(page, 'user', `${user.name} ${user.surname || ''}`.trim());
    expect(writes).toEqual([]);
  });
});

test('loading, failed saves, dirty navigation, and visibility remain usable without server mutations', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const headers = await login(page);
  const original = await readGrants(page, headers, 'R', 'HR Manager');
  let failReads = true;
  let submitted = 0;
  let releaseWrite!: () => void;
  await page.route('**/api/permission-management/permissions?**', async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get('providerName') !== 'R' || url.searchParams.get('providerKey') !== 'HR Manager') {
      await route.continue();
      return;
    }
    if (route.request().method() === 'PUT') {
      submitted += 1;
      await new Promise<void>((resolveWrite) => { releaseWrite = resolveWrite; });
      await route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ error: { message: 'Synthetic permission denial' } }) });
      return;
    }
    if (failReads) {
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: { message: 'Synthetic unavailable read' } }) });
      return;
    }
    await route.continue();
  });
  await openActions(page, 'role', 'HR Manager');
  await page.getByRole('menuitem', { name: 'Module Permission', exact: true }).click();
  await expect(page.getByText(/Permissions could not be loaded/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled();
  failReads = false;
  await page.getByRole('button', { name: 'Reload', exact: true }).click();
  await page.getByRole('button', { name: 'HR/Staff', exact: true }).click();
  await page.getByRole('button', { name: 'Payroll Management', exact: true }).click();
  const activateSwitch = page.getByRole('switch', { name: 'Statutory Schemes: Activate', exact: true });
  await activateSwitch.uncheck();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.keyboard.press('Escape');
  await expect(activateSwitch).not.toBeChecked();
  const backGuard = page.waitForEvent('dialog');
  await page.evaluate(() => window.history.back());
  await (await backGuard).dismiss();
  await expect(page).toHaveURL(/\/security\/role$/);
  await expect(activateSwitch).not.toBeChecked();
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect.poll(() => submitted).toBe(1);
  await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'close', exact: true })).toBeDisabled();
  await expect(activateSwitch).toBeDisabled();
  releaseWrite();
  await expect(page.getByText(/Could not save or verify permissions/)).toBeVisible();
  await expect(activateSwitch).not.toBeChecked();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'More actions' })).toBeFocused();
  await openActions(page, 'role', 'HR Manager');
  await page.getByRole('menuitem', { name: 'Set Module Visibility', exact: true }).click();
  await page.getByRole('button', { name: 'HR/Staff', exact: true }).click();
  await verifyBounds(page);
  await expect(page.getByRole('switch', { name: 'Payroll Management visibility', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(await readGrants(page, headers, 'R', 'HR Manager')).toEqual(original);
});
