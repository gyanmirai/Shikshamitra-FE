/* eslint-disable import/no-extraneous-dependencies, no-restricted-syntax */
import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page, type Route, type Locator } from '@playwright/test';

const examId = '10000000-0000-0000-0000-000000000001';
const planId = '20000000-0000-0000-0000-000000000001';
const sessionKey = '2026-09-10|09:00:00|12:00:00';
const divisionAId = '60000000-0000-0000-0000-000000000001';
const divisionBId = '60000000-0000-0000-0000-000000000002';
const roomId = '70000000-0000-0000-0000-000000000001';
const externalStudentId = '83000000-0000-0000-0000-000000000001';
const twoDivisionStudents = [
  {
    studentId: '81000000-0000-0000-0000-000000000001',
    studentName: 'Asha North',
    rollNo: 1,
    divisionId: divisionAId,
    divisionName: 'A',
  },
  {
    studentId: '81000000-0000-0000-0000-000000000002',
    studentName: 'Aarav North',
    rollNo: 2,
    divisionId: divisionAId,
    divisionName: 'A',
  },
  {
    studentId: '81000000-0000-0000-0000-000000000003',
    studentName: 'Avni North',
    rollNo: 3,
    divisionId: divisionAId,
    divisionName: 'A',
  },
  {
    studentId: '82000000-0000-0000-0000-000000000001',
    studentName: 'Bilal South',
    rollNo: 11,
    divisionId: divisionBId,
    divisionName: 'B',
  },
  {
    studentId: '82000000-0000-0000-0000-000000000002',
    studentName: 'Bina South',
    rollNo: 12,
    divisionId: divisionBId,
    divisionName: 'B',
  },
  {
    studentId: '82000000-0000-0000-0000-000000000003',
    studentName: 'Bhavya South',
    rollNo: 13,
    divisionId: divisionBId,
    divisionName: 'B',
  },
];

function workspace(
  prepared: boolean,
  applied: boolean,
  published = false,
  includesAllSubjects = false
) {
  const subject = {
    examSubjectId: '40000000-0000-0000-0000-000000000001',
    subjectId: '50000000-0000-0000-0000-000000000001',
    subjectName: 'Mathematics',
    examDate: '2026-09-10',
    startTime: '09:00:00',
    endTime: '12:00:00',
  };
  const scienceSubject = {
    examSubjectId: '40000000-0000-0000-0000-000000000002',
    subjectId: '50000000-0000-0000-0000-000000000002',
    subjectName: 'Science',
    examDate: '2026-09-11',
    startTime: '09:00:00',
    endTime: '12:00:00',
  };
  const room = {
    roomId: '70000000-0000-0000-0000-000000000001',
    roomName: 'Room 101',
    capacity: 32,
    usableCapacity: 30,
    disabledSeats: 2,
  };
  return {
    examId,
    examName: 'Term 1 Examination',
    standardId: '30000000-0000-0000-0000-000000000001',
    standardName: 'Standard 8',
    selectedSeatingPlanId: prepared ? planId : null,
    version: prepared ? 'version-1' : null,
    availableSubjects: [subject, scienceSubject],
    plans: prepared
      ? [
          {
            seatingPlanId: planId,
            name: 'Mathematics',
            scopeType: 2,
            status: published ? 5 : applied ? 3 : 0,
            isLocked: published,
            hasCompleteSchedule: true,
            canConfigure: !published,
            scheduleCount: includesAllSubjects ? 2 : 1,
            subjects: includesAllSubjects ? [subject, scienceSubject] : [subject],
            divisions: [{ id: '60000000-0000-0000-0000-000000000001', name: 'A' }],
            availableRooms: [room],
            selectedRoomIds: ['70000000-0000-0000-0000-000000000001'],
            totalStudents: 24,
            allocatedStudents: applied ? 24 : 0,
            pendingStudents: applied ? 0 : 24,
            roomsUsed: applied ? 1 : 0,
            usableCapacity: 30,
            emptySeats: applied ? 6 : 30,
            utilization: applied ? 80 : 0,
            issues: [],
          },
        ]
      : [],
    readiness: {
      examId,
      isPublished: published,
      isReadyToPublish: prepared && applied && includesAllSubjects,
      canResetDraft: prepared && !published,
      totalSubjectCount: 2,
      plannedSubjectCount: prepared ? (includesAllSubjects ? 2 : 1) : 0,
      totalPlanCount: prepared ? 1 : 0,
      readyPlanCount: prepared && applied ? 1 : 0,
      totalStudentSeats: prepared ? 24 : 0,
      allocatedStudentSeats: applied ? 24 : 0,
      publishedAt: published ? '2026-09-01T10:00:00Z' : null,
      publishedByUserId: published ? '90000000-0000-0000-0000-000000000001' : null,
      publicationVersion: published ? 'publication-version-1' : null,
      blockers:
        prepared && !includesAllSubjects
          ? [
              {
                code: 'UNPLANNED_SUBJECTS',
                message: 'Assign every subject before publishing. Still unplanned: Science.',
                examSubjectIds: [scienceSubject.examSubjectId],
              },
            ]
          : [],
      warnings: [],
    },
    sessions: [
      {
        sessionKey,
        examDate: '2026-09-10',
        startTime: '09:00:00',
        endTime: '12:00:00',
        hasCompleteSchedule: true,
        subjects: [subject],
        divisions: [{ id: '60000000-0000-0000-0000-000000000001', name: 'A' }],
        availableRooms: [room],
        selectedRoomIds: prepared ? ['70000000-0000-0000-0000-000000000001'] : [],
        seatingPlanId: prepared ? planId : null,
        seatingPlanName: prepared ? '10 Sep · 09:00–12:00' : null,
        status: published ? 5 : applied ? 3 : 0,
        isLocked: published,
        requiresMigration: false,
        canPrepare: true,
        totalStudents: 24,
        allocatedStudents: applied ? 24 : 0,
        pendingStudents: applied ? 0 : 24,
        roomsUsed: applied ? 1 : 0,
        usableCapacity: prepared ? 30 : 0,
        emptySeats: applied ? 6 : 0,
        utilization: applied ? 80 : 0,
        issues: [],
      },
    ],
  };
}

function twoDivisionWorkspace(saved = false) {
  const value = workspace(true, saved);
  const divisions = [
    { id: divisionAId, name: 'A' },
    { id: divisionBId, name: 'B' },
  ];
  const room = {
    roomId,
    roomName: 'Room 101',
    capacity: 12,
    usableCapacity: 9,
    disabledSeats: 2,
  };
  const plan = value.plans[0];
  plan.divisions = divisions;
  plan.availableRooms = [room];
  plan.selectedRoomIds = [roomId];
  plan.totalStudents = 6;
  plan.allocatedStudents = saved ? 6 : 2;
  plan.pendingStudents = saved ? 0 : 4;
  plan.roomsUsed = 1;
  plan.usableCapacity = 9;
  plan.emptySeats = saved ? 3 : 7;
  plan.utilization = saved ? 60 : 20;
  value.sessions[0].divisions = divisions;
  value.sessions[0].availableRooms = [room];
  value.sessions[0].selectedRoomIds = [roomId];
  value.sessions[0].totalStudents = 6;
  value.sessions[0].allocatedStudents = saved ? 6 : 2;
  value.sessions[0].pendingStudents = saved ? 0 : 4;
  value.sessions[0].roomsUsed = 1;
  value.sessions[0].usableCapacity = 9;
  value.sessions[0].emptySeats = saved ? 3 : 7;
  value.sessions[0].utilization = saved ? 60 : 20;
  return value;
}

async function mockGuidedSeating(page: Page, initialPublished = false, initialApplied = false) {
  let prepared = initialPublished || initialApplied;
  let applied = initialPublished || initialApplied;
  let published = initialPublished;
  let includesAllSubjects = initialPublished;
  const state: {
    autoAllocateRequests: number;
    manualSaveBody?: { rooms?: Array<{ roomId: string; students: unknown[] }> };
  } = { autoAllocateRequests: 0 };
  await page.route('**/api/permission-management/permissions**', async (route) => {
    const request = route.request();
    const origin = request.headers().origin || 'http://localhost:3000';
    const headers = {
      'access-control-allow-origin': origin,
      'access-control-allow-headers': 'authorization,content-type',
      'access-control-allow-methods': 'GET,OPTIONS',
    };
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers });
      return;
    }
    await route.fulfill({
      headers,
      json: {
        groups: [
          {
            permissions: [
              'ShikshaMitra.Module.Academics',
              'ShikshaMitra.Module.Academics.Examination',
              'Academics.Examination.SeatAllocation',
              'Academics.Examination.SeatAllocation.Add',
              'Academics.Examination.SeatAllocation.AutoAllocate',
              'Academics.Examination.SeatAllocation.Finalize',
              'Academics.Examination.SeatAllocation.Publish',
              'Academics.Examination.SeatAllocation.Delete',
            ].map((name) => ({ name, isGranted: true })),
          },
        ],
      },
    });
  });
  await page.route(
    `**/api/academics/exams/${examId}/seat-allocation/divisions/*/students**`,
    async (route) => {
      await route.fulfill({
        json: {
          items: Array.from({ length: 24 }, (_, index) => ({
            studentId: `80000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
            studentName: `Student ${index + 1}`,
            rollNo: index + 1,
            standardName: 'Standard 8',
            isSeatAllocate: false,
          })),
          totalCount: 24,
          pageNumber: 1,
          pageSize: 1000,
          totalPages: 1,
        },
      });
    }
  );
  await page.route(`**/api/academics/exams/${examId}/seat-layout**`, async (route) => {
    await route.fulfill({
      json: {
        roomId: '70000000-0000-0000-0000-000000000001',
        room: {
          capacity: 32,
          benchesPerRow: 4,
          benchesPerColumn: 8,
          benchCapacity: 1,
          boardPosition: 'front',
          entrancePosition: 'rear',
          disabledSeatNumbersCsv: '31,32',
          reservedSeatNumbersCsv: '',
          accessibleSeatNumbersCsv: '1',
          aisleAfterColumnsCsv: '4',
        },
        items: applied
          ? Array.from({ length: 24 }, (_, index) => ({
              studentId: `80000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
              studentName: `Student ${index + 1}`,
              standardName: 'Standard 8',
              rollNo: index + 1,
              seatNumber: index + 1,
            }))
          : [],
      },
    });
  });
  await page.route(`**/api/academics/exams/${examId}/seating-plan**`, async (route) => {
    const request = route.request();
    const requestUrl = new URL(request.url());
    const path = requestUrl.pathname;
    if (path.endsWith('/v2/workspace')) {
      if (prepared) {
        await new Promise((resolve) => {
          setTimeout(resolve, 300);
        });
      }
      await route.fulfill({
        json: workspace(prepared, applied, published, includesAllSubjects),
      });
    } else if (path.endsWith('/v2/plans')) {
      prepared = true;
      includesAllSubjects = request.postDataJSON().examSubjectIds.length === 2;
      await route.fulfill({ json: workspace(true, false, false, includesAllSubjects) });
    } else if (path.endsWith('/auto-allocate')) {
      state.autoAllocateRequests += 1;
      await route.fulfill({
        json: {
          assignments: Array.from({ length: 24 }, (_, index) => ({
            studentId: `80000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
            studentName: `Student ${index + 1}`,
            rollNo: index + 1,
            divisionName: 'A',
            roomId: '70000000-0000-0000-0000-000000000001',
            roomName: 'Room 101',
            seatNumber: index + 1,
          })),
          unallocatedStudentIds: [],
          totalStudents: 24,
          roomsUsed: 1,
          emptySeats: 6,
          utilizationPercent: 80,
        },
      });
    } else if (path.endsWith('/v2/apply-preview')) {
      applied = true;
      await route.fulfill({ json: { seatingPlanId: planId, version: 'version-3' } });
    } else if (path.endsWith('/bulk-save')) {
      applied = true;
      state.manualSaveBody = request.postDataJSON();
      await route.fulfill({ json: { seatingPlanId: planId, version: 'version-3' } });
    } else if (path.endsWith('/validate')) {
      await route.fulfill({ json: { isValid: true, blockers: [], warnings: [] } });
    } else if (path.endsWith('/v2/validate-examination')) {
      await route.fulfill({
        json: workspace(prepared, applied, published, includesAllSubjects).readiness,
      });
    } else if (path.endsWith('/v2/reset-draft')) {
      prepared = false;
      applied = false;
      includesAllSubjects = false;
      await route.fulfill({ json: workspace(false, false) });
    } else if (request.method() === 'DELETE' && path.includes('/seating-plan/scopes/')) {
      prepared = false;
      applied = false;
      includesAllSubjects = false;
      await route.fulfill({ status: 204 });
    } else if (path.endsWith('/v2/publish')) {
      published = true;
      await route.fulfill({ json: workspace(true, true, true, includesAllSubjects) });
    } else {
      await route.fulfill({
        json: {
          seatingPlanId: planId,
          roomIds: ['70000000-0000-0000-0000-000000000001'],
          version: 'version-2',
        },
      });
    }
  });
  return state;
}

async function mockTwoDivisionManualSeating(page: Page) {
  const state = await mockGuidedSeating(page);
  const assignedInitially = new Map([
    [twoDivisionStudents[0].studentId, 1],
    [twoDivisionStudents[3].studentId, 2],
  ]);
  await page.route(
    `**/api/academics/exams/${examId}/seating-plan/v2/workspace**`,
    async (route) => {
      await route.fulfill({ json: twoDivisionWorkspace(Boolean(state.manualSaveBody)) });
    }
  );
  await page.route(
    `**/api/academics/exams/${examId}/seat-allocation/divisions/*/students**`,
    async (route) => {
      const path = new URL(route.request().url()).pathname;
      const divisionId = path.split('/divisions/')[1]?.split('/')[0];
      const savedIds = new Set(
        state.manualSaveBody?.rooms
          ?.flatMap((room) => room.students)
          .map((row) => (row as { studentId: string }).studentId) ?? []
      );
      const items = twoDivisionStudents
        .filter((student) => student.divisionId === divisionId)
        .map((student) => ({
          studentId: student.studentId,
          studentName: student.studentName,
          rollNo: student.rollNo,
          standardName: 'Standard 8',
          isSeatAllocate:
            savedIds.has(student.studentId) || assignedInitially.has(student.studentId),
        }));
      await route.fulfill({
        json: { items, totalCount: items.length, pageNumber: 1, pageSize: 1000, totalPages: 1 },
      });
    }
  );
  await page.route(`**/api/academics/exams/${examId}/seat-layout**`, async (route) => {
    const savedRows =
      state.manualSaveBody?.rooms
        ?.flatMap((room) => room.students)
        .map((row) => row as { studentId: string; seatNumber: number; benchId?: string | null }) ??
      [];
    const internalItems =
      savedRows.length > 0
        ? savedRows
        : [
            { studentId: twoDivisionStudents[0].studentId, seatNumber: 1 },
            { studentId: twoDivisionStudents[3].studentId, seatNumber: 2 },
          ];
    await route.fulfill({
      json: {
        roomId,
        room: {
          capacity: 12,
          benchesPerRow: 3,
          benchesPerColumn: 4,
          benchCapacity: 1,
          boardPosition: 'front',
          entrancePosition: 'rear',
          disabledSeatNumbersCsv: '11,12',
          reservedSeatNumbersCsv: '10',
          accessibleSeatNumbersCsv: '1',
          aisleAfterColumnsCsv: '2',
        },
        items: [
          ...internalItems,
          {
            studentId: externalStudentId,
            studentName: 'Blocked (Other Exam)',
            seatNumber: 3,
            isExternalExamOccupied: true,
          },
        ],
      },
    });
  });
  return state;
}

async function seriousAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  return results.violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map(({ id, impact, nodes }) => ({
      id,
      impact,
      nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
    }));
}

async function dragWithMouse(page: Page, source: Locator, target: Locator) {
  await source.scrollIntoViewIfNeeded();
  await target.scrollIntoViewIfNeeded();
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();
  const sourceElement = await source.elementHandle();
  if (!sourceBox || !targetBox) throw new Error('The drag source or destination is not visible.');
  if (!sourceElement) throw new Error('The drag source is not attached to the page.');
  const sourcePoint = {
    x: sourceBox.x + sourceBox.width / 2,
    y: sourceBox.y + sourceBox.height / 2,
  };
  let targetPoint = {
    x: targetBox.x + targetBox.width / 2,
    y: targetBox.y + targetBox.height / 2,
  };
  const sourceSeatId = await source.getAttribute('data-seat-id');
  if (sourceSeatId) {
    const hit = await page.evaluate(({ x, y }) => {
      const element = document.elementFromPoint(x, y);
      return {
        tag: element?.tagName,
        ariaLabel: element?.getAttribute('aria-label'),
        text: element?.textContent?.slice(0, 80),
        seatId: element?.closest('[data-seat-id]')?.getAttribute('data-seat-id'),
      };
    }, sourcePoint);
    if (hit.seatId !== sourceSeatId) {
      throw new Error(JSON.stringify({ sourceSeatId, sourcePoint, sourceBox, hit }));
    }
  }
  await page.mouse.move(sourcePoint.x, sourcePoint.y);
  await page.mouse.down();
  await page.mouse.move(sourcePoint.x + 12, sourcePoint.y + 12, { steps: 4 });
  await expect
    .poll(() => sourceElement.evaluate((element) => Number(getComputedStyle(element).opacity)))
    .toBeLessThan(0.8);
  const moveToCurrentTarget = async () => {
    const currentTargetBox = await target.boundingBox();
    if (!currentTargetBox) throw new Error('The drag destination moved outside the viewport.');
    targetPoint = {
      x: currentTargetBox.x + currentTargetBox.width / 2,
      y: currentTargetBox.y + currentTargetBox.height / 2,
    };
    await page.mouse.move(targetPoint.x, targetPoint.y, { steps: 6 });
    await page.waitForTimeout(100);
  };
  await moveToCurrentTarget();
  await moveToCurrentTarget();
  await moveToCurrentTarget();
  await page.mouse.up();
  await expect
    .poll(() => sourceElement.evaluate((element) => Number(getComputedStyle(element).opacity)))
    .toBeGreaterThan(0.7);
  await sourceElement.dispose();
}

async function mockSeatingPlanList(page: Page, items: Array<Record<string, unknown>>) {
  await page.route('**/api/academics/exams/seat-allocation**', async (route) => {
    await route.fulfill({ json: { items, totalCount: items.length } });
  });
}

async function mockAcademicContext(page: Page) {
  const academicYearId = '90000000-0000-0000-0000-000000000001';
  const boardId = '90000000-0000-0000-0000-000000000002';
  const mediumId = '90000000-0000-0000-0000-000000000003';
  const stageId = '90000000-0000-0000-0000-000000000004';
  const standardId = '30000000-0000-0000-0000-000000000001';
  await page.route('**/api/app/academic-year**', async (route) => {
    await route.fulfill({
      json: {
        items: [
          {
            id: academicYearId,
            name: '2026–27',
            startDate: '2026-04-01',
            endDate: '2027-03-31',
          },
        ],
      },
    });
  });
  await page.route('**/api/app/education-board**', async (route) => {
    await route.fulfill({
      json: {
        items: [
          {
            id: boardId,
            name: 'State board',
            academicYearId,
            educationMediums: [
              {
                id: mediumId,
                name: 'English',
                educationBoardId: boardId,
                educationMediumStages: [
                  {
                    id: stageId,
                    name: 'Secondary',
                    educationMediumId: mediumId,
                    standards: [
                      {
                        id: standardId,
                        name: 'Standard 8',
                        educationMediumStageId: stageId,
                        divisions: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });
  await page.route('**/api/app/user-scope/user-scope-hierarchy**', async (route) => {
    await route.fulfill({ json: { isAdmin: true, accessibleHierarchy: [] } });
  });
}

test.describe('Guided examination seating', { tag: ['@module-academic', '@critical'] }, () => {
  test.use({ storageState: 'playwright/.auth/academic-admin.json' });

  test('creates a complete subject plan and publishes the examination once', async ({ page }) => {
    await mockGuidedSeating(page);
    await page.goto(`/academic/seatallocation/${examId}/setup`);

    await expect(page.getByRole('heading', { name: 'Seating plan workspace' })).toBeVisible();
    await expect(page.locator('[data-layout="inline"]')).toBeVisible();
    await expect(page.getByTestId('breadcrumb-back')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Plan every subject, then publish once' })
    ).toBeVisible();
    await expect(page.getByText(/Invalid Date/)).toHaveCount(0);
    await page.getByRole('checkbox', { name: /Mathematics/ }).check();
    await page.getByRole('checkbox', { name: /Science/ }).check();
    await page.getByRole('button', { name: 'Create seating plan' }).click();

    await expect(
      page.getByRole('heading', { name: 'Configure capacity and seating rules' })
    ).toBeVisible();
    const roomCheckbox = page.getByRole('checkbox', { name: /Room 101/ });
    if (!(await roomCheckbox.isChecked())) await roomCheckbox.check();
    await page.getByRole('button', { name: 'Generate seating preview' }).click();

    await expect(page.getByRole('heading', { name: 'Review the proposed seating' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Room 101' })).toBeVisible();
    await page.getByRole('button', { name: 'Apply seating & validate' }).click();
    await expect(
      page.getByText('All mandatory checks passed and no warnings were found.')
    ).toBeVisible();
    await page.getByRole('button', { name: 'Save plan & return to subjects' }).click();
    await expect(
      page.getByRole('heading', { name: 'Plan every subject, then publish once' })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Review examination & publish' }).click();
    await expect(
      page.getByRole('heading', { name: 'Review the complete examination seating' })
    ).toBeVisible();
    await expect(
      page.getByText('This is the only publish action.', { exact: false })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Publish examination seating' }).click();
    await expect(page.getByRole('heading', { name: 'Published seating' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Final room seating' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Room 101 — 24\/30/ })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Seat 1, occupied by Student 1' })).toBeVisible();
    await expect(page.getByText('Published seating is read-only.')).toBeVisible();
    await expect(page.getByText('Publication receipt')).toHaveCount(0);
    await expect(page.getByText('Plan subjects')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Seat 1 actions/ })).toHaveCount(0);
  });

  test('uses the standard inline header and returns to the seating-plan list', async ({ page }) => {
    await mockGuidedSeating(page);
    await mockSeatingPlanList(page, []);
    await page.goto(`/academic/seatallocation/${examId}/setup`);

    await expect(page.locator('[data-layout="inline"]')).toBeVisible();
    await expect(page.getByRole('main').getByRole('link', { name: 'Academics' })).toBeVisible();
    await page.getByTestId('breadcrumb-back').click();
    await expect(page).toHaveURL(/\/academic\/seatallocation$/);
    await expect(page.getByRole('heading', { name: 'Seating plan' })).toBeVisible();
  });

  test('keeps automatic preview updates local and accepts only the latest rooms and rules', async ({
    page,
  }, testInfo) => {
    await mockGuidedSeating(page);
    const secondRoomId = '70000000-0000-0000-0000-000000000002';
    const configuredWorkspace = workspace(true, false);
    configuredWorkspace.plans[0].selectedRoomIds = [];
    configuredWorkspace.plans[0].availableRooms.push({
      ...configuredWorkspace.plans[0].availableRooms[0],
      roomId: secondRoomId,
      roomName: 'Room 102',
    });
    await page.route(
      `**/api/academics/exams/${examId}/seating-plan/v2/workspace**`,
      async (route) => {
        await route.fulfill({ json: configuredWorkspace });
      }
    );
    const previews: Array<{ route: Route; body: { roomIds: string[]; mixDivisions: boolean } }> =
      [];
    await page.route(
      `**/api/academics/exams/${examId}/seating-plan/auto-allocate`,
      async (route) => {
        previews.push({ route, body: route.request().postDataJSON() });
      }
    );
    const layoutRequests: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.pathname.endsWith('/seat-layout')) {
        layoutRequests.push(url.searchParams.get('RoomId') ?? '');
      }
    });
    const fulfillPreview = async (index: number, label: string) => {
      const requestedRoomId = previews[index].body.roomIds[0];
      await previews[index].route.fulfill({
        json: {
          assignments: Array.from({ length: 24 }, (_, studentIndex) => ({
            studentId: `80000000-0000-0000-0000-${String(studentIndex + 1).padStart(12, '0')}`,
            studentName: `${label} ${studentIndex + 1}`,
            rollNo: studentIndex + 1,
            divisionName: 'A',
            roomId: requestedRoomId,
            roomName: requestedRoomId === roomId ? 'Room 101' : 'Room 102',
            seatNumber: studentIndex + 1,
          })),
          unallocatedStudentIds: [],
          totalStudents: 24,
          roomsUsed: 1,
          emptySeats: 6,
          utilizationPercent: 80,
        },
      });
    };

    await page.goto(`/academic/seatallocation/${examId}/setup?step=1&planId=${planId}`);
    const firstRoom = page.getByRole('checkbox', { name: /Room 101/ });
    const secondRoom = page.getByRole('checkbox', { name: /Room 102/ });
    const next = page.getByRole('button', { name: 'Generate seating preview' });
    await firstRoom.check();
    await expect.poll(() => previews.length).toBe(1);
    await expect(page.getByLabel('Generating automatic seating preview')).toBeVisible();
    await expect(page.getByText('Saving...', { exact: true })).toHaveCount(0);
    await expect(next).toBeDisabled();
    await expect.poll(() => layoutRequests).toContain(roomId);

    await firstRoom.uncheck();
    await secondRoom.check();
    await expect.poll(() => previews.length).toBe(2);
    await expect.poll(() => layoutRequests).toContain(secondRoomId);
    await page.getByRole('switch', { name: 'Mix divisions', exact: true }).uncheck();
    await expect.poll(() => previews.length).toBe(3);
    expect(previews[2].body).toMatchObject({ roomIds: [secondRoomId], mixDivisions: false });
    await expect(secondRoom).toBeChecked();
    await expect(firstRoom).not.toBeChecked();
    await expect(page.getByRole('combobox', { name: 'Student order' })).toBeEnabled();
    await expect(next).toBeDisabled();
    const loadingScreenshot = testInfo.outputPath('automatic-preview-section-loading.png');
    await page.screenshot({ path: loadingScreenshot, fullPage: true });
    await testInfo.attach('Automatic preview loading with usable controls', {
      path: loadingScreenshot,
      contentType: 'image/png',
    });

    await fulfillPreview(1, 'Outdated rules');
    await expect(page.getByLabel('Generating automatic seating preview')).toBeVisible();
    await expect(next).toBeDisabled();
    await fulfillPreview(2, 'Latest selection');
    const latestSeat = page.getByRole('img', { name: 'Seat 1, occupied by Latest selection 1' });
    await expect(latestSeat).toBeVisible();
    await expect(next).toBeEnabled();

    await fulfillPreview(0, 'Outdated room');
    await expect(latestSeat).toBeVisible();
    await expect(page.getByRole('img', { name: /occupied by Outdated/ })).toHaveCount(0);
    await expect(next).toBeEnabled();
    expect(previews).toHaveLength(3);
  });

  test('loads the manual classroom editor when switching arrangement mode', async ({ page }) => {
    await mockTwoDivisionManualSeating(page);
    await page.goto(`/academic/seatallocation/${examId}/setup?step=1&planId=${planId}`);
    await page.getByRole('button', { name: 'Manual', exact: true }).click();

    await expect(page.getByText('2 of 6 students assigned')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Seat 1, occupied by Asha North', exact: true })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Seat 4, empty', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Review manual seating' })).toBeDisabled();
  });

  test('reopens a published examination directly in the final room view', async ({ page }) => {
    await mockGuidedSeating(page, true);
    await page.goto(`/academic/seatallocation/${examId}/setup?step=0&planId=${planId}`);

    await expect(page.getByRole('heading', { name: 'Published seating' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Final room seating' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Seat 24, occupied by Student 24' })).toBeVisible();
    await expect(page.getByText('Plan subjects', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Publish exam', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Edit seating/ })).toHaveCount(0);
  });

  test('creates one shared plan when the user selects multiple subjects', async ({ page }) => {
    await mockGuidedSeating(page);
    await page.goto(`/academic/seatallocation/${examId}/setup`);

    await page.getByRole('checkbox', { name: /Mathematics/ }).check();
    await page.getByRole('checkbox', { name: /Science/ }).check();
    await expect(
      page.getByText('Shared plan: these 2 subjects reuse one seating arrangement.')
    ).toBeVisible();

    const createRequest = page.waitForRequest((request) =>
      new URL(request.url()).pathname.endsWith('/seating-plan/v2/plans')
    );
    await page.getByRole('button', { name: 'Create seating plan' }).click();
    expect((await createRequest).postDataJSON()).toMatchObject({
      examSubjectIds: [
        '40000000-0000-0000-0000-000000000001',
        '40000000-0000-0000-0000-000000000002',
      ],
    });
    await page.waitForTimeout(100);
    await expect(page.getByText('Choose a seating plan before selecting rooms.')).toHaveCount(0);
    await expect(page.getByRole('checkbox', { name: /Room 101/ })).toBeVisible();
  });

  test('resets an editable draft so every subject can be planned again', async ({ page }) => {
    await mockGuidedSeating(page);
    await page.goto(`/academic/seatallocation/${examId}/setup`);
    await page.getByRole('checkbox', { name: /Mathematics/ }).check();
    await page.getByRole('button', { name: 'Create seating plan' }).click();
    await expect(
      page.getByRole('heading', { name: 'Configure capacity and seating rules' })
    ).toBeVisible();
    await page
      .locator('button')
      .filter({ hasText: /^Back$/ })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Plan every subject, then publish once' })
    ).toBeVisible();

    await expect(page.getByRole('button', { name: 'Reset all draft seating' })).toBeVisible();
    await page.getByRole('button', { name: 'Reset all draft seating' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Reset draft and start again' }).click();

    await expect(
      page.getByText('No seating plan has been created for this examination yet.')
    ).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Mathematics/ })).toBeEnabled();
    await expect(page.getByRole('checkbox', { name: /Science/ })).toBeEnabled();
  });

  test('deletes an empty plan without leaving a stale plan route', async ({ page }) => {
    await mockGuidedSeating(page);
    await page.goto(`/academic/seatallocation/${examId}/setup`);
    await page.getByRole('checkbox', { name: /Mathematics/ }).check();
    await page.getByRole('button', { name: 'Create seating plan' }).click();
    await expect(
      page.getByRole('heading', { name: 'Configure capacity and seating rules' })
    ).toBeVisible();
    await page
      .locator('button')
      .filter({ hasText: /^Back$/ })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Plan every subject, then publish once' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Delete empty plan' }).click();
    await expect(page.getByRole('dialog', { name: 'Delete empty seating plan?' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete plan' }).click();

    await expect(
      page.getByText('No seating plan has been created for this examination yet.')
    ).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/academic/seatallocation/${examId}/setup\\?step=0$`));
    await expect(page.getByText('The seating workspace could not be loaded.')).toHaveCount(0);
  });

  test('rebuilds every saved assignment after switching a populated plan to automatic', async ({
    page,
  }) => {
    const state = await mockGuidedSeating(page, false, true);
    await page.goto(`/academic/seatallocation/${examId}/setup?step=1&planId=${planId}`);
    await page.getByRole('button', { name: /Manual classroom/ }).click();
    await expect(page.getByText('24 of 24 students assigned')).toBeVisible();

    await page.getByRole('button', { name: /Automatic/ }).click();
    await page.getByRole('button', { name: 'Generate seating preview' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Generate a new automatic arrangement?' })
    ).toBeVisible();
    expect(state.autoAllocateRequests).toBe(0);
    await page.getByRole('button', { name: 'Generate new preview' }).click();

    await expect(page.getByRole('heading', { name: 'Review the proposed seating' })).toBeVisible();
    expect(state.autoAllocateRequests).toBe(1);
    await expect(page.getByText('No seats were proposed.')).toHaveCount(0);
  });

  test('places students on the classroom map and saves the reviewed manual arrangement', async ({
    page,
  }) => {
    const state = await mockGuidedSeating(page);
    await page.goto(`/academic/seatallocation/${examId}/setup`);
    await page.getByRole('checkbox', { name: /Mathematics/ }).check();
    await page.getByRole('button', { name: 'Create seating plan' }).click();

    const roomCheckbox = page.getByRole('checkbox', { name: /Room 101/ });
    if (!(await roomCheckbox.isChecked())) await roomCheckbox.check();
    await page.getByRole('button', { name: /Manual classroom/ }).click();
    await expect(page.getByText('Classroom seating editor')).toBeVisible();

    await page.getByRole('button', { name: 'Seat 2 actions' }).click();
    await page.getByRole('menuitem', { name: 'Reserve Seat' }).click();
    await expect(page.getByRole('button', { name: 'Seat 2, reserved' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Room 101 — 0/29' })).toBeVisible();
    await page.getByRole('button', { name: 'Seat 2 actions' }).click();
    await page.getByRole('menuitem', { name: 'Unreserve Seat' }).click();
    await expect(page.getByRole('button', { name: 'Seat 2, empty' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Room 101 — 0/30' })).toBeVisible();

    const firstStudent = page.getByRole('button', { name: /Student 1/ }).first();
    await firstStudent.click();
    await page.getByRole('button', { name: 'Seat 1, empty' }).click();
    await expect(page.getByRole('button', { name: 'Seat 1, occupied by Student 1' })).toBeVisible();
    await expect(firstStudent).toHaveAttribute('aria-disabled', 'true');

    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(page.getByRole('button', { name: 'Seat 1, empty' })).toBeVisible();
    await page.getByRole('button', { name: 'Redo' }).click();
    await expect(page.getByRole('button', { name: 'Seat 1, occupied by Student 1' })).toBeVisible();
    const secondStudent = page.getByRole('button', { name: /Student 2/ }).first();
    await secondStudent.click();
    await page.getByRole('button', { name: 'Seat 2, empty' }).click();
    await expect(page.getByRole('button', { name: 'Seat 2, occupied by Student 2' })).toBeVisible();
    await page.getByRole('button', { name: 'Auto-arrange all' }).click();
    await expect(page.getByText('24 of 24 students assigned')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Review manual seating' })).toBeEnabled();

    expect(await seriousAccessibilityViolations(page)).toEqual([]);
    await page.getByRole('button', { name: 'Review manual seating' }).click();
    await expect(page.getByRole('heading', { name: 'Review the proposed seating' })).toBeVisible();
    expect(state.autoAllocateRequests).toBe(0);

    await page.getByRole('button', { name: 'Apply seating & validate' }).click();
    await expect(
      page.getByText('All mandatory checks passed and no warnings were found.')
    ).toBeVisible();
    expect(state.manualSaveBody?.rooms).toHaveLength(1);
    expect(state.manualSaveBody?.rooms?.[0]).toMatchObject({
      roomId: '70000000-0000-0000-0000-000000000001',
    });
    expect(state.manualSaveBody?.rooms?.[0].students).toHaveLength(24);
  });

  test('keeps occupied students correct across two divisions and reloads the saved map', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1800, height: 1000 });
    const state = await mockTwoDivisionManualSeating(page);
    await page.goto(`/academic/seatallocation/${examId}/setup?step=1&planId=${planId}`);
    await page.getByRole('button', { name: /Manual classroom/ }).click();
    await expect(page.getByText('Classroom seating editor')).toBeVisible();
    await expect(page.getByText('2 of 6 students assigned')).toBeVisible();

    await page.getByRole('combobox', { name: 'Student order' }).click();
    await page.getByRole('option', { name: 'Alphabetical' }).click();
    await expect(page.getByText('2 of 6 students assigned')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Auto-arrange all' })).toBeEnabled();
    await page.getByRole('combobox', { name: 'Student order' }).click();
    await page.getByRole('option', { name: 'Roll number' }).click();
    await expect(page.getByText('2 of 6 students assigned')).toBeVisible();

    const ashaCard = page.getByRole('button', { name: /^A Asha North/ });
    const bilalCard = page.getByRole('button', { name: /^B Bilal South/ });
    const aaravCard = page.getByRole('button', { name: /^A Aarav North/ });
    await expect(ashaCard).toHaveAttribute('aria-disabled', 'true');
    await expect(ashaCard).toContainText('Roll 1 · A');
    await expect(ashaCard).toContainText('Seat 1');
    await expect(bilalCard).toHaveAttribute('aria-disabled', 'true');
    await expect(bilalCard).toContainText('Roll 11 · B');
    await expect(bilalCard).toContainText('Seat 2');
    await expect(aaravCard).toBeEnabled();
    await expect(
      page.getByRole('button', { name: 'Seat 1, occupied by Asha North' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Seat 2, occupied by Bilal South' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: 'Seat 3, unavailable, occupied by another simultaneous exam plan',
      })
    ).toHaveAttribute('aria-disabled', 'true');

    const ashaBackground = await ashaCard.evaluate(
      (element) => getComputedStyle(element).backgroundColor
    );
    const aaravBackground = await aaravCard.evaluate(
      (element) => getComputedStyle(element).backgroundColor
    );
    expect(ashaBackground).not.toBe(aaravBackground);

    const studentTray = page.locator('[aria-label="Students available for manual seating"]');
    await page.getByRole('textbox', { name: 'Search students' }).fill('B');
    await expect(studentTray.getByRole('button')).toHaveCount(3);
    await page.getByRole('textbox', { name: 'Search students' }).fill('');

    const binaCard = page.getByRole('button', { name: /^B Bina South/ });
    const reservedSeat = page.getByRole('button', { name: 'Seat 10, reserved' });
    await expect(reservedSeat).toHaveAttribute('aria-disabled', 'true');
    await dragWithMouse(page, binaCard, reservedSeat);
    await expect(binaCard).toBeEnabled();
    await expect(page.getByText('2 of 6 students assigned')).toBeVisible();
    const disabledSeat = page.getByRole('button', { name: 'Seat 11, disabled' });
    await expect(disabledSeat).toHaveAttribute('aria-disabled', 'true');
    await dragWithMouse(page, binaCard, disabledSeat);
    await expect(binaCard).toBeEnabled();
    await expect(page.getByText('2 of 6 students assigned')).toBeVisible();

    await dragWithMouse(page, binaCard, page.getByRole('button', { name: 'Seat 4, empty' }));
    await expect(
      page.getByRole('button', { name: 'Seat 4, occupied by Bina South' })
    ).toBeVisible();
    await expect(bilalCard).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByText('3 of 6 students assigned')).toBeVisible();

    await page.getByRole('button', { name: 'Auto-arrange all' }).click();
    await expect(page.getByText('6 of 6 students assigned')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Seat 1, occupied by Asha North' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Seat 2, occupied by Bilal South' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: 'Seat 3, unavailable, occupied by another simultaneous exam plan',
      })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Seat 4, occupied by Aarav North' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Seat 5, occupied by Bina South' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Seat 6, occupied by Avni North' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Seat 7, occupied by Bhavya South' })
    ).toBeVisible();

    await dragWithMouse(
      page,
      page.getByRole('button', { name: 'Seat 1, occupied by Asha North' }),
      page.getByRole('button', { name: 'Seat 2, occupied by Bilal South' })
    );
    await expect(
      page.getByRole('button', { name: 'Seat 1, occupied by Bilal South' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Seat 2, occupied by Asha North' })
    ).toBeVisible();
    expect(await seriousAccessibilityViolations(page)).toEqual([]);

    await page.getByRole('button', { name: 'Review manual seating' }).click();
    await expect(page.getByRole('heading', { name: 'Review the proposed seating' })).toBeVisible();
    expect(state.autoAllocateRequests).toBe(0);
    await page.getByRole('button', { name: 'Apply seating & validate' }).click();
    await expect(
      page.getByText('All mandatory checks passed and no warnings were found.')
    ).toBeVisible();
    const savedStudents = state.manualSaveBody?.rooms?.[0].students ?? [];
    expect(savedStudents).toHaveLength(6);
    expect(new Set(savedStudents.map((row) => (row as { studentId: string }).studentId)).size).toBe(
      6
    );
    expect(
      savedStudents.some((row) => (row as { studentId: string }).studentId === externalStudentId)
    ).toBe(false);
    expect(savedStudents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ studentId: twoDivisionStudents[0].studentId, seatNumber: 2 }),
        expect.objectContaining({ studentId: twoDivisionStudents[3].studentId, seatNumber: 1 }),
      ])
    );

    await page.goto(`/academic/seatallocation/${examId}/setup?step=1&planId=${planId}`);
    await page.getByRole('button', { name: /Manual classroom/ }).click();
    await expect(page.getByText('6 of 6 students assigned')).toBeVisible();
    await expect(page.getByRole('button', { name: /^A Asha North/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await expect(page.getByRole('button', { name: /^B Bilal South/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await expect(
      page.getByRole('button', { name: 'Seat 1, occupied by Bilal South' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Seat 2, occupied by Asha North' })
    ).toBeVisible();
  });

  test('has no serious accessibility violations through all four phases', async ({ page }) => {
    const findings: Array<{
      step: string;
      violations: Awaited<ReturnType<typeof seriousAccessibilityViolations>>;
    }> = [];
    const inspectStep = async (step: string) => {
      const violations = await seriousAccessibilityViolations(page);
      if (violations.length > 0) findings.push({ step, violations });
    };

    await mockGuidedSeating(page);
    await page.goto(`/academic/seatallocation/${examId}/setup`);
    await expect(
      page.getByRole('heading', { name: 'Plan every subject, then publish once' })
    ).toBeVisible();
    await inspectStep('Plan subjects');
    await page.getByRole('checkbox', { name: /Mathematics/ }).check();
    await page.getByRole('checkbox', { name: /Science/ }).check();
    await page.getByRole('button', { name: 'Create seating plan' }).click();

    await expect(
      page.getByRole('heading', { name: 'Configure capacity and seating rules' })
    ).toBeVisible();
    const roomCheckbox = page.getByRole('checkbox', { name: /Room 101/ });
    if (!(await roomCheckbox.isChecked())) await roomCheckbox.check();
    await expect(page.getByRole('button', { name: 'Generate seating preview' })).toBeEnabled();
    await inspectStep('Configure');
    await page.getByRole('button', { name: 'Generate seating preview' }).click();

    await expect(page.getByRole('heading', { name: 'Review the proposed seating' })).toBeVisible();
    await inspectStep('Review');
    await page.getByRole('button', { name: 'Apply seating & validate' }).click();
    await page.getByRole('button', { name: 'Save plan & return to subjects' }).click();
    await page.getByRole('button', { name: 'Review examination & publish' }).click();
    await expect(
      page.getByRole('heading', { name: 'Review the complete examination seating' })
    ).toBeVisible();
    await inspectStep('Publish');
    expect(findings).toEqual([]);
  });

  for (const viewport of [
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 844, height: 390 },
    { width: 1440, height: 900 },
  ]) {
    test(`has no page overflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await mockGuidedSeating(page);
      await page.setViewportSize(viewport);
      await page.goto(`/academic/seatallocation/${examId}/setup`);
      await expect(page.getByRole('heading', { name: 'Seating plan workspace' })).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(overflow).toBe(false);
      await expect(page.getByRole('link', { name: 'Legacy editor' })).toHaveCount(0);
    });
  }
});

test.describe('Seating plan list', { tag: ['@module-academic', '@critical'] }, () => {
  test.use({ storageState: 'playwright/.auth/academic-admin.json' });

  test('explains the empty state and keeps the class selector accessible', async ({ page }) => {
    await mockGuidedSeating(page);
    await mockAcademicContext(page);
    await mockSeatingPlanList(page, []);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/academic/seatallocation');

    await expect(page.locator('[data-layout="inline"]')).toBeVisible();
    await expect(page.getByTestId('breadcrumb-back')).toHaveCount(0);
    await expect(page.getByRole('combobox', { name: 'Class' })).toBeVisible();
    await expect(page.getByText('No exams are ready for seating')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open examination schedule' })).toBeVisible();
    const hasPageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasPageOverflow).toBe(false);

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByRole('table').getByText('No exams are ready for seating')).toBeVisible();
    await expect(
      page.getByRole('table').getByRole('link', { name: 'Open examination schedule' })
    ).toBeVisible();
  });

  test('uses focused exam cards instead of the desktop table on phones', async ({ page }) => {
    await mockGuidedSeating(page);
    await mockAcademicContext(page);
    await mockSeatingPlanList(page, [
      {
        examId,
        examName: 'Term 1 Examination',
        examTypeName: 'Written',
        standardName: 'Standard 8',
        divisions: ['A', 'B'],
        divisionProgress: [],
        totalStudents: 48,
        allocatedStudents: 24,
        pendingStudents: 24,
        roomsUsed: 1,
        seatingPlanCount: 1,
        subjectCount: 1,
        plannedSubjectCount: 1,
        subjectNames: ['Mathematics'],
        status: 1,
        sessions: [
          {
            sessionKey,
            seatingPlanId: planId,
            examDate: '2026-09-10',
            startTime: '09:00:00',
            endTime: '12:00:00',
            subjectNames: ['Mathematics'],
            divisions: ['A', 'B'],
            divisionProgress: [],
            totalStudents: 48,
            allocatedStudents: 24,
            pendingStudents: 24,
            roomsUsed: 1,
            usableCapacity: 50,
            emptySeats: 26,
            utilization: 48,
            status: 1,
            hasCompleteSchedule: true,
            canPrepare: true,
            requiresMigration: false,
            blockingIssueCount: 0,
          },
        ],
      },
    ]);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/academic/seatallocation');

    await expect(page.getByRole('article')).toContainText('Term 1 Examination');
    await expect(page.getByRole('button', { name: 'Manage plans' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Preview details' })).toBeVisible();
    await expect(page.getByRole('table')).toHaveCount(0);

    await page.getByRole('button', { name: 'Preview details' }).click();
    await expect(page.getByRole('button', { name: 'Close seating plan preview' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Manage plans' })).toBeVisible();
    const previewOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(previewOverflow).toBe(false);
    await page.getByRole('button', { name: 'Close seating plan preview' }).click();
  });
});
