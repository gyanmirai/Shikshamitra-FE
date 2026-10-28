// @vitest-environment node
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, expect, describe, afterEach } from 'vitest';

import { studentAcademic360Api } from './studentAcademic360Api';

const stores: Array<ReturnType<typeof createStore>> = [];
function createStore() {
  const api = studentAcademic360Api;
  return configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });
}

afterEach(() => stores.forEach((store) => store.dispatch(studentAcademic360Api.util.resetApiState())));

describe('Student Academic 360 detail requests', () => {
  it('sends offsets and page sizes so older learning and exam records remain reachable', async () => {
    const requests: URL[] = [];
    mswServer.use(http.get('*/api/academics/student-academic-360/student-1/tabs/:tab', ({ request }) => {
      requests.push(new URL(request.url));
      return HttpResponse.json({ student: { studentId: 'student-1' }, exams: [], examTotalCount: 14 });
    }));
    const store = createStore();
    stores.push(store);
    const input = {
      studentId: 'student-1', tab: 'exams',
      taskSkipCount: 20, taskMaxResultCount: 20,
      examSkipCount: 10, examMaxResultCount: 10,
      taskStatusFilter: 'LATE', taskSubjectName: 'Mathematics',
      examStatusFilter: 'completed', examSearchTerm: 'Older exam', detailPaging: true,
    };
    const result = await store.dispatch(studentAcademic360Api.endpoints.getStudentAcademic360Tab.initiate(input));
    expect(result.isSuccess).toBe(true);
    expect(requests).toHaveLength(1);
    expect(requests[0].searchParams.get('taskSkipCount')).toBe('20');
    expect(requests[0].searchParams.get('taskMaxResultCount')).toBe('20');
    expect(requests[0].searchParams.get('examSkipCount')).toBe('10');
    expect(requests[0].searchParams.get('examMaxResultCount')).toBe('10');
    expect(requests[0].searchParams.get('taskStatusFilter')).toBe('LATE');
    expect(requests[0].searchParams.get('taskSubjectName')).toBe('Mathematics');
    expect(requests[0].searchParams.get('examStatusFilter')).toBe('completed');
    expect(requests[0].searchParams.get('examSearchTerm')).toBe('Older exam');
  });
});
