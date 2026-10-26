import { it, vi, expect } from 'vitest';
import { employeeType } from 'src/redux/tagTypes';

import './attendanceApi';
import './hrOperationalTableApi';

const captured = vi.hoisted(() => {
  const endpoints: Record<string, any> = {};
  const client = {
    injectEndpoints: (options: any) => {
      Object.assign(
        endpoints,
        options.endpoints({ query: (value: any) => value, mutation: (value: any) => value })
      );
      return { endpoints };
    },
  };
  return { endpoints, client };
});
vi.mock('src/redux/service', () => ({ api: captured.client }));
vi.mock('src/redux/hr/employeeApi', () => ({ employeeApi: captured.client }));

it('refreshes active Register criteria after both owning adjustment mutations', () => {
  const criteriaTags = captured.endpoints.hrOperationalTable.providesTags(undefined, undefined, {
    table: 'hr-attendance-register',
  });
  expect(criteriaTags).toEqual(captured.endpoints.getGroupedAttendanceRegister.providesTags);
  ['adjustAttendanceRegister', 'bulkAdjustAttendanceRegister'].forEach((operation) => {
    expect(captured.endpoints[operation].invalidatesTags).toEqual(
      expect.arrayContaining(criteriaTags)
    );
  });
});

it('keeps I-card criteria on the existing employee mutation cache and preserves zero/false criteria', () => {
  expect(
    captured.endpoints.hrOperationalTable.providesTags(undefined, undefined, {
      table: 'employee-icard-selection-table',
    })
  ).toEqual([employeeType.employee]);
  const body = {
    table: 'employee-icard-selection-table',
    query: { mediumStageId: 'division', isTeaching: false },
    offset: 0,
    size: 25,
    criteria: {
      filters: [{ column: 'fullName', type: 'contains', value: 'SYN-0124' }],
      sorts: [{ column: 'fullName', direction: 'desc' }],
    },
  };
  expect(captured.endpoints.hrOperationalTable.query(body)).toEqual({
    url: '/hr/table-query',
    method: 'POST',
    body,
  });
});
