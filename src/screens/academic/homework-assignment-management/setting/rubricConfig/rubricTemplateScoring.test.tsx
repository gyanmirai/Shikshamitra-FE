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
import {
  RubricStatus,
  RubricWorkType,
  RubricVisibility,
  RubricScoringModel,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import RubricConfigForm from './rubricConfigForm';

vi.hoisted(() => vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4194'));
vi.mock('src/components/iconify', async (importOriginal) => ({
  ...(await importOriginal<typeof import('src/components/iconify')>()),
  Iconify: () => null,
}));

function setup(editData: AssessmentRubricDto | null = null) {
  const writes: Record<string, unknown>[] = [];
  mswServer.use(
    http.get(/\/api\/auth\/session$/, () => HttpResponse.json(null)),
    http.get(/^https:\/\/api\.(iconify.design|simplesvg.com|unisvg.com)\//, ({ request }) => {
      const url = new URL(request.url);
      return HttpResponse.json({
        prefix: url.pathname.slice(1, -5),
        icons: {},
        not_found: url.searchParams.get('icons')?.split(',') || [],
      });
    }),
    http.all(/http:\/\/localhost:4194\/api\/academic\/rubrics/, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      writes.push(body);
      return HttpResponse.json({ ...body, id: 'rubric', status: 0 });
    })
  );
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      globalState: () => ({ currentMedium: { id: 'medium' } }),
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
  const user = {
    click: (element: HTMLElement) =>
      act(async () => {
        if (element.getAttribute('role') === 'combobox') fireEvent.mouseDown(element);
        else fireEvent.click(element);
        await Promise.resolve();
      }),
    type: (element: HTMLElement, value: string) =>
      act(async () => {
        fireEvent.change(element, {
          target: { value: (element as HTMLInputElement).value + value },
        });
        await Promise.resolve();
      }),
    clear: (element: HTMLElement) =>
      act(async () => {
        fireEvent.change(element, { target: { value: '' } });
        await Promise.resolve();
      }),
  };
  const next = async () => user.click(screen.getByRole('button', { name: 'Next' }));
  const start = async () => {
    await user.type(screen.getByLabelText('Rubric name *'), 'Scoring template');
    await user.click(screen.getByRole('combobox', { name: 'Applies to *' }));
    await user.click(screen.getByRole('option', { name: 'Both' }));
    await next();
    await screen.findByLabelText('Criterion *');
  };
  const model = async (name: string) => {
    await user.click(screen.getByRole('combobox', { name: 'Scoring model *' }));
    await user.click(screen.getByRole('option', { name }));
  };
  return { user, writes, next, start, model };
}

describe('Rubric scoring template builder', { timeout: 60000 }, () => {
  it('lets teachers try points and feedback without changing the saved template', async () => {
    const { user, writes, start, next } = setup();
    await start();
    await user.type(screen.getByLabelText('Criterion *'), 'Accuracy');
    await next();
    const points = await screen.findByRole('spinbutton', { name: /Points earned/ });
    await user.type(points, '7.5');
    expect(fireEvent.keyDown(points, { key: 'Enter', code: 'Enter' })).toBe(false);
    expect(writes).toHaveLength(0);
    await user.type(screen.getByLabelText('Accuracy Feedback'), 'Trial feedback');
    expect(screen.getByRole('status', { name: 'Preview score' })).toHaveTextContent('7.5 / 10');
    await user.clear(points);
    await user.type(points, '11');
    expect(screen.getByRole('status', { name: 'Preview score' })).toHaveTextContent(
      'Correct the invalid score'
    );
    await user.click(screen.getByRole('button', { name: 'Reset preview' }));
    expect(screen.getByRole('spinbutton', { name: /Points earned/ })).toHaveValue(null);
    expect(screen.getByLabelText('Accuracy Feedback')).toHaveValue('');
    await user.type(screen.getByRole('spinbutton', { name: /Points earned/ }), '3');
    await user.click(screen.getByRole('button', { name: /^Save draft$/ }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0].criteria).toEqual([
      expect.objectContaining({ title: 'Accuracy', points: 10 }),
    ]);
    expect(writes[0]).not.toHaveProperty('scores');
    expect(writes[0]).not.toHaveProperty('remarks');
  });

  it('hides Rating Scale when creating a template', async () => {
    const { user, start } = setup();
    await start();
    await user.click(screen.getByRole('combobox', { name: 'Scoring model *' }));
    expect(screen.queryByRole('option', { name: 'Rating Scale' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Points-Based' })).toBeInTheDocument();
  });

  it('uses the teacher performance choices and clears trials when revisiting edited criteria', async () => {
    const { user, writes, start, model, next } = setup();
    await start();
    await user.type(screen.getByLabelText('Criterion *'), 'Accuracy');
    await model('Performance Levels');
    await next();
    const choices = screen.getAllByRole('button', { name: /^Accuracy: .*, .* points$/ });
    expect(choices.length).toBeGreaterThanOrEqual(2);
    await user.click(choices[0]);
    expect(choices[0]).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status', { name: 'Preview score' })).not.toHaveTextContent('0 /');
    await user.click(screen.getByRole('button', { name: /^Back$/ }));
    const name = await screen.findByLabelText('Criterion *');
    await user.clear(name);
    await user.type(name, 'Presentation');
    await next();
    expect(await screen.findByRole('status', { name: 'Preview score' })).toHaveTextContent('0 /');
    expect(screen.queryByRole('button', { name: /^Accuracy:/ })).not.toBeInTheDocument();
    expect(writes).toHaveLength(0);
  });

  it('shows running weights, blocks an invalid total, and saves corrected weights', async () => {
    const { user, writes, start, model, next } = setup();
    await start();
    await user.type(screen.getByLabelText('Criterion *'), 'Accuracy');
    await model('Weighted Percentage');
    await user.click(screen.getByRole('button', { name: 'Add Criterion' }));
    await user.type(screen.getAllByLabelText('Criterion *')[1], 'Presentation');
    const weights = screen.getAllByLabelText('Weight % *');
    await user.clear(weights[0]);
    await user.type(weights[0], '60');
    await user.type(weights[1], '30');
    expect(screen.getByText(/Total weight:.*90.00/)).toBeInTheDocument();
    await next();
    expect(
      await screen.findByText('Weighted percentage rubrics must total exactly 100%')
    ).toBeInTheDocument();
    expect(writes).toHaveLength(0);
    await user.clear(weights[1]);
    await user.type(weights[1], '40');
    await next();
    expect(await screen.findByText('Total weight: 100 / 100%')).toBeInTheDocument();
    const achievement = screen.getAllByRole('spinbutton', { name: /Achievement %/ });
    await user.type(achievement[0], '50');
    await user.type(achievement[1], '100');
    expect(screen.getByRole('status', { name: 'Preview score' })).toHaveTextContent('70 / 100%');
    await user.click(screen.getByRole('button', { name: /^Save draft$/ }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0].criteria).toEqual([
      expect.objectContaining({ title: 'Accuracy', weight: 60 }),
      expect.objectContaining({ title: 'Presentation', weight: 40 }),
    ]);
  }, 60000);

  it('hides checklist scores and saves each item with a maximum of one', async () => {
    const { user, writes, start, model, next } = setup();
    await start();
    await user.type(screen.getByLabelText('Criterion *'), 'Completed');
    await model('Checklist');
    expect(screen.queryByLabelText('Max points *')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Weight % *')).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    await next();
    expect(await screen.findByText('Checklist items: 1')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Completed: Met' }));
    expect(screen.getByRole('status', { name: 'Preview score' })).toHaveTextContent(
      '1 / 1 items met'
    );
    await user.click(screen.getByRole('checkbox', { name: 'Completed: Met' }));
    expect(screen.getByText('Not met')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Preview score' })).toHaveTextContent(
      '0 / 1 items met'
    );
    await user.click(screen.getByRole('button', { name: /^Save draft$/ }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0].criteria).toEqual([
      expect.objectContaining({ title: 'Completed', points: 1 }),
    ]);
  });

  it('opens and saves an existing Rating Scale template', async () => {
    const { user, writes, next } = setup({
      id: 'legacy',
      title: 'Legacy rating',
      appliesToWorkType: RubricWorkType.Both,
      scoringModel: RubricScoringModel.RatingScale,
      visibility: RubricVisibility.Institution,
      status: RubricStatus.Draft,
      totalMarks: 5,
      tags: [],
      version: 1,
      performanceLevels: [
        { level: 2, label: 'Excellent', score: 5, studentLabel: 'Excellent' },
        { level: 1, label: 'Good', score: 3, studentLabel: 'Good' },
      ],
      criteria: [
        {
          id: 'criterion',
          rubricId: 'legacy',
          title: 'Accuracy',
          points: 5,
          isRequired: true,
          displayOrder: 1,
        },
      ],
    });
    await next();
    expect(await screen.findByRole('combobox', { name: 'Scoring model *' })).toHaveTextContent(
      'Rating Scale'
    );
    await next();
    await user.click(await screen.findByRole('button', { name: 'Accuracy: Excellent, 5 rating' }));
    expect(screen.getByRole('status', { name: 'Preview score' })).toHaveTextContent('5 / 5');
    await user.click(await screen.findByRole('button', { name: /^Save draft$/ }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0]).toMatchObject({
      scoringModel: RubricScoringModel.RatingScale,
      criteria: [expect.objectContaining({ points: 5 })],
    });
  });
});
