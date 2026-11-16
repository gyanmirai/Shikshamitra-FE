// @vitest-environment jsdom

import type { PropsWithChildren } from 'react';

import { useState } from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { mswServer } from 'src/test/mswServer';
import { http, delay, HttpResponse } from 'msw';
import { vi, it, expect, describe } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useGetHomeworkSubmissionsQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/HomeworkAssessmentAndFeedbackApi';
import { useGetAssignmentSubmissionsQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/AssignmentAssessmentAndFeedbackApi';

import EvaluationSubmissionDetail from './evaluationSubmissionDetail';

import type { TStudentGrade } from '../homeworkCreation/type';

vi.hoisted(() => vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4199'));

describe.each(['homework', 'assignment'] as const)('%s selected submission content', mode => {
  it('loads the complete narrow roster once and fetches only the selected answer, isolating late results', async () => {
    const listRequests: URL[] = [];
    const detailRequests: string[] = [];
    const rows = ['one', 'two', 'absent'].map((studentId, index) => ({
      id: index === 2 ? '00000000-0000-0000-0000-000000000000' : `submission-${studentId}`,
      studentId, studentName: `Student ${studentId}`, rollNumber: String(index + 1),
      status: index === 2 ? 0 : 1, submittedContent: null,
    } as unknown as TStudentGrade));
    const path = mode === 'homework' ? 'homework' : 'assignments';
    mswServer.use(
      http.get(/\/api\/auth\/session$/, () => HttpResponse.json(null)),
      http.get(`http://localhost:4199/api/${path}/submissions`, ({ request }) => {
        listRequests.push(new URL(request.url));
        return HttpResponse.json({ data: rows, summary: { totalStudents: 3, submitted: 2, notSubmitted: 1 } });
      }),
      http.get(`http://localhost:4199/api/${path}/task/submissions/:studentId`, async ({ params, request }) => {
        const studentId = String(params.studentId);
        detailRequests.push(studentId);
        const url = new URL(request.url);
        expect(url.searchParams.get('academicMediumId')).toBe('medium');
        expect(url.searchParams.get('ClassId')).toBe('class');
        expect(url.searchParams.get('DivisionId')).toBe('division');
        expect(url.searchParams.get('SubjectId')).toBe('subject');
        if (studentId !== 'two') await delay(120);
        return HttpResponse.json({ ...rows.find(row => row.studentId === studentId), submittedContent: studentId === 'absent' ? null : `Answer ${studentId}` });
      })
    );
    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer },
      middleware: getDefault => getDefault().concat(api.middleware),
    });
    const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
    function Workspace() {
      const [selected, setSelected] = useState<TStudentGrade | null>(null);
      const params = {
        academicMediumId: 'medium', ClassId: 'class', DivisionId: 'division', SubjectId: 'subject',
        HomeworkId: 'task', AssignmentId: 'task', Lightweight: true,
      };
      const homework = useGetHomeworkSubmissionsQuery(params, { skip: mode !== 'homework' });
      const assignment = useGetAssignmentSubmissionsQuery(params, { skip: mode !== 'assignment' });
      const cohort = mode === 'homework' ? homework.currentData : assignment.currentData;
      return <>
        <span>Students: {cohort?.summary?.totalStudents}</span>
        {cohort?.data.map((student: TStudentGrade) => <button type="button" key={student.studentId} onClick={() => setSelected(student)}>{student.studentName}</button>)}
        <EvaluationSubmissionDetail mode={mode} open={Boolean(selected)} academicMediumId="medium" taskId="task"
          classId="class" divisionId="division" subjectId="subject" student={selected}>
          {student => <span>{student.submittedContent ?? 'No submitted answer'}</span>}
        </EvaluationSubmissionDetail>
      </>;
    }
    render(<Workspace />, { wrapper });
    await screen.findByText('Students: 3');
    expect(listRequests).toHaveLength(1);
    expect(listRequests[0].searchParams.get('Lightweight')).toBe('true');
    expect(detailRequests).toEqual([]);
    expect(screen.getByRole('button', { name: 'Student absent' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Student one' }));
    await waitFor(() => expect(detailRequests).toEqual(['one']));
    expect(screen.getByRole('status', { name: 'Loading student submission' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Student two' }));
    await screen.findByText('Answer two');
    await delay(180);
    expect(screen.queryByText('Answer one')).not.toBeInTheDocument();
    expect(detailRequests).toEqual(['one', 'two']);
    fireEvent.click(screen.getByRole('button', { name: 'Student absent' }));
    expect(screen.queryByText('Answer two')).not.toBeInTheDocument();
    await screen.findByText('No submitted answer');
    expect(detailRequests).toEqual(['one', 'two', 'absent']);
    expect(listRequests).toHaveLength(1);
    store.dispatch(api.util.resetApiState());
  });
});
