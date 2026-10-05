import type { AssessmentRubricDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RubricStatus, RubricWorkType, RubricVisibility, RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import RubricConfigForm from './rubricConfigForm';

vi.hoisted(() => vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4194'));
vi.mock('src/components/iconify', async (importOriginal) => ({
  ...await importOriginal<typeof import('src/components/iconify')>(), Iconify: () => null,
}));

function setup(editData: AssessmentRubricDto | null = null) {
  const writes: Record<string, unknown>[] = [];
  mswServer.use(
    http.get(/\/api\/auth\/session$/, () => HttpResponse.json(null)),
    http.get(/^https:\/\/api\.(iconify.design|simplesvg.com|unisvg.com)\//, ({ request }) => {
      const url = new URL(request.url);
      return HttpResponse.json({ prefix: url.pathname.slice(1, -5), icons: {},
        not_found: url.searchParams.get('icons')?.split(',') || [] });
    }),
    http.all(/http:\/\/localhost:4194\/api\/academic\/rubrics/, async ({ request }) => {
      const body = await request.json() as Record<string, unknown>;
      writes.push(body);
      return HttpResponse.json({ ...body, id: 'rubric', status: 0 });
    })
  );
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer, globalState: () => ({ currentMedium: { id: 'medium' } }), confirmPopup: () => ({ isChanges: false }) },
    middleware: getDefault => getDefault().concat(api.middleware),
  });
  render(<Provider store={store}><ThemeProvider theme={createTheme(defaultSettings)}>
    <RubricConfigForm editData={editData} onClose={vi.fn()} />
  </ThemeProvider></Provider>);
  const user = {
    click: (element: HTMLElement) => act(async () => {
      if (element.getAttribute('role') === 'combobox') fireEvent.mouseDown(element);
      else fireEvent.click(element);
      await Promise.resolve();
    }),
    type: (element: HTMLElement, value: string) => act(async () => {
      fireEvent.change(element, { target: { value: (element as HTMLInputElement).value + value } });
      await Promise.resolve();
    }),
    clear: (element: HTMLElement) => act(async () => {
      fireEvent.change(element, { target: { value: '' } });
      await Promise.resolve();
    }),
  };
  const next = async () => user.click(screen.getByRole('button', { name: 'Next' }));
  const start = async () => {
    await user.type(screen.getByLabelText('Rubric Name *'), 'Scoring template');
    await user.click(screen.getByRole('combobox', { name: 'Applies To *' }));
    await user.click(screen.getByRole('option', { name: 'Both' }));
    await next();
    await screen.findByLabelText('Criterion *');
  };
  const model = async (name: string) => {
    await user.click(screen.getByRole('combobox', { name: 'Scoring Model *' }));
    await user.click(screen.getByRole('option', { name }));
  };
  return { user, writes, next, start, model };
}

describe('Rubric scoring template builder', { timeout: 60000 }, () => {
  it('hides Rating Scale when creating a template', async () => {
    const { user, start } = setup(); await start();
    await user.click(screen.getByRole('combobox', { name: 'Scoring Model *' }));
    expect(screen.queryByRole('option', { name: 'Rating Scale' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Points-Based' })).toBeInTheDocument();
  });

  it('shows running weights, blocks an invalid total, and saves corrected weights', async () => {
    const { user, writes, start, model, next } = setup(); await start();
    await user.type(screen.getByLabelText('Criterion *'), 'Accuracy');
    await model('Weighted Percentage');
    await user.click(screen.getByRole('button', { name: 'Add Criterion' }));
    await user.type(screen.getAllByLabelText('Criterion *')[1], 'Presentation');
    const weights = screen.getAllByLabelText('Weight % *');
    await user.clear(weights[0]); await user.type(weights[0], '60');
    await user.type(weights[1], '30');
    expect(screen.getByText(/Total weight:.*90.00/)).toBeInTheDocument();
    await next();
    expect(await screen.findByText('Weighted percentage rubrics must total exactly 100%')).toBeInTheDocument();
    expect(writes).toHaveLength(0);
    await user.clear(weights[1]); await user.type(weights[1], '40'); await next();
    expect(await screen.findByText('Total weight: 100 / 100%')).toBeInTheDocument();
    expect(screen.getByText('Weight 60%. Teacher enters achievement from 0 to 100%.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Save$/ }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0].criteria).toEqual([
      expect.objectContaining({ title: 'Accuracy', weight: 60 }),
      expect.objectContaining({ title: 'Presentation', weight: 40 }),
    ]);
  }, 60000);

  it('hides checklist scores and saves each item with a maximum of one', async () => {
    const { user, writes, start, model, next } = setup(); await start();
    await user.type(screen.getByLabelText('Criterion *'), 'Completed'); await model('Checklist');
    expect(screen.queryByLabelText('Max Points *')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Weight % *')).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    await next();
    expect(await screen.findByText('Checklist items: 1')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Save$/ }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0].criteria).toEqual([expect.objectContaining({ title: 'Completed', points: 1 })]);
  });

  it('opens and saves an existing Rating Scale template', async () => {
    const { user, writes, next } = setup({
      id: 'legacy', title: 'Legacy rating', appliesToWorkType: RubricWorkType.Both,
      scoringModel: RubricScoringModel.RatingScale, visibility: RubricVisibility.Institution,
      status: RubricStatus.Draft, totalMarks: 5, tags: [], version: 1,
      performanceLevels: [{ level: 2, label: 'Excellent', score: 5, studentLabel: 'Excellent' }, { level: 1, label: 'Good', score: 3, studentLabel: 'Good' }],
      criteria: [{ id: 'criterion', rubricId: 'legacy', title: 'Accuracy', points: 5, isRequired: true, displayOrder: 1 }],
    });
    await next();
    expect(await screen.findByRole('combobox', { name: 'Scoring Model *' })).toHaveTextContent('Rating Scale');
    await next(); await user.click(await screen.findByRole('button', { name: /^Save$/ }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0]).toMatchObject({ scoringModel: RubricScoringModel.RatingScale,
      criteria: [expect.objectContaining({ points: 5 })] });
  });
});
