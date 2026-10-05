/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop */
import {
  test,
  expect,
  type Page,
  type Locator,
  type APIResponse,
  type Response as PlaywrightResponse,
} from '@playwright/test';

import { withHrPayrollQaMutex } from './hr-payroll-qa-mutex';
import { createEmployeeFixture } from './employee/employee-fixtures';
import {
  employeeApiRequest,
  findEmployeeBySearch,
  assignEmployeeToFirstAcademicScope,
} from './employee/employee-api';
import {
  saveAndNext,
  searchEmployee,
  clickAddEmployee,
  gotoEmployeeList,
  openFirstRowEdit,
  dismissAcademicYearTour,
  fillRequiredPersonalInformation,
} from './employee/employee-page';

const fullCycleEnabled = process.env.E2E_HR_FULL_CYCLE === '1';

const today = new Date();
const grossEarningAmount = 30_000;
const deductionAmount = 1_500;
const earningComponentName = 'E2E Basic Pay';
const deductionComponentName = 'E2E Payroll Deduction';

type RuntimeGuard = {
  assertClean: () => void;
};

type AcademicYear = {
  id: string;
  name?: string;
  startDate?: string;
  endDate?: string;
};

type AcademicYearListItem = AcademicYear & {
  academicYear?: AcademicYear;
};

type ApiJsonResponse = APIResponse | PlaywrightResponse;

type TestPolicies = {
  calendar: any;
  attendance: any;
  payroll: any;
  leave: any;
};

const yyyyMmDd = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

const ddMmYyyy = (date: Date) =>
  `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}-${date.getFullYear()}`;

const payrollMonth = (date: Date) =>
  `${date.toLocaleString('en-US', { month: 'long' }).toUpperCase()}-${date.getFullYear()}`;

const payrollMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const firstWeekdayInMonth = (date: Date) => {
  const candidate = new Date(date.getFullYear(), date.getMonth(), 1);

  while ([0, 6].includes(candidate.getDay())) {
    candidate.setDate(candidate.getDate() + 1);
  }

  return candidate;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function asItems<T = Record<string, any>>(body: any): T[] {
  if (Array.isArray(body?.items)) return body.items as T[];
  if (Array.isArray(body)) return body as T[];
  return [];
}

function isActivePolicy(item: any) {
  return String(item?.status || '').toLowerCase() === 'active';
}

function expectMoneyClose(actual: unknown, expected: unknown, label: string) {
  expect(Number(actual), label).toBeCloseTo(Number(expected), 2);
}

function firstDefined(...values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null);
}

function sumComponentAmounts(components: any[] | undefined) {
  return (components || []).reduce((total, component) => total + Number(component?.amount ?? 0), 0);
}

async function expectOk(response: ApiJsonResponse, label: string) {
  const details = response.ok() ? '' : await response.text();
  expect(response.ok(), `${label}: ${response.status()} ${details}`).toBe(true);
}

async function jsonFrom<T = any>(response: ApiJsonResponse, label: string): Promise<T> {
  await expectOk(response, label);
  return response.json();
}

async function getJson<T = any>(
  page: Page,
  path: string,
  init: RequestInit & { timeout?: number } = {}
): Promise<T> {
  return jsonFrom<T>(await employeeApiRequest(page, path, init), `GET ${path}`);
}

function assertLocalDdvsOnly() {
  const frontend = new URL(
    process.env.E2E_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  );
  const api = new URL(
    process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://localhost:44332'
  );
  const localHosts = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

  expect(localHosts.has(frontend.hostname), `frontend must be local: ${frontend.href}`).toBe(true);
  expect(localHosts.has(api.hostname), `API must be local: ${api.href}`).toBe(true);
  expect((process.env.E2E_TENANT || 'DDVS').toUpperCase(), 'tenant must be DDVS').toBe('DDVS');
}

async function attachRuntimeGuards(page: Page): Promise<RuntimeGuard> {
  const failures: string[] = [];

  await page.addInitScript(() => {
    (window as any).__hrGoldenLastActions = [];
    const remember = (event: Event) => {
      const element = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (
        !element?.tagName ||
        !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(element.tagName)
      ) {
        return;
      }

      const label = element.id
        ? document.querySelector(`label[for="${CSS.escape(element.id)}"]`)
        : null;
      const actions = (window as any).__hrGoldenLastActions as any[];
      actions.push({
        event: event.type,
        tag: element.tagName,
        type: element.getAttribute('type'),
        name: element.getAttribute('name'),
        id: element.id,
        ariaLabel: element.getAttribute('aria-label'),
        label: label?.textContent || '',
        value: element.value,
        text: element.textContent,
        wrapperText: (element.closest('.MuiFormControl-root')?.textContent || '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 160),
      });
      actions.splice(0, Math.max(0, actions.length - 40));
    };

    ['focusin', 'input', 'change', 'click', 'blur'].forEach((eventName) =>
      document.addEventListener(eventName, remember, true)
    );
  });

  page.on('console', async (message) => {
    if (message.type() === 'error') {
      const text = message.text();
      const isNextAuthSessionNoise =
        text.includes('ClientFetchError: Failed to fetch') && text.includes('authjs.dev#autherror');
      const isHandledResource400 =
        text.includes('Failed to load resource') && text.includes('status of 400');
      if (isNextAuthSessionNoise || isHandledResource400) return;
      const location = message.location();
      const source = [location.url, location.lineNumber, location.columnNumber]
        .filter((part) => part !== undefined && part !== '')
        .join(':');
      const args = await Promise.all(
        message.args().map((arg) =>
          arg
            .jsonValue()
            .then((value) => (typeof value === 'string' ? value : JSON.stringify(value)))
            .catch(() => '<unserializable>')
        )
      );
      const activeElement = await page
        .evaluate(() => document.activeElement?.outerHTML?.slice(0, 500) || '')
        .catch(() => '');
      const diagnostic = text.includes('uncontrolled input to be controlled')
        ? await page
            .evaluate(() => {
              const controls = Array.from(document.querySelectorAll('input, textarea, select')).map(
                (element) => {
                  const control = element as
                    | HTMLInputElement
                    | HTMLTextAreaElement
                    | HTMLSelectElement;
                  const label = control.id
                    ? document.querySelector(`label[for="${CSS.escape(control.id)}"]`)
                    : null;
                  return {
                    tag: control.tagName,
                    type: control.getAttribute('type'),
                    name: control.getAttribute('name'),
                    id: control.id,
                    ariaLabel: control.getAttribute('aria-label'),
                    label: label?.textContent || '',
                    value: control.value,
                    attrValue: control.getAttribute('value'),
                    checked: 'checked' in control ? (control as HTMLInputElement).checked : null,
                    wrapperText: (control.closest('.MuiFormControl-root')?.textContent || '')
                      .replace(/\s+/g, ' ')
                      .trim()
                      .slice(0, 160),
                    html: control.outerHTML.slice(0, 220),
                  };
                }
              );
              return { actions: (window as any).__hrGoldenLastActions || [], controls };
            })
            .catch(() => null)
        : null;
      failures.push(
        `console error at ${page.url()}${source ? ` (${source})` : ''}: ${text}` +
          `${args.length ? `\nargs: ${args.join(' | ')}` : ''}` +
          `${activeElement ? `\nactive: ${activeElement}` : ''}` +
          `${diagnostic ? `\ndiagnostic: ${JSON.stringify(diagnostic, null, 2)}` : ''}`
      );
    }
  });

  page.on('pageerror', (error) => {
    failures.push(`page error: ${error.message}`);
  });

  page.on('response', (response) => {
    const url = response.url();
    const isHrPayrollApi =
      url.includes('/api/hr/') ||
      url.includes('/api/payroll/') ||
      url.includes('/api/leave-policies') ||
      url.includes('/api/employees');
    if (isHrPayrollApi && response.status() >= 500) {
      failures.push(`${response.status()} ${response.request().method()} ${url}`);
    }
  });

  return {
    assertClean: () => expect(failures, failures.join('\n')).toEqual([]),
  };
}

async function openHrPage(page: Page, path: string, marker: RegExp) {
  const route = path.includes('?') || path.endsWith('/') ? path : `${path}/`;
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await dismissAcademicYearTour(page);
    await expect(page, `${route} should stay authenticated`).not.toHaveURL(/\/login|\/auth/i);

    try {
      await expect(page.getByText(marker).first()).toBeVisible({ timeout: 60_000 });
      return;
    } catch (error) {
      lastError = error;
      if (attempt === 2) break;
      await page.waitForTimeout(5_000);
    }
  }

  throw lastError;
}

async function dismissNotifications(page: Page) {
  const closeButton = page
    .getByRole('region', { name: /Notifications/i })
    .getByRole('button', { name: /Close/i })
    .first();
  await closeButton.click({ force: true, timeout: 1_000 }).catch(() => undefined);
  await closeButton.click({ force: true, timeout: 1_000 }).catch(() => undefined);
  await closeButton.click({ force: true, timeout: 1_000 }).catch(() => undefined);
}

function activeDrawer(page: Page, title: RegExp) {
  return page.locator('.MuiDrawer-paper').filter({ hasText: title }).last();
}

function activeDialog(page: Page, title: RegExp) {
  return page.getByRole('dialog').filter({ hasText: title }).last();
}

async function selectComboboxOption(page: Page, scope: Locator, index: number, option: RegExp) {
  await scope.getByRole('combobox').nth(index).click();
  await page.getByRole('option', { name: option }).first().click();
}

async function setCheckbox(scope: Locator, label: RegExp, checked: boolean) {
  let control = scope.getByRole('checkbox', { name: label }).first();
  if (!(await control.isVisible().catch(() => false))) {
    control = scope.getByRole('switch', { name: label }).first();
  }

  await expect(control).toBeVisible();
  if ((await control.isChecked()) !== checked) {
    await control.click();
  }
}

async function submitAndMaybeConfirm(
  page: Page,
  predicate: (response: PlaywrightResponse) => boolean,
  label: string
) {
  const responsePromise = page.waitForResponse(predicate, { timeout: 90_000 });
  await page
    .getByRole('button', { name: /^Submit$/i })
    .last()
    .click();

  const confirm = page.getByRole('button', { name: /^Confirm /i }).first();
  const firstResult = await Promise.race([
    responsePromise.then(() => 'response' as const),
    confirm
      .waitFor({ state: 'visible', timeout: 45_000 })
      .then(() => 'confirm' as const)
      .catch(() => 'no-confirm' as const),
  ]);
  if (firstResult === 'confirm') {
    await confirm.click();
  }

  return jsonFrom(await responsePromise, label);
}

/* eslint-disable no-await-in-loop */
async function findVisibleTableRowAcrossPages(page: Page, tableId: string, rowText: string) {
  const table = page.getByTestId(tableId);
  const row = table.getByRole('row', { name: new RegExp(escapeRegExp(rowText), 'i') }).first();
  await expect(table).toBeVisible({ timeout: 60_000 });
  await dismissNotifications(page);
  const displayedRows = page.locator('.MuiTablePagination-displayedRows').last();
  await expect
    .poll(
      async () => {
        if (await row.isVisible().catch(() => false)) {
          return 'ready';
        }
        const text = await displayedRows.textContent().catch(() => '');
        return /0\s*[–-]\s*0\s+of\s+0/i.test(text || '') ? 'loading' : 'ready';
      },
      { timeout: 60_000 }
    )
    .toBe('ready');

  for (let pageIndex = 0; pageIndex < 60; pageIndex += 1) {
    if (await row.isVisible().catch(() => false)) {
      return row;
    }

    const nextPage = page.getByRole('button', { name: /Go to next page/i }).last();
    if ((await nextPage.count()) > 0 && !(await nextPage.isDisabled())) {
      await nextPage.scrollIntoViewIfNeeded();
      const previousRange = await displayedRows.textContent().catch(() => '');
      await nextPage.click();
      await expect(table).toBeVisible();
      await expect
        .poll(async () => displayedRows.textContent().catch(() => ''), { timeout: 5_000 })
        .not.toBe(previousRange);
    }
    await page.waitForTimeout(250);
  }

  await expect(row, `${rowText} should be visible in ${tableId}`).toBeVisible({ timeout: 1_000 });
  return row;
}
/* eslint-enable no-await-in-loop */

async function waitForPolicyRowDefault(page: Page, tableId: string, policyName: string) {
  const row = await findVisibleTableRowAcrossPages(page, tableId, policyName);
  await expect(row).toContainText(/Default/i, { timeout: 60_000 });
}

async function getCurrentAcademicYear(page: Page): Promise<AcademicYear> {
  const body = await getJson<any>(page, '/app/academic-year?Sorting=name');
  const years = asItems<AcademicYearListItem>(body).map(
    (item): AcademicYear => item.academicYear || item
  );
  const todayIso = yyyyMmDd(today);
  const current =
    years.find(
      (year: AcademicYear) =>
        year.id &&
        (!year.startDate || year.startDate <= todayIso) &&
        (!year.endDate || year.endDate >= todayIso)
    ) || years.find((year: AcademicYear) => year.id);

  if (!current?.id) {
    throw new Error('Unable to resolve current academic year');
  }
  return current;
}

async function createWorkCalendarThroughUi(page: Page, name: string) {
  await openHrPage(page, '/hr/calendars', /Work Calendars|Policies & Rules/i);
  await page.getByRole('button', { name: /New Calendar/i }).click();

  const drawer = activeDrawer(page, /New Work Calendar/i);
  await expect(drawer).toBeVisible();
  await drawer.locator('input').first().fill(name);

  const calendar = await submitAndMaybeConfirm(
    page,
    (response) =>
      response.url().includes('/api/hr/work-calendar-policies') &&
      response.request().method() === 'POST',
    'create work calendar'
  );
  await findVisibleTableRowAcrossPages(page, 'hr-work-calendars', name);
  return calendar;
}

async function createAttendancePolicyThroughUi(page: Page, name: string, calendarName: string) {
  await openHrPage(page, '/hr/attendance', /Attendance Policies|Policies & Rules/i);
  await page.getByRole('button', { name: /New Standard Policy/i }).click();

  const drawer = activeDrawer(page, /New Attendance Policy/i);
  await expect(drawer).toBeVisible();
  await drawer.locator('input').first().fill(name);
  await selectComboboxOption(page, drawer, 1, new RegExp(escapeRegExp(calendarName), 'i'));
  await selectComboboxOption(page, drawer, 2, /Manual with time/i);
  await setCheckbox(drawer, /Default policy/i, true);

  const policy = await submitAndMaybeConfirm(
    page,
    (response) =>
      response.url().includes('/api/hr/attendance/policies') &&
      response.request().method() === 'POST',
    'create attendance policy'
  );
  await waitForPolicyRowDefault(page, 'hr-attendance-policies', name);
  return policy;
}

async function createPayrollPolicyThroughUi(page: Page, name: string, calendarName: string) {
  await openHrPage(page, '/hr/payrollPolicies', /Payroll Policies|Policies & Rules/i);
  await page.getByRole('button', { name: /New Policy/i }).click();

  const drawer = activeDrawer(page, /New Payroll Policy/i);
  await expect(drawer).toBeVisible();
  await drawer.locator('input').first().fill(name);
  await selectComboboxOption(page, drawer, 1, new RegExp(escapeRegExp(calendarName), 'i'));
  await setCheckbox(drawer, /Default policy/i, true);
  await expect(drawer.getByText(/Working Days/i).first()).toBeVisible();

  const policy = await submitAndMaybeConfirm(
    page,
    (response) =>
      response.url().includes('/api/hr/payroll/policies') && response.request().method() === 'POST',
    'create payroll policy'
  );
  await waitForPolicyRowDefault(page, 'hr-payroll-policies', name);
  return policy;
}

async function createLeavePolicyThroughUi(page: Page, name: string) {
  await openHrPage(page, '/hr/leave-policies', /Leave Policies|Policies & Rules/i);
  await page.getByRole('button', { name: /New Leave Policy/i }).click();

  const dialog = activeDialog(page, /Add Leave Policy/i);
  await expect(dialog).toBeVisible();
  await dialog.getByRole('textbox', { name: /Policy Name/i }).fill(name);
  await dialog.getByRole('spinbutton', { name: /^Days \*$/i }).fill('12');
  await setCheckbox(dialog, /Default policy/i, true);
  await setCheckbox(dialog, /Carry forward/i, false);
  await setCheckbox(dialog, /^Approval$/i, true);
  await setCheckbox(dialog, /Encashable/i, false);
  await expect(dialog.getByRole('heading', { name: /^Paid leave rule$/i })).toBeVisible();
  await expect(dialog.getByRole('heading', { name: /^Unpaid leave rule$/i })).toBeVisible();

  const policy = await submitAndMaybeConfirm(
    page,
    (response) =>
      response.url().includes('/api/leave-policies') && response.request().method() === 'POST',
    'create leave policy'
  );
  await waitForPolicyRowDefault(page, 'hr-leave-policies-workspace', name);
  return policy;
}

async function assertDefaultPolicyInvariants(
  page: Page,
  academicYearId: string,
  policies: TestPolicies
) {
  const [calendars, attendance, payroll, leave] = await Promise.all([
    getJson<any>(
      page,
      `/hr/work-calendar-policies?academicYearId=${academicYearId}&maxResultCount=500`
    ),
    getJson<any>(
      page,
      `/hr/attendance/policies?academicYearId=${academicYearId}&maxResultCount=500`
    ),
    getJson<any>(page, `/hr/payroll/policies?academicYearId=${academicYearId}&maxResultCount=500`),
    getJson<any>(page, `/leave-policies?academicYearId=${academicYearId}&page=1&pageSize=500`),
  ]);

  const activeDefaultsById = (body: any) =>
    asItems(body)
      .filter((item: any) => isActivePolicy(item) && item.isDefault)
      .map((item: any) => item.id);

  expect(activeDefaultsById(attendance), 'single active default attendance policy').toEqual([
    policies.attendance.id,
  ]);
  expect(activeDefaultsById(payroll), 'single active default payroll policy').toEqual([
    policies.payroll.id,
  ]);
  expect(activeDefaultsById(leave), 'single active default leave policy').toEqual([
    policies.leave.id,
  ]);

  const activeTestCalendar = asItems(calendars).find(
    (item: any) => item.id === policies.calendar.id && isActivePolicy(item)
  );
  expect(activeTestCalendar, 'active E2E work calendar exists').toBeTruthy();
  expect(policies.attendance.workCalendarPolicyId, 'attendance calendar link').toBe(
    policies.calendar.id
  );
  expect(policies.payroll.workCalendarPolicyId, 'payroll calendar link').toBe(policies.calendar.id);
}

async function ensurePayrollComponent(page: Page, kind: 'earning' | 'deduction') {
  const isEarning = kind === 'earning';
  const name = isEarning ? earningComponentName : deductionComponentName;
  const path = isEarning ? '/payroll/earning-components' : '/payroll/deduction-components';
  const list = await getJson<any>(
    page,
    `${path}?page=1&pageSize=100&search=${encodeURIComponent(name)}`
  );
  const existing = asItems(list).find((item: any) =>
    String(item.earningComponentName || item.deductionComponentName || item.componentName || '')
      .toLowerCase()
      .includes(name.toLowerCase())
  );

  if (existing?.id) return existing;

  const response = await employeeApiRequest(page, path, {
    method: 'POST',
    body: JSON.stringify(
      isEarning
        ? {
            earningComponentName: name,
            description: 'E2E fixed earning component',
            earningType: 'Fixed',
            calculationType: 'Amount',
            amount: grossEarningAmount,
            percentage: 0,
            selectedEarningComponentId: null,
            visibleInPayslip: true,
          }
        : {
            deductionComponentName: name,
            description: 'E2E fixed deduction component',
            deductionType: 'Fixed',
            calculationType: 'Amount',
            amount: deductionAmount,
            percentage: 0,
            selectedDeductionComponentId: null,
            visibleInPayslip: true,
          }
    ),
  });
  return jsonFrom(response, `create ${kind} component`);
}

async function setEmployeeSalaryStructure(page: Page, employeeId: string, employeeName: string) {
  const earning = await ensurePayrollComponent(page, 'earning');
  const deduction = await ensurePayrollComponent(page, 'deduction');
  const earningLine = {
    componentId: earning.id,
    name: earning.earningComponentName || earning.componentName || earningComponentName,
    amount: grossEarningAmount,
    isFixed: true,
    isTemp: false,
  };
  const deductionLine = {
    componentId: deduction.id,
    name: deduction.deductionComponentName || deduction.componentName || deductionComponentName,
    amount: deductionAmount,
    isFixed: true,
    isTemp: false,
  };

  await expectOk(
    await employeeApiRequest(page, `/employees/${employeeId}/payroll`, {
      method: 'PUT',
      body: JSON.stringify({
        bankDetails: {
          bankName: 'State Bank of India',
          branchName: 'Automation Branch',
          accountHolderName: employeeName,
          accountNumber: `12345${employeeId.replace(/\D/g, '').slice(-9).padStart(9, '0')}`,
          ifscCode: 'SBIN0001234',
        },
        salaryDetails: {
          pfRuleId: null,
          epfNumber: 'AP/12345/1234567',
          uanNumber: '123456789012',
          punchId: `E2E${employeeId.slice(0, 6)}`,
          totalWorkingHourPerMonth: 176,
        },
        earningComponents: [earningLine],
        deductionComponents: [deductionLine],
      }),
    }),
    'set staff payroll details'
  );

  await expectOk(
    await employeeApiRequest(page, `/payroll/employees/${employeeId}/salary-structure`, {
      method: 'PUT',
      body: JSON.stringify({
        earningComponents: [
          {
            id: null,
            ...earningLine,
            description: earning.description || '',
            componentType: earning.componentType,
          },
        ],
        deductionComponents: [
          {
            id: null,
            ...deductionLine,
            description: deduction.description || '',
            componentType: deduction.componentType,
          },
        ],
      }),
    }),
    'set staff salary structure'
  );
}

async function upsertEmployeePolicyOverride(
  page: Page,
  employeeId: string,
  academicYearId: string,
  policies: TestPolicies,
  effectiveFrom: string
) {
  const assignment = {
    academicYearId,
    targetType: 'employee',
    targetKey: employeeId,
    targetDisplayName: employeeId,
    payrollPolicyId: policies.payroll.id,
    attendancePolicyId: policies.attendance.id,
    leavePolicyId: policies.leave.id,
    effectiveFrom,
    effectiveTo: null,
    priority: 100,
    assignmentReason: 'E2E HR policies to payroll golden path',
    isActive: true,
  };
  const impactPreview = await jsonFrom<any>(
    await employeeApiRequest(page, '/hr/policy-assignments/impact-preview', {
      method: 'POST',
      body: JSON.stringify({
        action: 'employee-override-upsert',
        assignment,
      }),
    }),
    'preview staff policy override impact'
  );
  expect(impactPreview?.blockingWarnings ?? [], 'staff override blocking warnings').toEqual([]);

  const response = await employeeApiRequest(
    page,
    '/hr/policy-assignments/direct-employee-override',
    {
      method: 'POST',
      body: JSON.stringify({
        employeeId,
        academicYearId,
        payrollPolicyId: policies.payroll.id,
        attendancePolicyId: policies.attendance.id,
        leavePolicyId: policies.leave.id,
        effectiveFrom,
        effectiveTo: null,
        assignmentReason: 'E2E HR policies to payroll golden path',
        confirmationToken: impactPreview?.confirmationToken ?? null,
      }),
    }
  );
  return jsonFrom(response, 'save staff policy override');
}

function assertEffectivePolicies(body: any, policies: TestPolicies, source = 'employee') {
  expect(body?.payrollPolicy?.id, 'effective payroll policy').toBe(policies.payroll.id);
  expect(body?.attendancePolicy?.id, 'effective attendance policy').toBe(policies.attendance.id);
  expect(body?.leavePolicy?.id, 'effective leave policy').toBe(policies.leave.id);
  expect(String(body?.policySource || '').toLowerCase(), 'effective policy source').toBe(source);
}

async function verifyEffectivePoliciesApi(page: Page, employeeId: string, effectiveDate: string, policies: TestPolicies) {
  const result = await getJson<any>(page, `/hr/employees/${employeeId}/effective-policies?date=${encodeURIComponent(effectiveDate)}`);
  assertEffectivePolicies(result, policies);
}

async function createEmployeeThroughListUi(page: Page, prefix: string, joiningDate: Date) {
  const employee = createEmployeeFixture(prefix);
  employee.doj = ddMmYyyy(joiningDate);
  await gotoEmployeeList(page);
  await clickAddEmployee(page);
  await fillRequiredPersonalInformation(page, employee);
  const saveResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/employees/personal-info') &&
      response.request().method() === 'POST',
    { timeout: 60_000 }
  );
  await saveAndNext(page);
  const saveResponse = await saveResponsePromise;
  await expectOk(saveResponse, 'create staff through Staff Directory form');
  await expect(page.getByText(/Father Details|Family Details/i).first()).toBeVisible({
    timeout: 60_000,
  });

  const created = await findEmployeeBySearch(page, employee.email);
  expect(created?.id, `created staff ${employee.email}`).toBeTruthy();

  await gotoEmployeeList(page);
  await searchEmployee(page, employee.email);
  await expect(
    page.getByRole('row', { name: new RegExp(escapeRegExp(employee.email), 'i') })
  ).toBeVisible();

  return { fixture: employee, record: created };
}

async function verifyEmployeePayrollSection(page: Page, employeeEmail: string) {
  await gotoEmployeeList(page);
  await searchEmployee(page, employeeEmail);
  await openFirstRowEdit(page);
  await page.getByText(/^Payroll$/i).click();
  await expect(page.getByText(/Policy Assignment/i)).toBeVisible({ timeout: 60_000 });
}

async function adjustAttendance(page: Page, employeeId: string, attendanceDate: string) {
  const response = await employeeApiRequest(page, '/hr/attendance/register/adjust', {
    method: 'POST',
    body: JSON.stringify({
      employeeId,
      attendanceDate,
      statusWire: 'PRESENT',
      inTime: '09:00:00',
      outTime: '16:00:00',
      reason: 'E2E HR policies to payroll golden path',
    }),
  });
  await jsonFrom(response, 'adjust attendance register');

  const register = await getJson<any>(
    page,
    `/hr/attendance/register?startDate=${attendanceDate}&endDate=${attendanceDate}&employeeId=${employeeId}&skipCount=0&maxResultCount=100`
  );
  const row = asItems(register).find((item: any) => item.employeeId === employeeId);
  const statuses = [row?.statusWire, row?.statusName, row?.status].map((status) =>
    String(status).toLowerCase()
  );
  expect(
    statuses.some((status) => status === '1' || status === 'present'),
    'attendance register status'
  ).toBe(true);
}

/* eslint-disable no-await-in-loop */
async function getPayrollRunPreview(page: Page, month: string) {
  const path = `/payroll/run?month=${encodeURIComponent(month)}&page=0&pageSize=100&forceRefresh=true`;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const response = await employeeApiRequest(page, path, { timeout: 120_000 });
    if (response.ok()) {
      return response.json();
    }

    const details = await response.text();
    if (response.status() === 400 && details.includes('Payroll Month Lock Busy')) {
      await page.waitForTimeout(5_000);
    } else {
      expect(response.ok(), `GET ${path}: ${response.status()} ${details}`).toBe(true);
    }
  }

  throw new Error(`GET ${path}: payroll month stayed busy after retries`);
}
/* eslint-enable no-await-in-loop */

function assertPayrollMath(row: any) {
  const payableDays = Number(row.payableDays ?? row.paidDays ?? 0);
  const totalWorkingDays = Number(row.totalWorkingDays ?? row.workingDays ?? 0);
  const prorationFactor = Number(row.prorationFactor ?? row.prorateFactor ?? 0);
  const gross = Number(row.grossSalary ?? row.totalEarnings ?? 0);
  const deductions = Number(row.totalDeduction ?? row.totalDeductions ?? row.deductionTotal ?? 0);
  const net = Number(row.netPay ?? row.netSalary ?? 0);

  expect(payableDays, 'payable days').toBeGreaterThan(0);
  expect(totalWorkingDays, 'total working days').toBeGreaterThan(0);
  expect(prorationFactor, 'proration factor').toBeGreaterThan(0);
  expectMoneyClose(prorationFactor, payableDays / totalWorkingDays, 'proration factor formula');
  expectMoneyClose(gross, sumComponentAmounts(row.earningComponents), 'gross matches earnings');
  expectMoneyClose(
    deductions,
    sumComponentAmounts(row.deductionComponents),
    'deductions match components'
  );
  expectMoneyClose(net, gross - deductions, 'net matches gross minus deductions');
}

async function lockPayrollAndVerifySlip(
  page: Page,
  employeeId: string,
  academicYearId: string,
  month: string,
  payslipMonth: string,
  previewRow: any
) {
  await expectOk(
    await employeeApiRequest(page, '/payroll/run/reviews', {
      method: 'POST',
      body: JSON.stringify({ month, academicYearId, employeeIds: [employeeId] }),
      timeout: 120_000,
    }),
    'mark payroll reviewed'
  );

  await expectOk(
    await employeeApiRequest(page, '/payroll/run', {
      method: 'POST',
      body: JSON.stringify({ month, academicYearId, employeeIds: [employeeId] }),
      timeout: 120_000,
    }),
    'lock payroll'
  );

  const lockedPreview = await getJson<any>(
    page,
    `/payroll/run?month=${encodeURIComponent(month)}&page=0&pageSize=100&forceRefresh=false`
  );
  const lockedRow = asItems<Record<string, any>>(lockedPreview).find(
    (item) => item.employeeId === employeeId
  );
  if (!lockedRow) {
    throw new Error(`Locked payroll row not found for staff ${employeeId}`);
  }
  expect(Boolean(lockedRow.isLocked ?? lockedRow.locked ?? lockedRow.isFinalized)).toBe(true);

  await openHrPage(page, '/hr/payroll/payslip-generation', /Payslip|Salary/i);
  const slip = await getJson<any>(
    page,
    `/payroll/salary-slips?monthYear=${encodeURIComponent(payslipMonth)}&employeeId=${employeeId}`
  );

  expectMoneyClose(
    firstDefined(slip.totalEarning, slip.totalEarnings),
    firstDefined(lockedRow.grossSalary, lockedRow.totalEarnings, previewRow.grossSalary),
    'salary slip gross matches locked preview'
  );
  expectMoneyClose(
    firstDefined(slip.totalDeduction, slip.totalDeductions),
    firstDefined(
      lockedRow.totalDeduction,
      lockedRow.totalDeductions,
      previewRow.totalDeduction,
      previewRow.totalDeductions,
      sumComponentAmounts(previewRow.deductionComponents)
    ),
    'salary slip deductions match locked preview'
  );
  expectMoneyClose(
    firstDefined(slip.netPay, slip.netSalary),
    firstDefined(lockedRow.netPay, lockedRow.netSalary, previewRow.netPay, previewRow.netSalary),
    'salary slip net matches locked preview'
  );
  expectMoneyClose(
    firstDefined(slip.payableDays, slip.paidDays),
    firstDefined(
      lockedRow.payableDays,
      lockedRow.paidDays,
      previewRow.payableDays,
      previewRow.paidDays
    ),
    'salary slip payable days match locked preview'
  );
  expectMoneyClose(
    firstDefined(slip.totalWorkingDays, slip.workingDays, slip.payrollBasisDays),
    firstDefined(
      lockedRow.totalWorkingDays,
      lockedRow.workingDays,
      previewRow.totalWorkingDays,
      previewRow.workingDays
    ),
    'salary slip working day denominator matches locked preview'
  );
  expectMoneyClose(
    firstDefined(slip.prorationFactor, slip.prorateFactor),
    firstDefined(
      lockedRow.prorationFactor,
      lockedRow.prorateFactor,
      previewRow.prorationFactor,
      previewRow.prorateFactor
    ),
    'salary slip proration factor matches locked preview'
  );
}

test.describe('HR policies to payroll golden path', () => {
  test.skip(!fullCycleEnabled, 'Set E2E_HR_FULL_CYCLE=1 against local DDVS before running.');

  test('configures default policies, creates a staff member, locks payroll, and verifies salary slip', async ({
    page,
  }) => {
    test.setTimeout(900_000);
    await withHrPayrollQaMutex(async () => {
      assertLocalDdvsOnly();
      const guard = await attachRuntimeGuards(page);

      await page.goto('/dashboard/');
      await dismissAcademicYearTour(page);

      const academicYear = await getCurrentAcademicYear(page);
      const stamp = Date.now();
      const sortableStamp = String(9_999_999_999_999 - stamp).padStart(13, '0');
      const calendarName = `E2E Work Calendar 000-${sortableStamp}`;
      const attendancePolicyName = `E2E Attendance Policy 000-${sortableStamp}`;
      const payrollPolicyName = `E2E Payroll Policy 000-${sortableStamp}`;
      const leavePolicyName = `E2E Leave Policy 000-${sortableStamp}`;
      const targetMonthDate = firstWeekdayInMonth(
        new Date(today.getFullYear(), today.getMonth() + 1, 1)
      );
      const attendanceDate = yyyyMmDd(targetMonthDate);
      const month = payrollMonthKey(targetMonthDate);
      const payslipMonth = payrollMonth(targetMonthDate);

      const calendar = await createWorkCalendarThroughUi(page, calendarName);
      const attendance = await createAttendancePolicyThroughUi(
        page,
        attendancePolicyName,
        calendarName
      );
      const payroll = await createPayrollPolicyThroughUi(page, payrollPolicyName, calendarName);
      const leave = await createLeavePolicyThroughUi(page, leavePolicyName);
      const policies = { calendar, attendance, payroll, leave };

      await assertDefaultPolicyInvariants(page, academicYear.id, policies);
      guard.assertClean();

      const { fixture: employeeFixture, record: employeeRecord } =
        await createEmployeeThroughListUi(page, 'Policy Payroll Staff', targetMonthDate);
      await assignEmployeeToFirstAcademicScope(page, employeeRecord);
      const employeeId = employeeRecord.id as string;

      await verifyEmployeePayrollSection(page, employeeFixture.email);
      const defaultPreview = await getJson<any>(
        page,
        `/hr/policy-assignment-preview?academicYearId=${academicYear.id}&date=${attendanceDate}&employeeId=${employeeId}`
      );
      expect(defaultPreview?.payrollPolicy?.id, 'default preview payroll policy').toBe(payroll.id);
      expect(defaultPreview?.attendancePolicy?.id, 'default preview attendance policy').toBe(
        attendance.id
      );
      expect(defaultPreview?.leavePolicy?.id, 'default preview leave policy').toBe(leave.id);

      await upsertEmployeePolicyOverride(
        page,
        employeeId,
        academicYear.id,
        policies,
        attendanceDate
      );
      await verifyEffectivePoliciesApi(page, employeeId, attendanceDate, policies);

      const [previewAfterOverride, effectivePolicies] = await Promise.all([
        getJson<any>(
          page,
          `/hr/policy-assignment-preview?academicYearId=${academicYear.id}&date=${attendanceDate}&employeeId=${employeeId}`
        ),
        getJson<any>(page, `/hr/employees/${employeeId}/effective-policies?date=${attendanceDate}`),
      ]);
      assertEffectivePolicies(previewAfterOverride, policies);
      assertEffectivePolicies(effectivePolicies, policies);

      await openHrPage(page, '/hr/payroll/setting/earning-component', /Earning Component|Payroll/i);
      await openHrPage(
        page,
        '/hr/payroll/setting/deduction-component',
        /Deduction Component|Payroll/i
      );
      await setEmployeeSalaryStructure(page, employeeId, employeeFixture.fullName);
      await openHrPage(page, '/hr/manual-attendance', /Mark Attendance/i);
      await adjustAttendance(page, employeeId, attendanceDate);
      await openHrPage(page, '/hr/attendance-tracking', /Attendance Register/i);

      await openHrPage(page, '/hr/payroll/run-payroll', /Run Payroll/i);
      const preview = await getPayrollRunPreview(page, month);
      const payrollRow = asItems(preview).find((item: any) => item.employeeId === employeeId);
      expect(payrollRow, `payroll row for ${employeeFixture.email}`).toBeTruthy();
      assertPayrollMath(payrollRow);

      await lockPayrollAndVerifySlip(
        page,
        employeeId,
        academicYear.id,
        month,
        payslipMonth,
        payrollRow
      );
      guard.assertClean();
    });
  });
});
