import type { AssessmentRubricDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { vi, it, expect, describe } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import {
  RubricStatus,
  RubricWorkType,
  RubricVisibility,
  RubricScoringModel,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import RubricConfigForm from './rubricConfigForm';

vi.hoisted(() => {
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4194');
});

const existingRubric: AssessmentRubricDto = {
  id: 'template-one',
  title: 'Existing writing rubric',
  isTemplate: true,
  appliesToWorkType: RubricWorkType.Both,
  scoringModel: RubricScoringModel.PointsBased,
  visibility: RubricVisibility.Private,
  status: RubricStatus.Draft,
  tags: [],
  performanceLevels: [],
  version: 1,
  totalMarks: 4,
  criteria: [
    {
      id: 'criterion-one',
      rubricId: 'template-one',
      title: 'Accuracy',
      maxMarks: 4,
      displayOrder: 1,
      isRequired: true,
    },
  ],
};

const setup = (editData: AssessmentRubricDto | null) => {
  const requests: Array<{ method: string; body: Record<string, unknown> }> = [];
  mswServer.use(
    http.get(/^https:\/\/api\.(iconify.design|simplesvg.com|unisvg.com)\//, ({ request }) => {
      const url = new URL(request.url);
      return HttpResponse.json({
        prefix: url.pathname.slice(1, -5),
        icons: {},
        not_found: url.searchParams.get('icons')?.split(',') || [],
      });
    }),
    http.get(/\/api\/auth\/session$/, () => HttpResponse.json(null)),
    http.post('http://localhost:4194/api/academic/rubrics', async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      requests.push({ method: 'POST', body });
      return HttpResponse.json({ ...existingRubric, ...body });
    }),
    http.put('http://localhost:4194/api/academic/rubrics/template-one', async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      requests.push({ method: 'PUT', body });
      return HttpResponse.json({ ...existingRubric, ...body });
    })
  );
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      globalState: () => ({ currentMedium: { id: 'medium-one' } }),
      confirmPopup: () => ({ isChanges: false }),
    },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <RubricConfigForm editData={editData} onClose={vi.fn()} />
      </ThemeProvider>
    </Provider>
  );
  return { user: userEvent.setup(), requests };
};

describe('Rubric template visibility', () => {
  it('creates an institution template without a visibility field or validation step', async () => {
    const { user, requests } = setup(null);
    expect(screen.queryByLabelText(/Visibility/)).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('Rubric Name *'), 'Writing rubric');
    await user.click(screen.getByRole('combobox', { name: 'Applies To *' }));
    await user.click(screen.getByRole('option', { name: 'Both' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.type(await screen.findByLabelText('Criterion *'), 'Accuracy');
    await user.click(screen.getByRole('combobox', { name: 'Max Score *' }));
    await user.click(screen.getByRole('option', { name: 'Excellent (4)' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('button', { name: /^Save$/ }));
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0]).toMatchObject({
      method: 'POST',
      body: { title: 'Writing rubric', visibility: RubricVisibility.Institution },
    });
  }, 15000);

  it.each([
    RubricVisibility.Private,
    RubricVisibility.SelectedTeachers,
    RubricVisibility.Department,
  ])(
    'preserves existing scope %s when editing without a visibility selector',
    async (visibility) => {
      const { user, requests } = setup({ ...existingRubric, visibility });
      expect(screen.queryByLabelText(/Visibility/)).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await screen.findByLabelText('Criterion *');
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(await screen.findByRole('button', { name: /^Save$/ }));
      await waitFor(() => expect(requests).toHaveLength(1));
      expect(requests[0]).toMatchObject({ method: 'PUT', body: { visibility } });
    }
  );
});
