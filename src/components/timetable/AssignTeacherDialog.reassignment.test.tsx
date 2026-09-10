import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { act, screen, waitFor, fireEvent } from '@testing-library/react';
import { subjectAssignmentsApi } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import { prepareProgressNetwork } from 'src/screens/academic/course-management/lessonPlan/components/lesson-plan-progress-test-fixture';

import AssignTeacherDialog from './AssignTeacherDialog';
import {
  slots,
  subjects,
  assignmentResponse,
  renderTeacherFixture,
  createTeacherTestStore,
} from './teacher-reassignment-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
beforeEach(prepareProgressNetwork);
const url = '*/api/academics/curriculum/subject-assignments/math-group';
const props = {
  open: { day: 'MONDAY' as const, slotIndex: 0, subjects },
  slots,
  standardId: 'class-12',
  divisionId: 'division-a',
  onClose: vi.fn(),
};

it('refreshes cached allocations, blocks the old teacher, and keeps the paired teacher and rooms', async () => {
  let teacherId = 'akshay';
  let requests = 0;
  mswServer.use(
    http.get(url, () => {
      requests += 1;
      return HttpResponse.json(assignmentResponse(teacherId));
    })
  );
  const store = createTeacherTestStore();
  const cached = store.dispatch(
    subjectAssignmentsApi.endpoints.getSubjectAssignmentById.initiate({
      assignmentId: 'math-group',
    })
  );
  await cached.unwrap();
  cached.unsubscribe();
  teacherId = 'parth';
  const onSave = vi.fn();
  renderTeacherFixture(<AssignTeacherDialog {...props} onSave={onSave} />, store);
  expect(
    await screen.findByText(
      'This teacher is no longer allocated to this subject. Select a current teacher.'
    )
  ).toBeVisible();
  expect(requests).toBeGreaterThan(1);
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  fireEvent.click(screen.getAllByRole('button', { name: 'Open' })[0]);
  expect(screen.queryByRole('option', { name: 'Akshay Patel' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('option', { name: 'Parth Ghusar' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  });
  expect(onSave).toHaveBeenCalledWith(
    'MONDAY',
    0,
    [{ ...subjects[0], teacherId: 'parth', teacherName: 'Parth Ghusar' }, subjects[1]],
    { applyTeacherToAllSubjectSlots: {} }
  );
});

it('shows a failed lookup and blocks saving stale selections', async () => {
  mswServer.use(http.get(url, () => HttpResponse.json({ detail: 'Unavailable' }, { status: 500 })));
  renderTeacherFixture(<AssignTeacherDialog {...props} onSave={vi.fn()} />);
  expect(
    (
      await screen.findAllByText(
        'Unable to load the current teachers. Reopen this dialog to retry.'
      )
    )[0]
  ).toBeVisible();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
});

it('explains a missing allocation reference instead of showing an unexplained empty dropdown', async () => {
  renderTeacherFixture(
    <AssignTeacherDialog
      {...props}
      open={{
        ...props.open,
        subjects: [{ ...subjects[0], subjectAssignmentId: '00000000-0000-0000-0000-000000000000' }],
      }}
      onSave={vi.fn()}
    />
  );
  expect(
    screen.getByText('Subject allocation is unavailable. Refresh the timetable and try again.')
  ).toBeVisible();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
});
