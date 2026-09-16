import type { ApiSubstitutionRow } from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';

import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { loadIcons, _api as iconifyApi } from '@iconify/react';

import type { SubstitutionRow } from '../substitutionData';

export const dutiesUrl = '*/api/academics/timetable/substitutions/my-duties';
export const boardUrl = '*/api/academics/timetable/substitutions';
export const acceptUrl = `${boardUrl}/duty-one/acknowledge`;
export const dutyQuery = { date: '2099-09-16' };
const row: SubstitutionRow = {
  id: 'duty-one',
  date: '2099-09-16',
  day: 'Wednesday',
  period: 'Period 7',
  startTime: '15:30',
  endTime: '16:00',
  time: '15:30-16:00',
  className: 'LKG',
  divisionName: 'B',
  departmentName: 'Languages',
  subjectName: 'Gujarati',
  originalTeacherName: 'Absent teacher',
  substituteTeacherName: 'Current teacher',
  roomName: 'A001',
  reason: 'Leave',
  status: 'Waiting Ack',
  priority: 'Normal',
  acknowledgementStatus: 'Sent',
  notificationStatus: 'Sent',
  source: 'Manual',
  conflictStatus: 'Clear',
  isAiSuggested: false,
  workloadStatus: 'Low',
  acknowledgementRequired: true,
  isResponseWindowOpen: true,
  createdAt: '2099-09-16T08:00:00Z',
  auditLog: [],
};
export const waitingDuty: ApiSubstitutionRow = {
  ...row,
  auditLog: [],
  status: 2,
  acknowledgementStatus: 1,
  priority: 1,
  source: 0,
  conflictStatus: 0,
};
export const acceptedDuty: ApiSubstitutionRow = {
  ...waitingDuty,
  status: 3,
  acknowledgementStatus: 3,
  acknowledgedAt: '2099-09-16T08:30:00Z',
};
export const dutyRows = [waitingDuty, { ...waitingDuty, id: 'duty-two', period: 'Period 8' }];
export const pagedDuties = (items = dutyRows) => ({ totalCount: items.length, items });

// The production screen owns enum normalization; this fixture exercises numeric API cache updates.
export function toDutyRow(item: ApiSubstitutionRow): SubstitutionRow {
  const status =
    item.status === 3 ? 'Acknowledged' : item.status === 5 ? 'Rejected' : 'Waiting Ack';
  const acknowledgementStatus =
    item.acknowledgementStatus === 3
      ? 'Accepted'
      : item.acknowledgementStatus === 4
        ? 'Rejected'
        : item.acknowledgementStatus === 5
          ? 'Change Requested'
          : 'Sent';
  return { ...row, id: item.id, status, acknowledgementStatus };
}

export function deferred() {
  let resolve = () => {};
  const promise = new Promise<void>((release) => {
    resolve = release;
  });
  return { promise, resolve };
}

export async function prepareDutyNetwork() {
  iconifyApi.setFetch((...args) => fetch(...args));
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get(dutiesUrl, () => HttpResponse.json(pagedDuties())),
    http.get(boardUrl, () => HttpResponse.json(pagedDuties())),
    http.get('https://api.iconify.design/:collection', ({ request, params }) =>
      HttpResponse.json({
        prefix: String(params.collection).replace('.json', ''),
        icons: {},
        not_found: new URL(request.url).searchParams.get('icons')?.split(',') ?? [],
      })
    )
  );
  await new Promise<void>((resolve) => {
    loadIcons(
      ['mdi:check', 'mdi:close', 'mdi:swap-horizontal', 'lucide:info'],
      (_loaded, _missing, pending) => {
        if (!pending.length) resolve();
      }
    );
  });
}
