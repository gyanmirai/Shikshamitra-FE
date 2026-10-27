import { vi, it, expect, beforeEach } from 'vitest';
import { studentPaths } from 'src/constants/student-menu';
import { financePermissions } from 'src/constants/finance-menu';
import { render, screen, fireEvent } from '@testing-library/react';

import { StudentProfile } from './index';

const state = vi.hoisted(() => ({
  params: new URLSearchParams(),
  push: vi.fn(),
  close: vi.fn(),
  viewProps: {} as any,
  boundaryYear: undefined as any,
  permissions: [] as { name: string; isGranted: boolean }[],
  student: { id: 'student-1', studentId: 'student-1', firstName: 'Riya', lastName: 'Shah' },
  year: { id: 'year-1', name: '2026–27' },
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      auth: { permissions: state.permissions },
      globalState: { currentYear: state.year },
    }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: state.push }),
  useSearchParams: () => state.params,
}));
vi.mock('src/routes/components', () => ({
  RouterLink: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading, onBack }: any) => (
    <header>
      <h1>{heading}</h1>
      <button type="button" onClick={onBack}>
        Back to list
      </button>
    </header>
  ),
}));
vi.mock('src/screens/student/records/student-directory', () => ({
  default: ({ rowActions }: any) => (
    <>
      <h1>Student List</h1>
      {rowActions?.(state.student).map((action: any) =>
        action.href ? (
          <a key={action.id} href={action.href}>
            {action.label}
          </a>
        ) : (
          <button key={action.id} type="button" onClick={action.onClick}>
            {action.label}
          </button>
        )
      )}
    </>
  ),
}));
vi.mock('./finance', () => ({ default: () => null }));
vi.mock('./libraray', () => ({ default: () => null }));
vi.mock('./academic', () => ({ default: () => null }));
vi.mock('./document', () => ({ default: () => null }));
vi.mock('./attendance', () => ({ default: () => null }));
vi.mock('./communication', () => ({ default: () => null }));
vi.mock('./StudentCalendar', () => ({ default: () => null }));
vi.mock('./studentDashboard', () => ({ default: () => null }));
vi.mock('./transport', () => ({ default: () => null }));
vi.mock('./student-profile-view', () => ({
  StudentProfileView: (props: any) => {
    const { student, onFormEditingChange } = props;
    state.viewProps = props;
    return (
      <>
        <div>Profile for {student.studentId}</div>
        <button type="button" onClick={() => onFormEditingChange(true)}>
          Begin editing
        </button>
        <button type="button" onClick={() => onFormEditingChange(false)}>
          Finish editing
        </button>
      </>
    );
  },
}));
vi.mock('./student-profile-data-boundary', () => ({
  StudentProfileDataBoundary: ({ header, studentId, children, academicYearContext }: any) => {
    state.boundaryYear = academicYearContext;
    return (
      <>
        {header}
        {children({ ...state.student, studentId }, vi.fn())}
      </>
    );
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  state.params = new URLSearchParams();
  state.permissions = [];
  state.year = { id: 'year-1', name: '2026–27' };
});

it('uses Student Directory with no unauthorised row actions', () => {
  render(<StudentProfile />);
  expect(screen.getByRole('heading', { name: 'Student List' })).toBeVisible();
  expect(
    screen.queryByRole('link', { name: /Edit Details|Change Status|Attendance History/ })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Assign fee structure/ })).not.toBeInTheDocument();
});

it.each([['View'], ['Add'], ['View', 'Add']])(
  'does not expose list fee assignment with Finance grants %j',
  (...actions) => {
    state.permissions = [
      ...actions.map((action) => ({
        name: `${financePermissions.fees.structureAssign}.${action}`,
        isGranted: true,
      })),
    ];
    render(<StudentProfile />);
    expect(screen.queryByRole('button', { name: /Assign fee structure/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  }
);

it('routes authorised status edits through the existing audited change request', () => {
  state.permissions = ['Students.Records.Changes.View', 'Students.Records.Changes.Add'].map(
    (name) => ({ name, isGranted: true })
  );
  render(<StudentProfile />);
  expect(screen.getByRole('link', { name: 'Change Status' })).toHaveAttribute(
    'href',
    `${studentPaths.records.changes}?mode=new&student=student-1&section=status`
  );
});

it('orders edit and attendance shortcuts before governed status changes without fee assignment', () => {
  state.params = new URLSearchParams(
    'board=board-1&medium=medium-1&class=class-1&division=division-1&page=2'
  );
  state.permissions = [
    'Students.Records.Changes.View',
    'Students.Records.Changes.Add',
    `${financePermissions.fees.structureAssign}.View`,
    `${financePermissions.fees.structureAssign}.Add`,
    'Students.Attendance.MarkAttendance.View',
  ].map((name) => ({ name, isGranted: true }));
  render(<StudentProfile />);
  const actions = Array.from(document.querySelectorAll('a, button'))
    .map((element) => element.textContent)
    .filter(Boolean);
  expect(actions).toEqual([
    'Edit Details for Riya Shah',
    'Attendance History for Riya Shah',
    'Change Status',
  ]);
  const edit = new URL(
    screen.getByRole('link', { name: 'Edit Details for Riya Shah' }).getAttribute('href')!,
    'http://localhost'
  );
  expect(edit.pathname).toBe(studentPaths.records.studentList);
  expect(Object.fromEntries(edit.searchParams)).toEqual({
    board: 'board-1',
    medium: 'medium-1',
    class: 'class-1',
    division: 'division-1',
    page: '2',
    student: 'student-1',
    view: 'details',
    edit: 'details',
  });
  const attendance = new URL(
    screen.getByRole('link', { name: 'Attendance History for Riya Shah' }).getAttribute('href')!,
    'http://localhost'
  );
  expect(attendance.searchParams.get('view')).toBe('attendance');
  expect(attendance.searchParams.has('edit')).toBe(false);
});

it('shows attendance alone without exposing editing or fee assignment grants', () => {
  state.permissions = [{ name: 'Students.Attendance.MarkAttendance.View', isGranted: true }];
  render(<StudentProfile />);
  expect(screen.getByRole('link', { name: 'Attendance History for Riya Shah' })).toBeVisible();
  expect(
    screen.queryByRole('link', { name: 'Edit Details for Riya Shah' })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Change Status' })).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Assign fee structure for Riya Shah' })
  ).not.toBeInTheDocument();
});

it('opens a selected profile and returns to the preserved list filters and page', () => {
  state.params = new URLSearchParams(
    'student=student-1&population=Former&board=board-1&medium=medium-1&class=class-1&division=division-1&search=Riya&page=2&view=details&edit=details'
  );
  render(<StudentProfile />);
  expect(screen.getByText('Profile for student-1')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Back to list' }));
  const url = new URL(state.push.mock.calls[0][0], 'http://localhost');
  expect(url.pathname).toBe(studentPaths.records.studentList);
  expect(Object.fromEntries(url.searchParams)).toEqual({
    population: 'Former',
    board: 'board-1',
    medium: 'medium-1',
    class: 'class-1',
    division: 'division-1',
    search: 'Riya',
    page: '2',
  });
});

it('routes the breadcrumb Back button through the active form navigation guard', () => {
  state.params = new URLSearchParams('student=student-1&view=details&search=Riya');
  render(<StudentProfile />);
  let proceed: (() => void) | undefined;
  state.viewProps.onNavigationGuardChange((next: () => void) => {
    proceed = next;
  });
  fireEvent.click(screen.getByRole('button', { name: 'Back to list' }));
  expect(state.push).not.toHaveBeenCalled();
  proceed?.();
  expect(state.push).toHaveBeenCalledWith(expect.stringContaining('search=Riya'));
});

it('retains the editing academic context through a global year change until the form finishes', () => {
  state.params = new URLSearchParams('student=student-1&view=details');
  const workspace = render(<StudentProfile />);
  fireEvent.click(screen.getByRole('button', { name: 'Begin editing' }));
  expect(state.boundaryYear?.id).toBe('year-1');
  state.year = { id: 'year-2', name: '2027–28' };
  workspace.rerender(<StudentProfile />);
  expect(state.boundaryYear?.id).toBe('year-1');
  expect(state.viewProps.academicYearContext?.id).toBe('year-1');
  fireEvent.click(screen.getByRole('button', { name: 'Finish editing' }));
  expect(state.boundaryYear).toBeUndefined();
});
