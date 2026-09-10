import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, screen, within, waitFor } from '@testing-library/react';
import { lessonPlanApi } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-api';

import {
  chapter,
  diariesUrl,
  chaptersUrl,
  prepareChapterNetwork,
  renderDivisionChapters,
} from './chapter-progress-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
beforeEach(prepareChapterNetwork);

describe('syllabus diary progress refresh', () => {
  it.each(['create', 'update', 'submit'] as const)(
    'refreshes the real chapter table after diary %s and keeps division results separate',
    async (action) => {
      let progressA = 0;
      const readDivisions: string[] = [];
      const saveDiary = () => {
        progressA = 15;
        return HttpResponse.json({
          id: 'diary-a',
          actualCompletionPercentage: 15,
          status: 'Submitted',
        });
      };
      mswServer.use(
        http.get(chaptersUrl, ({ request }) => {
          const params = new URL(request.url).searchParams;
          expect(params.get('standardId')).toBe('class-12');
          expect(params.get('subjectId')).toBe('mathematics');
          const division = params.get('divisionId') ?? '';
          readDivisions.push(division);
          const progressPercentage = division === 'division-a' ? progressA : 30;
          return HttpResponse.json([
            {
              ...chapter,
              progressPercentage,
              coverageStatus: progressPercentage ? 'In Progress' : 'Not Started',
            },
          ]);
        }),
        http.post(diariesUrl, saveDiary),
        http.put(`${diariesUrl}/diary-a`, saveDiary),
        http.post(`${diariesUrl}/diary-a/submit`, saveDiary)
      );
      const { store, unmount } = renderDivisionChapters();
      const divisionA = within(screen.getByRole('region', { name: 'division-a' }));
      const divisionB = within(screen.getByRole('region', { name: 'division-b' }));
      expect(await divisionA.findByText('0%')).toBeVisible();
      expect(await divisionB.findByText('30%')).toBeVisible();
      await act(async () => {
        const body = {
          lessonPlanId: 'plan-a',
          actualCompletionPercentage: 15,
          status: 'Submitted',
        };
        if (action === 'create') {
          await store.dispatch(lessonPlanApi.endpoints.createTeacherDiary.initiate(body)).unwrap();
        } else if (action === 'update') {
          await store
            .dispatch(lessonPlanApi.endpoints.updateTeacherDiary.initiate({ id: 'diary-a', body }))
            .unwrap();
        } else {
          await store
            .dispatch(lessonPlanApi.endpoints.submitTeacherDiary.initiate({ id: 'diary-a' }))
            .unwrap();
        }
      });
      expect(await divisionA.findByText('15%')).toBeVisible();
      expect(divisionA.getByText('In Progress')).toBeVisible();
      expect(divisionA.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '15');
      await waitFor(() => {
        expect(divisionB.getByText('30%')).toBeVisible();
        expect(divisionB.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '30');
      });
      expect(readDivisions.filter((id) => id === 'division-a')).toHaveLength(2);
      expect(readDivisions.filter((id) => id === 'division-b')).toHaveLength(2);
      unmount();
    }
  );
});
