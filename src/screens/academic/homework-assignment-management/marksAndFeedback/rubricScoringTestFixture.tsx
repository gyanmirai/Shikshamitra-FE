import { expect } from 'vitest';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import React, { useState, createRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, cleanup } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import {
  RubricStatus, RubricVisibility, RubricScoringModel,
  type AssessmentRubricDto, type RubricEvaluationDto,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import RubricEvaluationPanel, { type RubricEvaluationPanelRef } from './rubricEvaluationPanel';

export function setupRubricScoringTest(mode: 'homework' | 'assignment', model: RubricScoringModel, failSubmit = false) {
  const maxima = model === RubricScoringModel.WeightedPercentage ? [50, 50]
    : model === RubricScoringModel.Checklist ? [1, 1]
    : model === RubricScoringModel.PerformanceLevels ? [4, 4]
    : model === RubricScoringModel.RatingScale ? [5, 5] : [10, 15];
  const rubric: AssessmentRubricDto = {
    id: 'rubric', title: 'Scoring rubric', scoringModel: model,
    status: RubricStatus.Published, visibility: RubricVisibility.Institution,
    tags: [], version: 1, totalMarks: maxima[0] + maxima[1],
    performanceLevels: model === RubricScoringModel.PerformanceLevels || model === RubricScoringModel.RatingScale
      ? [{ level: 2, label: 'Excellent', score: 4 }, { level: 1, label: 'Good', score: 3 }] : [],
    criteria: maxima.map((maximum, index) => ({
      id: `criterion-${index}`, rubricId: 'rubric', title: `Criterion ${index + 1}`,
      points: model === RubricScoringModel.WeightedPercentage ? null : maximum,
      weight: model === RubricScoringModel.WeightedPercentage ? maximum : null,
      displayOrder: index + 1, isRequired: true,
    })),
  };
  let saved: RubricEvaluationDto | null = null;
  const writes: RubricEvaluationDto[] = [];
  const evaluationReads: number[] = [];
  let approved = false;
  const readEvaluation = () => {
    evaluationReads.push(writes.length);
    return saved && { ...saved, status: approved ? 2 : 0 };
  };
  const base = 'http://localhost:4194/api/academic/rubrics';
  mswServer.use(
    http.get(/^https:\/\/api\.(iconify.design|simplesvg.com|unisvg.com)\//, ({ request }) => {
      const url = new URL(request.url);
      return HttpResponse.json({ prefix: url.pathname.slice(1, -5), icons: {},
        not_found: url.searchParams.get('icons')?.split(',') || [] });
    }),
    http.get(/\/api\/auth\/session$/, () => HttpResponse.json(null)),
    http.get(base, ({ request }) => {
      expect(new URL(request.url).searchParams.get(`${mode}Id`)).toBe('task');
      return HttpResponse.json([rubric]);
    }),
    http.get(`${base}/rubric/evaluations`, () => HttpResponse.json(saved ? [saved] : [])),
    http.get(`${base}/rubric/evaluations/submission/submission`, () => HttpResponse.json(readEvaluation())),
    http.get(`${base}/evaluations/student/student/assignment/task`, () => HttpResponse.json(readEvaluation())),
    http.post(`${base}/rubric/evaluations`, async ({ request }) => {
      const body = await request.json() as RubricEvaluationDto;
      saved = { ...body, id: 'evaluation', rubricId: 'rubric', evaluatorId: 'teacher', status: 0,
        totalMarks: body.scores.reduce((sum, score) => sum + score.marks, 0) };
      writes.push(saved);
      return HttpResponse.json(saved);
    }),
    http.post(`${base}/evaluations/evaluation/submit`, () => failSubmit
      ? HttpResponse.json({ detail: 'Submit failed' }, { status: 500 })
      : new HttpResponse(null, { status: 204 })),
    http.post(`${base}/evaluations/evaluation/approve`, () => {
      approved = true;
      return new HttpResponse(null, { status: 204 });
    })
  );
  function SaveButton({ panelRef }: { panelRef: React.RefObject<RubricEvaluationPanelRef | null> }) {
    const [result, setResult] = useState('');
    return <><button type="button" onClick={async () => setResult(await panelRef.current?.save() ? 'Saved' : 'Rejected')}>Save evaluation</button><span>{result}</span></>;
  }
  const mount = (readOnly = false) => {
    const ref = createRef<RubricEvaluationPanelRef>();
    const store = configureStore({ reducer: { [api.reducerPath]: api.reducer },
      middleware: getDefault => getDefault().concat(api.middleware) });
    render(<Provider store={store}><ThemeProvider theme={createTheme(defaultSettings)}>
      <RubricEvaluationPanel ref={ref} mode={mode} readOnly={readOnly} standardId="standard" subjectId="subject"
        taskId="task" studentRow={{ id: 'submission', studentId: 'student' }} />
      <SaveButton panelRef={ref} />
    </ThemeProvider></Provider>);
  };
  mount();
  return { writes, evaluationReads, reload: () => { cleanup(); mount(true); } };
}

