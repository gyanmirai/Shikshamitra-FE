import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import {
  assignmentResponse,
  createTeacherTestStore,
} from 'src/components/timetable/teacher-reassignment-test-fixture';

import { timetableManagementApi } from './timetableManagementApi';
import { lessonPlanApi } from '../CurriculumManagementApi/LessonPlanApi/lesson-plan-api';
import { subjectAssignmentsApi } from '../CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

it('allocation save refreshes the timetable, allocation lookup, and both teachers timelines', async () => {
  let teacherId = 'akshay';
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/academics/curriculum/subject-assignments/math-group', () =>
      HttpResponse.json(assignmentResponse(teacherId))
    ),
    http.put('*/api/academics/curriculum/subject-assignments/math-group', () => {
      teacherId = 'parth';
      return HttpResponse.json({});
    }),
    http.get('*/api/academics/timetable/by-standard/class-12/division/division-a', () =>
      HttpResponse.json({ teacherId })
    ),
    http.get('*/api/academic/curriculum/lesson-plans/timeline', ({ request }) =>
      HttpResponse.json({
        slots:
          new URL(request.url).searchParams.get('teacherId') === teacherId ? [{ teacherId }] : [],
      })
    )
  );
  const store = createTeacherTestStore();
  const allocationArgs = { assignmentId: 'math-group' };
  const timetableArgs = { standardId: 'class-12', divisionId: 'division-a' };
  const endpoints = [
    subjectAssignmentsApi.endpoints.getSubjectAssignmentById.initiate(allocationArgs),
    timetableManagementApi.endpoints.getTimetableByStandardDivision.initiate(timetableArgs),
    lessonPlanApi.endpoints.getLessonPlanTimeline.initiate({ teacherId: 'akshay' }),
    lessonPlanApi.endpoints.getLessonPlanTimeline.initiate({ teacherId: 'parth' }),
  ];
  const subscriptions = endpoints.map((query) => store.dispatch(query));
  await Promise.all(subscriptions.map((query) => query.unwrap()));
  await store
    .dispatch(
      subjectAssignmentsApi.endpoints.updateSubjectAssignment.initiate({
        ...allocationArgs,
        body: { subjects: [{ primaryTeacherId: 'parth' }] },
      })
    )
    .unwrap();
  await waitFor(() => {
    expect(
      timetableManagementApi.endpoints.getTimetableByStandardDivision.select(timetableArgs)(
        store.getState()
      ).data
    ).toEqual({ teacherId: 'parth' });
    expect(
      subjectAssignmentsApi.endpoints.getSubjectAssignmentById.select(allocationArgs)(
        store.getState()
      ).data
    ).toEqual(assignmentResponse('parth'));
    expect(
      lessonPlanApi.endpoints.getLessonPlanTimeline.select({ teacherId: 'akshay' })(
        store.getState()
      ).data
    ).toEqual({ slots: [] });
    expect(
      lessonPlanApi.endpoints.getLessonPlanTimeline.select({ teacherId: 'parth' })(store.getState())
        .data
    ).toEqual({ slots: [{ teacherId: 'parth' }] });
  });
  subscriptions.forEach((query) => query.unsubscribe());
});
