import { vi, it, expect } from 'vitest';

import { buildAttendanceRegisterQueueRequest } from './attendance-register-queue-api';

vi.mock('src/redux/service', () => ({ api: { injectEndpoints: () => ({}) } }));

it('sends complete queue scope and pagination through the shared authenticated API', () => {
  const params = {
    academicYearId: 'year',
    boardId: 'board',
    mediumId: 'medium',
    standardId: 'class',
    divisionId: 'division',
    skipCount: 25,
    maxResultCount: 25,
  };
  expect(buildAttendanceRegisterQueueRequest(params)).toEqual({
    url: '/students/dashboard/attendance-registers',
    params,
  });
});
