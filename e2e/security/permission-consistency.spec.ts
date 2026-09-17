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
  const row = page.getByTestId('permission-Statutory Schemes');
  if (!(await row.isVisible())) await page.getByRole('button', { name: 'Expand Settings', exact: true }).click();
  await expect(row.getByRole('switch', { name: 'View', exact: true })).toBeVisible();
}
async function openApplications(page: Page, name: string) {
  await openActions(page, 'role', name);
  await page.getByRole('menuitem', { name: 'Module Permission', exact: true }).click();
  await page.getByRole('button', { name: 'Student', exact: true }).click();
  await page.getByRole('button', { name: 'Admissions', exact: true }).click();
  await page.getByRole('button', { name: 'Expand Applications', exact: true }).click();
  await expect(page.getByTestId('permission-All Applications')).toBeVisible();
}
const esiPrefix = 'HR.PayrollManagement.Settings.StatutorySchemes.';

test('statutory scheme grouped editing and complete direct revocation', async ({ page }) => {
  const headers = await login(page);
  const roleName = `security-statutory-${randomUUID().slice(0, 8)}`;
  const created = await page.request.post(`${apiURL}/api/identity/roles`, {
    headers,
    data: {
      name: roleName, isDefault: false, isPublic: false,
      employeeOnboardingAssignable: false, employeeGroupAudience: 'Both',
      extraProperties: { color: '#456789', roleAudience: 'Employee', employeeGroupAudience: 'Both', employeeOnboardingAssignable: false },
    },
  });
  expect(created.ok()).toBeTruthy();
  const featureNames = (await readGrants(page, headers, 'R', roleName))
    .filter((grant) => grant.name.startsWith(esiPrefix)).map((grant) => grant.name);
  expect(featureNames).toHaveLength(5);
  const unrelated = 'Finance.Settings.FeeStructure.View';
  const seeded = await page.request.put(`${apiURL}/api/permission-management/permissions?${new URLSearchParams({ providerName: 'R', providerKey: roleName })}`, {
    headers, data: { permissions: [unrelated, `${esiPrefix}Activate`].map((name) => ({ name, isGranted: true })) },
  });
  expect(seeded.ok()).toBeTruthy();
  await openPayrollPermissions(page, 'role', roleName);
  await verifyBounds(page);
  await Promise.all(['View', 'Add', 'Edit', 'Delete'].map(async (action) => {
    const bounds = await page.getByRole('switch', { name: `All ${action}`, exact: true }).boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  }));
  const row = page.getByTestId('permission-Statutory Schemes');
  await expect(row.getByRole('switch')).toHaveCount(3);
  await expect(row.getByRole('switch', { name: 'Edit', exact: true })).not.toBeChecked();
  await expect(row.getByRole('switch', { name: 'Delete', exact: true })).toBeDisabled();
  await expect(row.getByRole('switch', { name: 'View', exact: true })).not.toBeChecked();
  // A partially granted group must be revocable without first granting additional rights.
  await row.getByRole('button', { name: 'Revoke All', exact: true }).click();
  await savePermissions(page);
  let saved = await readGrants(page, headers, 'R', roleName);
  expect(saved.filter((grant) => featureNames.includes(grant.name) && grant.isGranted)).toEqual([]);
  expect(saved.find((grant) => grant.name === unrelated)?.isGranted).toBe(true);

  await openPayrollPermissions(page, 'role', roleName);
  await row.getByRole('switch', { name: 'Edit', exact: true }).check();
  await savePermissions(page);
  saved = await readGrants(page, headers, 'R', roleName);
  expect(saved.filter((grant) => featureNames.includes(grant.name) && grant.isGranted).map((grant) => grant.name).sort())
    .toEqual(['Edit', 'Activate', 'ManageEnrollment', 'ApproveOverride'].map((action) => `${esiPrefix}${action}`).sort());
  await openPayrollPermissions(page, 'role', roleName);
  await expect(row.getByRole('switch', { name: 'Edit', exact: true })).toBeChecked();
  await row.getByRole('button', { name: 'Revoke All', exact: true }).click();
  await savePermissions(page);
  await openPayrollPermissions(page, 'role', roleName);
  await row.getByRole('button', { name: 'Grant All', exact: true }).click();
  await savePermissions(page);
  saved = await readGrants(page, headers, 'R', roleName);
  expect(saved.filter((grant) => featureNames.includes(grant.name) && grant.isGranted)).toHaveLength(5);
  await openPayrollPermissions(page, 'role', roleName);
  await page.getByRole('button', { name: 'Collapse Settings', exact: true }).click();
  await page.getByRole('switch', { name: 'All Edit', exact: true }).uncheck();
  await savePermissions(page);
  saved = await readGrants(page, headers, 'R', roleName);
  expect(saved.filter((grant) => featureNames.includes(grant.name) && grant.isGranted).map((grant) => grant.name)).toEqual([`${esiPrefix}View`]);
  expect(saved.find((grant) => grant.name === unrelated)?.isGranted).toBe(true);
  await openPayrollPermissions(page, 'role', roleName);
  await row.getByRole('button', { name: 'Revoke All', exact: true }).click();
  await savePermissions(page);
  await openPayrollPermissions(page, 'role', roleName);
  await expect(row.getByRole('switch', { name: 'View', exact: true })).not.toBeChecked();
  await expect(row.getByRole('switch', { name: 'Edit', exact: true })).not.toBeChecked();
});

test('statutory user Revoke All clears direct grants and preserves role inheritance', async ({ page }) => {
  const headers = await login(page);
  const users = await page.request.get(`${apiURL}/api/identity/users?filter=hr-manager`, { headers });
  expect(users.ok()).toBeTruthy();
  const user = (await users.json()).items.find((item: { userName: string }) => item.userName === 'hr-manager');
  expect(user).toBeTruthy();
  const before = await readGrants(page, headers, 'U', user.id);
  const feature = before.filter((grant) => grant.name.startsWith(esiPrefix));
  expect(feature).toHaveLength(5);
  const isDirect = (grant: Grant) => grant.grantedProviders.some((source) => source.providerName === 'U' && source.providerKey === user.id);
  const endpoint = `${apiURL}/api/permission-management/permissions?${new URLSearchParams({ providerName: 'U', providerKey: user.id })}`;
  try {
    const seeded = await page.request.put(endpoint, {
      headers, data: { permissions: feature.map(({ name }) => ({ name, isGranted: true })) },
    });
    expect(seeded.ok()).toBeTruthy();
    await openPayrollPermissions(page, 'user', `${user.name} ${user.surname || ''}`.trim());
    const row = page.getByTestId('permission-Statutory Schemes');
    await expect(row.getByRole('switch', { name: 'Edit', exact: true })).toBeChecked();
    await row.getByRole('button', { name: 'Revoke All', exact: true }).click();
    await savePermissions(page);
    const saved = await readGrants(page, headers, 'U', user.id);
    expect(saved.filter((grant) => grant.name.startsWith(esiPrefix)).some(isDirect)).toBe(false);
    expect(saved.filter((grant) => !grant.name.startsWith(esiPrefix))).toEqual(before.filter((grant) => !grant.name.startsWith(esiPrefix)));
    const inherited = saved.find((grant) => grant.name === `${esiPrefix}View`)!;
    expect(inherited.isGranted).toBe(true);
    expect(inherited.grantedProviders).toContainEqual({ providerName: 'R', providerKey: 'HR Manager' });
    await openPayrollPermissions(page, 'user', `${user.name} ${user.surname || ''}`.trim());
    await expect(row.getByRole('switch', { name: 'View', exact: true })).not.toBeChecked();
    await expect(row.getByRole('switch', { name: 'Edit', exact: true })).not.toBeChecked();
    await expect(row.getByRole('button', { name: 'Grant All', exact: true })).toBeVisible();
  } finally {
    const restored = await page.request.put(endpoint, {
      headers, data: { permissions: feature.map((grant) => ({ name: grant.name, isGranted: isDirect(grant) })) },
    });
    expect(restored.ok()).toBeTruthy();
    expect(await readGrants(page, headers, 'U', user.id)).toEqual(before);
  }
});

[[], ['View']].forEach((availableActions) => {
  test(`limited catalogue supports ${availableActions.length ? 'View-only revocation' : 'no-action disabling'}`, async ({ page }) => {
    const headers = await login(page);
    const roleName = `security-limited-${randomUUID().slice(0, 8)}`;
    const created = await page.request.post(`${apiURL}/api/identity/roles`, {
      headers,
      data: {
        name: roleName, isDefault: false, isPublic: false,
        employeeOnboardingAssignable: false, employeeGroupAudience: 'Both',
        extraProperties: { color: '#456789', roleAudience: 'Employee', employeeGroupAudience: 'Both', employeeOnboardingAssignable: false },
      },
    });
    expect(created.ok()).toBeTruthy();
    const prefix = 'Students.Admissions.Applications.';
    // Model unavailable server actions while retaining real API persistence.
    await page.route('**/api/permission-management/permissions?**', async (route) => {
      const request = route.request();
      if (request.method() !== 'GET' || new URL(request.url()).searchParams.get('providerKey') !== roleName) {
        await route.continue();
        return;
      }
      const response = await route.fetch();
      const catalogue = await response.json();
      catalogue.groups.forEach((group: { permissions: Grant[] }) => {
        group.permissions = group.permissions.filter((grant) =>
          !grant.name.startsWith(prefix) || availableActions.includes(grant.name.slice(prefix.length))
        );
      });
      await route.fulfill({ response, json: catalogue });
    });
    await openApplications(page, roleName);
    const row = page.getByTestId('permission-All Applications');
    await expect(row.getByRole('switch', { name: 'Delete', exact: true })).toBeDisabled();
    if (!availableActions.length) {
      await expect(row.getByRole('button', { name: 'Grant All', exact: true })).toBeDisabled();
      await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled();
      return;
    }
    await row.getByRole('button', { name: 'Grant All', exact: true }).click();
    await expect(row.getByRole('button', { name: 'Revoke All', exact: true })).toBeVisible();
    await savePermissions(page);
    expect((await readGrants(page, headers, 'R', roleName)).find((grant) => grant.name === `${prefix}View`)?.isGranted).toBe(true);
    await openApplications(page, roleName);
    await row.getByRole('button', { name: 'Revoke All', exact: true }).click();
    await savePermissions(page);
    expect((await readGrants(page, headers, 'R', roleName)).filter((grant) => grant.name.startsWith(prefix) && grant.isGranted)).toEqual([]);
    await openApplications(page, roleName);
    await expect(row.getByRole('switch', { name: 'View', exact: true })).not.toBeChecked();
  });
});
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
  test(`staging grouped role and inherited-user round trips at ${viewport.width}px`, async ({ page }) => {
    test.setTimeout(300_000);
    await page.setViewportSize(viewport);
    const headers = await login(page);
    const roleName = `security-staging-ui-${  randomUUID().slice(0, 8)}`;
    const role = await page.request.post(`${apiURL  }/api/identity/roles`, {
      headers, data: { name: roleName, isDefault: false, isPublic: false,
        employeeOnboardingAssignable: false, employeeGroupAudience: 'Both',
        extraProperties: { color: '#456789', roleAudience: 'Employee', employeeGroupAudience: 'Both', employeeOnboardingAssignable: false } },
    });
    expect(role.ok()).toBeTruthy();
    const grants = await readGrants(page, headers, 'R', roleName);
    const applicationNames = grants.filter((grant) => /^Students\.Admissions\.Applications\.[^.]+$/.test(grant.name)).map((grant) => grant.name);
    expect(applicationNames.length).toBeGreaterThanOrEqual(3);
    await openApplications(page, roleName);
    await verifyBounds(page);
    const row = page.getByTestId('permission-All Applications');
    await expect(row.getByRole('switch')).toHaveCount(3);
    await expect(page.getByRole('textbox', { name: 'Search permissions' })).toHaveCount(0);
    // Expansion must not dirty the permission form.
    await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled();
    await row.getByRole('button', { name: 'Grant All', exact: true }).click();
    page.once('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(row.getByRole('switch', { name: 'Add', exact: true })).toBeChecked();
    await savePermissions(page);
    let persisted = await readGrants(page, headers, 'R', roleName);
    expect(persisted.filter((grant) => applicationNames.includes(grant.name) && grant.isGranted)).toHaveLength(applicationNames.length);
    await openApplications(page, roleName);
    await expect(row.getByRole('switch', { name: 'Add', exact: true })).toBeChecked();
    await row.getByRole('button', { name: 'Revoke All', exact: true }).click();
    await savePermissions(page);
    persisted = await readGrants(page, headers, 'R', roleName);
    expect(persisted.filter((grant) => applicationNames.includes(grant.name) && grant.isGranted)).toEqual([]);
    await openApplications(page, roleName);
    await expect(row.getByRole('switch', { name: 'View', exact: true })).not.toBeChecked();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    const users = await page.request.get(`${apiURL  }/api/identity/users?filter=hr-manager`, { headers });
    const user = (await users.json()).items.find((item: { userName: string }) => item.userName === 'hr-manager');
    expect(user).toBeTruthy();
    const userName = (`${user.name  } ${  user.surname || ''}`).trim();
    const before = await readGrants(page, headers, 'U', user.id);
    const target = before.find((grant) => grant.name === `${esiPrefix  }View`)!;
    expect(target.grantedProviders).toContainEqual({ providerName: 'R', providerKey: 'HR Manager' });
    const hadDirect = target.grantedProviders.some((provider) => provider.providerName === 'U' && provider.providerKey === user.id);
    try {
      await openPayrollPermissions(page, 'user', userName);
      const view = page.getByTestId('permission-Statutory Schemes').getByRole('switch', { name: 'View', exact: true });
      await view.setChecked(!hadDirect);
      await savePermissions(page);
      const changed = (await readGrants(page, headers, 'U', user.id)).find((grant) => grant.name === target.name)!;
      expect(changed.grantedProviders.some((provider) => provider.providerName === 'U' && provider.providerKey === user.id)).toBe(!hadDirect);
      expect(changed.isGranted).toBe(true);
      await openPayrollPermissions(page, 'user', userName);
      if (hadDirect) await expect(view).not.toBeChecked();
      else await expect(view).toBeChecked();
      await view.setChecked(hadDirect);
      await savePermissions(page);
      expect(await readGrants(page, headers, 'U', user.id)).toEqual(before);
    } finally {
      const restored = await page.request.put(`${apiURL  }/api/permission-management/permissions?${  new URLSearchParams({ providerName: 'U', providerKey: user.id })}`, {
        headers, data: { permissions: [{ name: target.name, isGranted: hadDirect }] },
      });
      expect(restored.ok()).toBeTruthy();
    }
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

test('collapsed bulk removal preserves unrelated module grants', async ({ page }) => {
  const headers = await login(page);
  const roleName = `security-collapsed-${randomUUID().slice(0, 8)}`;
  const created = await page.request.post(`${apiURL}/api/identity/roles`, {
    headers,
    data: {
      name: roleName, isDefault: false, isPublic: false,
      employeeOnboardingAssignable: false, employeeGroupAudience: 'Both',
      extraProperties: { color: '#456789', roleAudience: 'Employee', employeeGroupAudience: 'Both', employeeOnboardingAssignable: false },
    },
  });
  expect(created.ok()).toBeTruthy();
  const applicationNames = (await readGrants(page, headers, 'R', roleName))
    .filter((grant) => /^Students\.Admissions\.Applications\.[^.]+$/.test(grant.name))
    .map((grant) => grant.name);
  expect(applicationNames.length).toBeGreaterThanOrEqual(3);
  const unrelatedName = 'Finance.Settings.FeeStructure.View';
  const initial = await page.request.put(
    `${apiURL}/api/permission-management/permissions?${new URLSearchParams({ providerName: 'R', providerKey: roleName })}`,
    { headers, data: { permissions: [...applicationNames, unrelatedName].map((name) => ({ name, isGranted: true })) } }
  );
  expect(initial.ok()).toBeTruthy();
  await openApplications(page, roleName);
  await page.getByRole('button', { name: 'Collapse Applications', exact: true }).click();
  await expect(page.getByTestId('permission-All Applications')).not.toBeVisible();
  // Other admissions groups have no grants, so first grant the selected action column.
  await page.getByRole('switch', { name: 'All View', exact: true }).check();
  await page.getByRole('switch', { name: 'All View', exact: true }).uncheck();
  await savePermissions(page);
  const persisted = await readGrants(page, headers, 'R', roleName);
  expect(persisted.filter((grant) => applicationNames.includes(grant.name) && grant.isGranted)).toEqual([]);
  expect(persisted.find((grant) => grant.name === unrelatedName)?.isGranted).toBe(true);
  await openApplications(page, roleName);
  await Promise.all(['View', 'Add', 'Delete'].map((action) =>
    expect(page.getByTestId('permission-All Applications').getByRole('switch', { name: action, exact: true })).not.toBeChecked()
  ));
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
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
  if (!(await page.getByTestId('permission-Statutory Schemes').isVisible())) await page.getByRole('button', { name: 'Expand Settings', exact: true }).click();
  const activateSwitch = page.getByTestId('permission-Statutory Schemes').getByRole('switch', { name: 'View', exact: true });
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
