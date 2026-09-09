import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { lessonPlanApi } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-api';

import {
  prefill,
  progressUrl,
  renderProgressModal,
  prepareProgressNetwork,
} from './lesson-plan-progress-test-fixture';

import type { LessonPlanRow } from '../lessonPlanData';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
beforeEach(async () => {
  await prepareProgressNetwork();
  mswServer.use(
    http.get(progressUrl, () => HttpResponse.json({ minimumCompletionPercentage: 30 }))
  );
});

describe('lesson plan API validation feedback', () => {
  it.each([
    ['create', 'Draft'],
    ['create', 'Submit'],
    ['update', 'Draft'],
    ['update', 'Submit'],
  ] as const)(
    'maps both field errors on %s / %s and permits a corrected retry',
    async (operation, action) => {
      let requests = 0;
      const response = () => {
        requests += 1;
        return requests === 1
          ? HttpResponse.json(
              {
                title: 'Validation failed',
                status: 400,
                detail: 'Method arguments are not valid!',
                errors: {
                  LearningObjective: ['The objective needs correction.'],
                  ResourcesRequired: ['The resources need correction.'],
                },
              },
              { status: 400 }
            )
          : HttpResponse.json({ id: 'plan-one' });
      };
      mswServer.use(
        http.post('*/api/academic/curriculum/lesson-plans', response),
        http.put('*/api/academic/curriculum/lesson-plans/plan-one', response)
      );
      let store: ReturnType<typeof renderProgressModal>['store'];
      const view = renderProgressModal({
        editData:
          operation === 'update'
            ? ({
                ...prefill,
                id: 'plan-one',
                plannedDate: '2026-09-09',
              } as unknown as LessonPlanRow)
            : undefined,
        onSave: async (form, submit) => {
          const body = { ...form, status: submit ? 1 : 0 };
          const endpoint =
            operation === 'create'
              ? lessonPlanApi.endpoints.createLessonPlan.initiate(body)
              : lessonPlanApi.endpoints.updateLessonPlan.initiate({ id: 'plan-one', body });
          await store.dispatch(endpoint).unwrap();
        },
      });
      ({ store } = view);
      const objective = screen.getByRole('textbox', { name: 'Learning Objective' });
      const resources = screen.getByRole('textbox', { name: 'Resources Required' });
      fireEvent.change(objective, { target: { value: 'Original objective' } });
      fireEvent.change(resources, { target: { value: 'Original resources' } });
      await waitFor(() => expect(screen.getByRole('button', { name: action })).toBeEnabled());
      fireEvent.click(screen.getByRole('button', { name: action }));
      await waitFor(() =>
        expect(objective).toHaveAccessibleDescription(
          expect.stringContaining('The objective needs correction.')
        )
      );
      expect(resources).toHaveAccessibleDescription(
        expect.stringContaining('The resources need correction.')
      );
      await waitFor(() => expect(objective).toHaveFocus());
      expect(objective).toHaveValue('Original objective');
      expect(resources).toHaveValue('Original resources');
      expect(screen.queryByText('Failed to save lesson plan.')).not.toBeInTheDocument();
      fireEvent.change(objective, { target: { value: 'Corrected objective' } });
      expect(objective).toHaveAttribute('aria-invalid', 'false');
      expect(resources).toHaveAttribute('aria-invalid', 'true');
      fireEvent.change(resources, { target: { value: 'Corrected resources' } });
      await waitFor(() => expect(screen.getByRole('button', { name: action })).toBeEnabled());
      fireEvent.click(screen.getByRole('button', { name: action }));
      await waitFor(() => expect(requests).toBe(2));
      await waitFor(() => expect(screen.getByRole('button', { name: action })).toBeEnabled());
      expect(screen.queryByText('The resources need correction.')).not.toBeInTheDocument();
    }
  );

  it('keeps a non-field server failure visible in the modal', async () => {
    renderProgressModal({
      onSave: async () => {
        throw Object.assign(new Error('Unable to save'), {
          status: 409,
          data: { detail: 'This period already has a lesson plan.' },
        });
      },
    });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Draft' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Draft' }));
    expect(await screen.findByText('This period already has a lesson plan.')).toBeVisible();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Draft' })).toBeEnabled());
  });
});
