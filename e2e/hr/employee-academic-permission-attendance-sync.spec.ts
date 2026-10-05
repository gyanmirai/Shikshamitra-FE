/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop, no-continue, perfectionist/sort-named-imports */
import { test, expect, type APIResponse, type Page } from '@playwright/test';

import { withHrPayrollQaMutex } from './hr-payroll-qa-mutex';
import { dismissAcademicYearTour } from './employee/employee-page';
import { createEmployeeFixture } from './employee/employee-fixtures';
import { employeeApiRequest, createEmployeeFromExistingDefaults } from './employee/employee-api';

const syncE2eEnabled = process.env.E2E_HR_ATTENDANCE_SYNC === '1';
const attendanceDaysToSave = 15;
const attendanceScanWindowDays = 90;
const grossEarningAmount = 30_000;
const deductionAmount = 1_500;
const earningComponentName = 'E2E Attendance Sync Basic Pay';
const deductionComponentName = 'E2E Attendance Sync Deduction';
const scopedHrEmail = process.env.E2E_ATTENDANCE_SCOPE_HR_EMAIL || 'hr-manager@ddvs.com';
const scopedHrPassword = process.env.E2E_ATTENDANCE_SCOPE_HR_PASSWORD || 'Temp@123';

type AcademicYear = {
  id: string;
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

type AcademicYearListItem = AcademicYear & {
  academicYear?: AcademicYear;
};

type StageSelection = {
  boardId: string;
  boardName: string;
  mediumId: string;
  mediumName: string;
  stageId: string;
  stageName: string;
};

type AttendanceDay = {
  totalCount?: number;
  isDayLocked?: boolean;
  isHoliday?: boolean;
  holidayName?: string | null;
  holidayReason?: string | null;
  items?: AttendanceDayRow[];
};

type AttendanceDayRow = {
  employeeId: string;
  fullName?: string;
  employeeCode?: string;
  shiftStartTime?: string | null;
  shiftEndTime?: string | null;
  status?: unknown;
  captureMode?: string | null;
};

const today = new Date();

function frontendBaseUrl() {
  return (
    process.env.E2E_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

function assertLocalDdvsOnly() {
  const frontend = new URL(frontendBaseUrl());
  const api = new URL(
    process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://localhost:44332'
  );
  const localHosts = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

  expect(localHosts.has(frontend.hostname), `frontend must be local: ${frontend.href}`).toBe(true);
  expect(localHosts.has(api.hostname), `API must be local: ${api.href}`).toBe(true);
  expect((process.env.E2E_TENANT || 'DDVS').toUpperCase(), 'tenant must be DDVS').toBe('DDVS');
}

function yyyyMmDd(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function parseDateOnly(value?: string | null) {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

function maxDate(left: Date, right: Date) {
  return left.getTime() >= right.getTime() ? left : right;
}

function minDate(left: Date, right: Date) {
  return left.getTime() <= right.getTime() ? left : right;
}

function payrollMonth(date: Date) {
  return `${date.toLocaleString('en-US', { month: 'long' }).toUpperCase()}-${date.getFullYear()}`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function asItems<T = Record<string, any>>(body: any): T[] {
  if (Array.isArray(body?.items)) return body.items as T[];
  if (Array.isArray(body)) return body as T[];
  return [];
}

async function expectOk(response: APIResponse, label: string) {
  const details = response.ok() ? '' : await response.text();
  expect(response.ok(), `${label}: ${response.status()} ${details}`).toBe(true);
}

async function jsonFrom<T = any>(response: APIResponse, label: string): Promise<T> {
  await expectOk(response, label);
  return response.json();
}

async function getJson<T = any>(page: Page, path: string): Promise<T> {
  return jsonFrom<T>(await employeeApiRequest(page, path), `GET ${path}`);
}

async function loginLocalUser(page: Page, email: string, password: string) {
  await page.goto(`${frontendBaseUrl()}/login`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await expect(page.getByLabel('School Code')).toBeVisible({ timeout: 60_000 });
  await page.getByLabel('School Code').fill(process.env.E2E_TENANT || 'DDVS');
  await page.getByLabel('Email / Username').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /Sign In/i }).click();
  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          const response = await fetch('/api/auth/session');
          if (!response.ok) return false;
          const session = await response.json();
          return Boolean(session?.accessToken);
        }),
      { timeout: 60_000 }
    )
    .toBe(true);
  await page.evaluate(() => localStorage.setItem('onboarding_completed', 'true'));
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 30_000 });
}

async function findIdentityUserId(page: Page, search: string) {
  const users = await getJson<any>(
    page,
    `/identity/users?filter=${encodeURIComponent(search)}&skipCount=0&maxResultCount=10`
  );
  const user = asItems<any>(users).find((item) => {
    const normalizedSearch = search.toLowerCase();
    return (
      String(item.userName || '').toLowerCase() === normalizedSearch ||
      String(item.email || '').toLowerCase() === normalizedSearch ||
      String(item.email || '')
        .toLowerCase()
        .includes(normalizedSearch) ||
      String(item.userName || '')
        .toLowerCase()
        .includes(normalizedSearch)
    );
  });

  if (!user?.id) {
    throw new Error(`Unable to resolve identity user for ${search}.`);
  }

  return String(user.id);
}

async function getCurrentAcademicYear(page: Page): Promise<AcademicYear> {
  const body = await getJson<any>(page, '/app/academic-year?Sorting=name');
  const years = asItems<AcademicYearListItem>(body).map(toAcademicYear);
  const todayIso = yyyyMmDd(today);
  const current =
    years.find(
      (year) =>
        year.id &&
        (!year.startDate || year.startDate.slice(0, 10) <= todayIso) &&
        (!year.endDate || year.endDate.slice(0, 10) >= todayIso)
    ) || years.find((year) => year.id);

  if (!current?.id) {
    throw new Error('Unable to resolve current academic year for attendance sync E2E.');
  }
  return current;
}

function toAcademicYear(item: AcademicYearListItem): AcademicYear {
  return item.academicYear || item;
}

function uniqueById(items: any[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const id = String(item?.id || '').toLowerCase();
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function academicSetupItems(boardsBody: any, mediumsBody: any, stagesBody: any) {
  const boards = asItems<any>(boardsBody);
  const nestedMediums = boards.flatMap((board) =>
    asItems<any>(board.educationMediums || board.EducationMediums || []).map((medium) => ({
      ...medium,
      educationBoardId: medium.educationBoardId || board.id,
    }))
  );
  const mediums = uniqueById([...asItems<any>(mediumsBody), ...nestedMediums]);
  const nestedStages = mediums.flatMap((medium) =>
    asItems<any>(medium.educationMediumStages || medium.EducationMediumStages || []).map(
      (stage) => ({
        ...stage,
        educationMediumId: stage.educationMediumId || medium.id,
      })
    )
  );
  const stages = uniqueById([...asItems<any>(stagesBody), ...nestedStages]);

  return { boards, mediums, stages };
}

function boardMatchesAcademicYear(board: any, academicYearId: string) {
  return (
    String(board?.academicYearId || board?.academicYear?.id || '').toLowerCase() ===
    academicYearId.toLowerCase()
  );
}

function boardDisplayName(board: any) {
  if (board?.name) return board.name;
  if (board?.typeName) return board.typeName;
  if (board?.type === 0) return 'CBSE';
  if (board?.type === 1) return 'GSEB';
  return String(board?.type ?? board?.id);
}

function toStageSelection(board: any, medium: any, stage: any): StageSelection {
  return {
    boardId: board.id,
    boardName: boardDisplayName(board),
    mediumId: medium.id,
    mediumName: medium.name || medium.id,
    stageId: stage.id,
    stageName: stage.name || stage.id,
  };
}

function firstStageForAcademicYear(
  boards: any[],
  mediums: any[],
  stages: any[],
  academicYearId: string
): StageSelection | null {
  const boardsById = new Map(boards.map((board) => [String(board.id).toLowerCase(), board]));
  const mediumsById = new Map(mediums.map((medium) => [String(medium.id).toLowerCase(), medium]));
  const stageSelection = stages
    .map((stage) => {
      const medium = mediumsById.get(String(stage.educationMediumId).toLowerCase());
      const board = medium ? boardsById.get(String(medium.educationBoardId).toLowerCase()) : null;
      return { board, medium, stage };
    })
    .find(
      ({ board, medium, stage }) =>
        boardMatchesAcademicYear(board, academicYearId) && medium?.id && stage?.id
    );

  if (stageSelection) {
    const { board, medium, stage } = stageSelection;
    return toStageSelection(board, medium, stage);
  }

  return null;
}

async function postJson<T = any>(page: Page, path: string, payload: any, label: string) {
  return jsonFrom<T>(
    await employeeApiRequest(page, path, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    label
  );
}

async function ensureAcademicHierarchyForCurrentYear(
  page: Page,
  academicYear: AcademicYear,
  boards: any[],
  mediums: any[],
  stages: any[]
): Promise<StageSelection> {
  let board = boards.find((candidate) => boardMatchesAcademicYear(candidate, academicYear.id));
  if (!board) {
    board = await postJson(
      page,
      '/app/education-board',
      {
        type: 0,
        academicYearId: academicYear.id,
      },
      'create E2E education board'
    );
  }

  let medium = mediums.find(
    (candidate) =>
      String(candidate.educationBoardId).toLowerCase() === String(board.id).toLowerCase()
  );
  if (!medium) {
    medium = await postJson(
      page,
      '/app/education-medium',
      {
        name: `E2E English ${Date.now().toString(36)}`,
        educationBoardId: board.id,
      },
      'create E2E education medium'
    );
  }

  let stage = stages.find(
    (candidate) =>
      String(candidate.educationMediumId).toLowerCase() === String(medium.id).toLowerCase()
  );
  if (!stage) {
    stage = await postJson(
      page,
      '/app/education-medium-stage',
      {
        name: `E2E Stage ${Date.now().toString(36)}`,
        educationMediumId: medium.id,
        bannerPicture: null,
      },
      'create E2E education medium stage'
    );
  }

  return toStageSelection(board, medium, stage);
}

function firstStageFromScopeHierarchy(body: any, academicYearId: string): StageSelection | null {
  const years = asItems<any>(body.accessibleHierarchy || body.AccessibleHierarchy || []);
  const stages = years
    .filter(
      (year) =>
        String(year.academicYearId || year.AcademicYearId).toLowerCase() ===
        academicYearId.toLowerCase()
    )
    .flatMap((year) =>
      asItems<any>(year.boards || year.Boards || []).flatMap((board) =>
        asItems<any>(board.mediums || board.Mediums || []).flatMap((medium) =>
          asItems<any>(medium.mediumStages || medium.MediumStages || []).map((stage) => ({
            boardId: board.boardId || board.BoardId,
            boardName: board.boardName || board.BoardName,
            mediumId: medium.mediumId || medium.MediumId,
            mediumName: medium.mediumName || medium.MediumName,
            stageId: stage.mediumStageId || stage.MediumStageId,
            stageName: stage.mediumStageName || stage.MediumStageName,
          }))
        )
      )
    )
    .filter((stage) => stage.boardId && stage.mediumId && stage.stageId);

  return stages[0] || null;
}

async function resolveAcademicPermissionStage(
  page: Page,
  userId: string,
  academicYear: AcademicYear
) {
  const hierarchyParams = new URLSearchParams({
    userId,
    academicYearId: academicYear.id,
  });
  const hierarchy = await getJson<any>(
    page,
    `/app/user-scope/user-scope-hierarchy?${hierarchyParams.toString()}`
  );
  const hierarchyStage = firstStageFromScopeHierarchy(hierarchy, academicYear.id);
  if (hierarchyStage) {
    return hierarchyStage;
  }

  const [boardsBody, mediumsBody, stagesBody] = await Promise.all([
    getJson<any>(page, '/app/education-board'),
    getJson<any>(page, '/app/education-medium'),
    getJson<any>(page, '/app/education-medium-stage'),
  ]);
  const { boards, mediums, stages } = academicSetupItems(boardsBody, mediumsBody, stagesBody);
  const currentStage = firstStageForAcademicYear(boards, mediums, stages, academicYear.id);
  if (currentStage) {
    return currentStage;
  }

  return ensureAcademicHierarchyForCurrentYear(page, academicYear, boards, mediums, stages);
}

async function ensureDefaultLeavePolicy(page: Page, academicYear: AcademicYear) {
  const academicYearParam = encodeURIComponent(academicYear.id);
  const policies = await getJson<any>(
    page,
    `/leave-policies?academicYearId=${academicYearParam}&page=1&pageSize=500`
  );
  const policyItems = asItems<any>(policies);
  const activeDefaults = policyItems.filter(
    (policy) => String(policy.status || '').toLowerCase() === 'active' && policy.isDefault
  );

  if (activeDefaults.length === 1) {
    return activeDefaults[0];
  }

  const reusablePolicy = policyItems.find(
    (policy) => String(policy.status || '').toLowerCase() === 'active'
  );

  if (reusablePolicy?.id) {
    return jsonFrom(
      await employeeApiRequest(page, `/leave-policies/${reusablePolicy.id}/set-default`, {
        method: 'PATCH',
      }),
      'set default leave policy'
    );
  }

  return jsonFrom(
    await employeeApiRequest(page, `/leave-policies?academicYearId=${academicYearParam}`, {
      method: 'POST',
      body: JSON.stringify({
        policyTitle: `E2E Default Leave ${academicYear.name || academicYear.id}`,
        status: 'Active',
        effectiveFrom: (academicYear.startDate || yyyyMmDd(today)).slice(0, 10),
        effectiveTo: academicYear.endDate ? academicYear.endDate.slice(0, 10) : null,
        description: 'Created by Academic Permission attendance sync E2E setup',
        isDefault: true,
        rules: [
          {
            paidType: 'Paid',
            entitlementMode: 'Limited',
            accrualPolicyType: 'Yearly',
            leaveCount: 12,
            carryForward: false,
            encashmentAllowed: false,
            requiresApproval: true,
            minNoticeDays: 0,
            maxDaysPerRequest: 30,
            allowHalfDay: true,
            allowNegativeBalance: false,
            isActive: true,
          },
          {
            paidType: 'Unpaid',
            entitlementMode: 'Unlimited',
            accrualPolicyType: 'Yearly',
            leaveCount: null,
            carryForward: false,
            encashmentAllowed: false,
            requiresApproval: true,
            minNoticeDays: 0,
            maxDaysPerRequest: 30,
            allowHalfDay: true,
            allowNegativeBalance: true,
            isActive: true,
          },
        ],
      }),
    }),
    'create default leave policy'
  );
}

async function getTakeAttendanceDay(
  page: Page,
  attendanceDate: string,
  search?: string
): Promise<AttendanceDay> {
  const params = new URLSearchParams({
    attendanceDate,
    skipCount: '0',
    maxResultCount: '50',
  });
  if (search) params.set('search', search);
  return getJson<AttendanceDay>(page, `/hr/attendance/take-attendance/day?${params.toString()}`);
}

function findAttendanceRow(day: AttendanceDay, employeeId: string) {
  return (day.items || []).find(
    (item) => String(item.employeeId).toLowerCase() === employeeId.toLowerCase()
  );
}

async function collectAttendanceDates(page: Page, academicYear: AcademicYear) {
  const yearStart =
    parseDateOnly(academicYear.startDate) || addDays(today, -attendanceScanWindowDays);
  const yearEnd = parseDateOnly(academicYear.endDate) || today;
  const scanEnd = minDate(today, yearEnd);
  const scanStart = maxDate(yearStart, addDays(scanEnd, -attendanceScanWindowDays));
  const selected: string[] = [];
  const skipped: string[] = [];

  for (
    let cursor = new Date(scanEnd.getFullYear(), scanEnd.getMonth(), scanEnd.getDate());
    cursor >= scanStart && selected.length < attendanceDaysToSave;
    cursor = addDays(cursor, -1)
  ) {
    const attendanceDate = yyyyMmDd(cursor);
    try {
      const day = await getTakeAttendanceDay(page, attendanceDate);
      if (day.isHoliday) {
        skipped.push(`${attendanceDate}: holiday${day.holidayName ? ` (${day.holidayName})` : ''}`);
        continue;
      }
      if (day.isDayLocked) {
        skipped.push(`${attendanceDate}: attendance day is locked`);
        continue;
      }
      selected.push(attendanceDate);
    } catch (error) {
      skipped.push(`${attendanceDate}: ${(error as Error).message}`);
    }
  }

  if (selected.length < attendanceDaysToSave) {
    throw new Error(
      `Expected ${attendanceDaysToSave} eligible attendance days but found ${selected.length}. Skipped:\n${skipped
        .slice(0, 30)
        .join('\n')}`
    );
  }

  return selected.reverse();
}

function toClock(value: string | null | undefined, fallback: string) {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value || '');
  if (!match) return fallback;
  return `${match[1]}:${match[2]}:${match[3] || '00'}`;
}

function isPresentStatus(status: unknown) {
  const normalized = String(status).toLowerCase();
  return status === 1 || normalized === '1' || normalized === 'present';
}

function statusLabel(status: unknown) {
  return typeof status === 'string' ? status : JSON.stringify(status);
}

async function assignAcademicPermission(
  page: Page,
  academicYearId: string,
  userId: string,
  stage: StageSelection
) {
  const payload = {
    academicYearId,
    userIds: [userId],
    scopes: [
      {
        educationBoardId: stage.boardId,
        educationMediumId: stage.mediumId,
        educationMediumStageId: stage.stageId,
      },
    ],
    clearExisting: false,
    description: `E2E Academic Permission attendance sync ${Date.now()}`,
  };
  const response = await employeeApiRequest(page, '/app/user-scope/bulk-assign', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const result = await jsonFrom<any>(response, 'save Academic Permission');

  expect(result.affectedUserIds || [], 'bulk assign affected user').toContain(userId);
  return { payload, result };
}

async function waitForDerivedOrganization(page: Page, employeeId: string, stageId: string) {
  await expect
    .poll(
      async () => {
        const info = await getJson<any>(page, `/employees/${employeeId}/personal-info`);
        const organizationIds = info.organizationIds || info.OrganizationIds || [];
        const organizations = info.organizations || info.Organizations || [];
        const organizationNames = info.organizationNames || info.OrganizationNames || [];
        const hasStage = organizationIds
          .map((id: unknown) => String(id).toLowerCase())
          .includes(stageId.toLowerCase());
        return hasStage && Array.isArray(organizations) && Array.isArray(organizationNames);
      },
      { timeout: 20_000, message: 'personal-info should expose derived Academic Permission orgs' }
    )
    .toBe(true);
}

async function savePresentAttendanceForDates(
  page: Page,
  employeeId: string,
  employeeSearch: string,
  attendanceDates: string[]
) {
  const savedDates: string[] = [];
  const failures: string[] = [];

  for (let index = 0; index < attendanceDates.length; index += 1) {
    const attendanceDate = attendanceDates[index];
    const day = await getTakeAttendanceDay(page, attendanceDate, employeeSearch);
    const row = findAttendanceRow(day, employeeId);
    if (!row) {
      failures.push(`${attendanceDate}: staff was not returned by Mark Attendance`);
      continue;
    }

    const inTime = toClock(row.shiftStartTime, '09:00:00');
    const outTime = toClock(row.shiftEndTime, '17:00:00');
    const saveResponse = await employeeApiRequest(page, '/hr/attendance/take-attendance/day/save', {
      method: 'POST',
      body: JSON.stringify({
        attendanceDate,
        entries: [
          {
            employeeId,
            statusWire: 'PRESENT',
            inTime,
            outTime,
            remarks: 'E2E Academic Permission attendance sync',
          },
        ],
      }),
    });

    if (!saveResponse.ok()) {
      failures.push(
        `${attendanceDate}: save failed ${saveResponse.status()} ${await saveResponse.text()}`
      );
      continue;
    }

    const saveResult = await saveResponse.json();
    if (Number(saveResult.upsertedCount ?? 0) < 1) {
      failures.push(
        `${attendanceDate}: save did not upsert any rows ${JSON.stringify(saveResult)}`
      );
      continue;
    }

    const refreshedDay = await getTakeAttendanceDay(page, attendanceDate, employeeSearch);
    const refreshedRow = findAttendanceRow(refreshedDay, employeeId);
    if (!isPresentStatus(refreshedRow?.status)) {
      failures.push(
        `${attendanceDate}: expected Present after save, got ${statusLabel(refreshedRow?.status)}`
      );
      continue;
    }

    savedDates.push(attendanceDate);
  }

  expect(
    savedDates,
    `Expected ${attendanceDaysToSave} saved Present days. Failures:\n${failures.join('\n')}`
  ).toHaveLength(attendanceDaysToSave);
  return savedDates;
}

async function verifyGroupedAttendanceRegister(
  page: Page,
  employeeId: string,
  academicYearId: string,
  savedDates: string[]
) {
  const startDate = savedDates[0];
  const endDate = savedDates[savedDates.length - 1];
  const params = new URLSearchParams({
    startDate,
    endDate,
    academicYearId,
    employeeId,
    payrollState: 'All',
    exceptionFilter: 'All',
    skipCount: '0',
    maxResultCount: '50',
  });
  const grouped = await getJson<any>(page, `/hr/attendance/register/grouped?${params.toString()}`);
  const group = asItems<any>(grouped).find(
    (item) => String(item.employeeId).toLowerCase() === employeeId.toLowerCase()
  );

  expect(grouped.totalCount, 'grouped register total count').toBeGreaterThanOrEqual(1);
  expect(group, `grouped register row for staff ${employeeId}`).toBeTruthy();
  expect(Number(group.present ?? group.Present ?? 0), 'grouped register Present count').toBe(
    savedDates.length
  );
  expect(
    Number(group.recordedDays ?? group.RecordedDays ?? 0),
    'grouped register recorded days'
  ).toBeGreaterThanOrEqual(savedDates.length);

  const savedDateSet = new Set(savedDates);
  const presentSavedDays = (group.days || group.Days || []).filter(
    (day: any) =>
      savedDateSet.has(String(day.attendanceDate || day.AttendanceDate).slice(0, 10)) &&
      isPresentStatus(day.status ?? day.Status)
  );
  expect(presentSavedDays, 'saved days are Present in grouped register').toHaveLength(
    savedDates.length
  );
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
            description: 'E2E fixed earning component for attendance sync',
            earningType: 'Fixed',
            calculationType: 'Amount',
            amount: grossEarningAmount,
            percentage: 0,
            selectedEarningComponentId: null,
            visibleInPayslip: true,
          }
        : {
            deductionComponentName: name,
            description: 'E2E fixed deduction component for attendance sync',
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

async function findPayrollPreviewRow(page: Page, month: string, employeeId: string) {
  for (let pageIndex = 0; pageIndex < 10; pageIndex += 1) {
    const preview = await getJson<any>(
      page,
      `/payroll/run?month=${encodeURIComponent(month)}&page=${pageIndex}&pageSize=100&forceRefresh=true`
    );
    const row = asItems<any>(preview).find(
      (item) => String(item.employeeId).toLowerCase() === employeeId.toLowerCase()
    );
    if (row) return row;
    if (!preview.totalPages || pageIndex + 1 >= Number(preview.totalPages)) break;
  }

  return null;
}

async function verifyAttendanceRegisterUiFilters(page: Page, employeeCode: string) {
  const codePattern = new RegExp(escapeRegExp(employeeCode));
  await page.goto(`${frontendBaseUrl()}/hr/attendance-tracking`, {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.getByText('Register view')).toBeVisible({ timeout: 60_000 });

  const searchInput = page.getByPlaceholder('Search...');
  await searchInput.fill(employeeCode);
  await expect(
    page.getByText(codePattern).first(),
    'register search finds staff code'
  ).toBeVisible({
    timeout: 30_000,
  });

  await searchInput.fill('');
  const employeeInputId = await page
    .locator('label', { hasText: /^Staff$/ })
    .first()
    .getAttribute('for');
  expect(employeeInputId, 'attendance register staff input id').toBeTruthy();
  const employeeInput = page.locator(`input[id="${employeeInputId}"]`);
  await employeeInput.click();
  await employeeInput.fill(employeeCode);
  const option = page.getByRole('option', { name: codePattern }).first();
  await expect(option, 'staff filter option finds staff identifier').toBeVisible({
    timeout: 30_000,
  });
  await option.click();
  await expect(
    page.getByText(codePattern).first(),
    'register staff filter finds selected staff'
  ).toBeVisible({ timeout: 30_000 });
}

test.describe('HR Academic Permission attendance sync', () => {
  test.skip(
    !syncE2eEnabled,
    'Set E2E_HR_ATTENDANCE_SYNC=1 to run the local DDVS Academic Permission attendance sync regression.'
  );

  test('creates staff, syncs Academic Permission, marks attendance, verifies register and payroll preview', async ({
    page,
    browser,
  }) => {
    test.setTimeout(360_000);

    await withHrPayrollQaMutex(async () => {
      assertLocalDdvsOnly();
      await page.goto('/dashboard/', { waitUntil: 'domcontentloaded', timeout: 90_000 });
      await dismissAcademicYearTour(page);
      await expect(page, 'dashboard should stay authenticated').not.toHaveURL(/\/login|\/auth/i);

      const academicYear = await getCurrentAcademicYear(page);
      await ensureDefaultLeavePolicy(page, academicYear);
      const scopedHrUserId = await findIdentityUserId(page, scopedHrEmail);
      const stage = await resolveAcademicPermissionStage(page, scopedHrUserId, academicYear);
      const scopedHrPermission = await assignAcademicPermission(
        page,
        academicYear.id,
        scopedHrUserId,
        stage
      );
      expect(
        scopedHrPermission.payload.scopes?.map((scope: any) => scope.educationMediumStageId),
        'scoped HR Academic Permission stage payload'
      ).toEqual([stage.stageId]);

      const hrContext = await browser.newContext({
        ignoreHTTPSErrors: true,
        storageState: { cookies: [], origins: [] },
      });
      const hrPage = await hrContext.newPage();

      try {
        await loginLocalUser(hrPage, scopedHrEmail, scopedHrPassword);
        await hrPage.goto(`${frontendBaseUrl()}/dashboard/`, {
          waitUntil: 'domcontentloaded',
          timeout: 90_000,
        });
        await dismissAcademicYearTour(hrPage);

        const attendanceDates = await collectAttendanceDates(hrPage, academicYear);
        const dateOfJoining = attendanceDates[0];
        const fixture = createEmployeeFixture('E2E AP Attendance');

        const createRequestPromise = page.waitForRequest(
          (request) =>
            request.url().includes('/api/employees/personal-info') && request.method() === 'POST'
        );
        const employee = await createEmployeeFromExistingDefaults(page, fixture, {
          dateOfJoining,
        });
        const createRequest = await createRequestPromise;
        const createBody = createRequest.postData() || '';
        expect(
          createBody,
          'personal-info create payload must not capture organizationIds'
        ).not.toContain('organizationIds');

        const employeeId = String(employee.id);
        const employeeCode = String(employee.employeeCode || employee.employeeIdentifier || '');
        const employeeName = String(
          employee.fullName || `${fixture.firstName} ${fixture.lastName}`
        );
        const personalInfoBeforePermission = await getJson<any>(
          page,
          `/employees/${employeeId}/personal-info`
        );
        const employeeUserId = String(employee.userId || personalInfoBeforePermission.userId || '');
        expect(employeeId, 'created staff id').toBeTruthy();
        expect(employeeCode, 'created staff code').toBeTruthy();
        expect(employeeUserId, 'created staff linked user id').toBeTruthy();
        expect(
          personalInfoBeforePermission.organizationIds || [],
          'new personal-info organization projection before Academic Permission'
        ).toHaveLength(0);

        const beforePermissionDay = await getTakeAttendanceDay(
          hrPage,
          attendanceDates[0],
          employeeCode
        );
        expect(
          findAttendanceRow(beforePermissionDay, employeeId),
          'staff should not be eligible for scoped Mark Attendance before Academic Permission'
        ).toBeFalsy();

        const beforeRegisterParams = new URLSearchParams({
          startDate: attendanceDates[0],
          endDate: attendanceDates[attendanceDates.length - 1],
          academicYearId: academicYear.id,
          employeeId,
          payrollState: 'All',
          exceptionFilter: 'All',
          skipCount: '0',
          maxResultCount: '50',
        });
        const beforeRegister = await getJson<any>(
          hrPage,
          `/hr/attendance/register/grouped?${beforeRegisterParams.toString()}`
        );
        expect(
          asItems(beforeRegister),
          'staff should not be in scoped grouped register before Academic Permission'
        ).toHaveLength(0);

        const academicPermission = await assignAcademicPermission(
          page,
          academicYear.id,
          employeeUserId,
          stage
        );
        expect(
          academicPermission.payload.scopes?.map((scope: any) => scope.educationMediumStageId),
          'Academic Permission stage payload'
        ).toEqual([stage.stageId]);

        await waitForDerivedOrganization(page, employeeId, stage.stageId);

        await hrPage.goto(`${frontendBaseUrl()}/hr/manual-attendance`, {
          waitUntil: 'domcontentloaded',
        });
        await expect(hrPage.getByRole('heading', { name: /Mark Attendance/i })).toBeVisible({
          timeout: 60_000,
        });

        const afterPermissionDay = await getTakeAttendanceDay(
          hrPage,
          attendanceDates[0],
          employeeCode
        );
        const afterPermissionRow = findAttendanceRow(afterPermissionDay, employeeId);
        expect(
          afterPermissionRow,
          'staff appears in scoped Mark Attendance after Academic Permission'
        ).toBeTruthy();
        expect(afterPermissionRow?.captureMode, 'Mark Attendance capture mode').toBeTruthy();
        expect(
          afterPermissionRow?.shiftStartTime || afterPermissionRow?.shiftEndTime,
          'Mark Attendance shift fields'
        ).toBeTruthy();

        const savedDates = await savePresentAttendanceForDates(
          hrPage,
          employeeId,
          employeeCode,
          attendanceDates
        );
        await verifyGroupedAttendanceRegister(hrPage, employeeId, academicYear.id, savedDates);
        await verifyAttendanceRegisterUiFilters(hrPage, employeeCode);

        await setEmployeeSalaryStructure(page, employeeId, employeeName);
        const month = payrollMonth(parseDateOnly(savedDates[savedDates.length - 1]) || today);
        const payrollRow = await findPayrollPreviewRow(page, month, employeeId);
        expect(payrollRow, `payroll preview row for ${employeeCode}`).toBeTruthy();
        expect(
          Number(payrollRow.grossSalary ?? payrollRow.totalEarnings ?? 0),
          'preview gross'
        ).toBeGreaterThan(0);
        expect(
          Number(payrollRow.netPay ?? payrollRow.netSalary ?? 0),
          'preview net'
        ).toBeGreaterThan(0);
      } finally {
        await hrContext.close();
      }
    });
  });
});
