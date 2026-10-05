import { useState } from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import AssignGrade from './assignGradeForm';

import type { IAssignGradeProps } from '../type';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const baseProps: IAssignGradeProps = {
  isEdit: true,
  data: {
    id: 'submission-1',
    studentId: 'student-1',
    homeworkId: 'homework-1',
    studentName: 'Arjun Megh Megh',
    rollNumber: '1',
    assignments: '',
    subject: '',
    marks: 4,
    totalMarks: 4,
    feedback: '',
    weightedAverage: '',
    status: '4',
    submissionDate: null,
  },
  selectedClass: 'class-1',
  selectedSubject: 'subject-1',
  selectedHomework: { id: 'homework-1', title: 'HW 2', submissionType: 2 },
  hasRubricAssessment: true,
  hasNext: true,
  onNext: vi.fn(),
  onClose: vi.fn(),
};

const rubric = {
  id: 'rubric-1',
  title: 'HW 2 Rubric',
  status: 1,
  scoringModel: 0,
  visibility: 3,
  tags: [],
  performanceLevels: [],
  totalMarks: 4,
  version: 1,
  criteria: [
    {
      id: 'criterion-1',
      rubricId: 'rubric-1',
      title: 'Understanding',
      isRequired: true,
      points: 4,
      displayOrder: 1,
    },
  ],
};

const evaluation = (studentId: string, status: number) => ({
  id: `evaluation-${studentId}`,
  rubricId: 'rubric-1',
  studentSubmissionId: studentId === 'student-1' ? 'submission-1' : 'submission-2',
  studentId,
  evaluatorId: 'teacher-1',
  totalMarks: 4,
  remarks: 'Good work',
  status,
  scores: [
    {
      id: 'score-1',
      evaluationId: 'evaluation-1',
      criterionId: 'criterion-1',
      marks: 4,
      comments: 'Clear explanation',
    },
  ],
});

function renderForm(props = baseProps) {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      globalState: () => ({ currentMedium: { id: 'medium-1' } }),
      confirmPopup: () => ({ isChanges: false }),
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });
  return render(
    <Provider store={store}>
      <AssignGrade {...props} />
    </Provider>
  );
}

describe('homework approved evaluation navigation', () => {
  const writes: string[] = [];

  beforeEach(() => {
    writes.length = 0;
    vi.clearAllMocks();
    clearCachedAuthSession();
    mswServer.use(
      http.get(
        /https:\/\/api\.(iconify\.design|simplesvg\.com|unisvg\.com)\/.+\.json/,
        ({ request }) => {
          const url = new URL(request.url);
          const icons = Object.fromEntries(
            (url.searchParams.get('icons') ?? '')
              .split(',')
              .filter(Boolean)
              .map((name) => [name, { body: '<path />' }])
          );
          return HttpResponse.json({
            prefix: url.pathname.slice(1, -5),
            icons,
            width: 24,
            height: 24,
          });
        }
      ),
      http.get('*/api/auth/session', () => HttpResponse.json(null)),
      http.get('*/api/academic/rubrics', () => HttpResponse.json([rubric])),
      http.get('*/api/academic/rubrics/rubric-1/evaluations', () =>
        HttpResponse.json([evaluation('student-1', 2), evaluation('student-2', 0)])
      ),
      http.post('*/api/academic/rubrics/*', ({ request }) => {
        writes.push(request.url);
        return HttpResponse.json(evaluation('student-1', 0));
      }),
      http.patch('*/api/homework/*', ({ request }) => {
        writes.push(request.url);
        return HttpResponse.json({});
      })
    );
  });

  it('disables approved scores, comments, feedback and updates, then advances without any write or required feedback validation', async () => {
    renderForm();
    await screen.findByText(/This evaluation is approved and locked/);
    expect(screen.getByRole('spinbutton', { name: 'Marks' })).toBeDisabled();
    expect(screen.queryByRole('textbox', { name: 'Understanding Feedback' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: 'Overall rubric feedback (optional)' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Feedback *' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Quick Templates' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^Submit$/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Submit & Next' }));
    expect(baseProps.onNext).toHaveBeenCalledOnce();
    expect(writes).toEqual([]);
    expect(screen.queryByText('Feedback is required')).not.toBeInTheDocument();
  });

  it('keeps Submit & Next unavailable for the last approved student', async () => {
    renderForm({ ...baseProps, hasNext: false });
    await screen.findByText(/This evaluation is approved and locked/);
    expect(screen.getByRole('button', { name: 'Submit & Next' })).toBeDisabled();
    expect(writes).toEqual([]);
  });

  it('keeps writes and editing blocked when rubric status cannot be loaded', async () => {
    mswServer.use(
      http.get('*/api/academic/rubrics', () =>
        HttpResponse.json({ detail: 'Unavailable' }, { status: 500 })
      )
    );
    renderForm();
    await screen.findByRole('button', { name: 'Retry' });
    expect(screen.getByRole('button', { name: 'Submit & Next' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Feedback *' })).toBeDisabled();
    expect(writes).toEqual([]);
  });

  it('still saves scores, submits, approves and updates feedback for an editable evaluation', async () => {
    mswServer.use(
      http.get('*/api/academic/rubrics/rubric-1/evaluations', () =>
        HttpResponse.json([evaluation('student-1', 0)])
      )
    );
    renderForm({ ...baseProps, data: { ...baseProps.data!, feedback: 'Great work' } });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Submit & Next' })).toBeEnabled()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit & Next' }));
    await waitFor(() => expect(baseProps.onNext).toHaveBeenCalledOnce());
    expect(writes.map((url) => new URL(url).pathname)).toEqual([
      '/api/academic/rubrics/rubric-1/evaluations',
      '/api/academic/rubrics/evaluations/evaluation-student-1/submit',
      '/api/academic/rubrics/evaluations/evaluation-student-1/approve',
      '/api/homework/homework-1/submissions/student-1/feedback',
    ]);
  });

  it('unlocks the next student while keeping a published rubric editable for draft evaluations', async () => {
    function StudentSequence() {
      const [student, setStudent] = useState(baseProps.data);
      return (
        <AssignGrade
          {...baseProps}
          data={student}
          onNext={() =>
            setStudent({
              ...baseProps.data!,
              id: 'submission-2',
              studentId: 'student-2',
              studentName: 'Next Student',
              status: '3',
              feedback: 'Keep practising',
            })
          }
        />
      );
    }
    const store = configureStore({
      reducer: {
        [api.reducerPath]: api.reducer,
        globalState: () => ({ currentMedium: { id: 'medium-1' } }),
        confirmPopup: () => ({ isChanges: false }),
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
    });
    render(
      <Provider store={store}>
        <StudentSequence />
      </Provider>
    );
    await screen.findByText(/This evaluation is approved and locked/);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Submit & Next' })).toBeEnabled()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit & Next' }));
    await screen.findByText('Next Student');
    await waitFor(() => expect(screen.getByRole('spinbutton', { name: 'Marks' })).toBeEnabled());
    expect(screen.getByRole('textbox', { name: 'Feedback *' })).toBeEnabled();
    expect(screen.getByRole('button', { name: /^Update$/ })).toBeEnabled();
    expect(writes).toEqual([]);
  });
});
