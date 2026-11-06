import { vi, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyProfileSubmission from 'src/components/studentProfile/studentProfileHomeworkAssignment';

import Library from './libraray';
import Transport from './transport';
import StudentCalendar from './StudentCalendar';
import StudentDashboard from './studentDashboard';

const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ auth: { permissions: [] } }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: (...args: unknown[]) => {
    mocks.query(...args);
    return { data: [] };
  },
}));
vi.mock('src/redux/memberManagement/memberManagementApi', () => ({
  useGetIssuedBooksQuery: vi.fn(),
  useGetFinesChargesQuery: vi.fn(),
  useGetReservedBooksQuery: vi.fn(),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: () => <div>Unscoped library table</div>,
}));
vi.mock(
  'src/screens/academic/homework-assignment-management/mySubmission/myHomeworkSubmission',
  () => ({ default: () => <div>Unscoped homework</div> })
);
vi.mock(
  'src/screens/academic/homework-assignment-management/mySubmission/myAssignmentSubmission',
  () => ({ default: () => <div>Fixture assignments</div> })
);
vi.mock('src/components/calender', () => ({ default: () => <div>Empty calendar</div> }));
vi.mock('src/components/studentProfile/academicTimetable', () => ({
  default: () => <div>Unscoped timetable</div>,
}));
vi.mock('./studentDashbordComponent', () => ({ default: () => null }));
vi.mock('./studentDashbordComponent/attendanceTrend', () => ({ default: () => null }));
vi.mock('./studentDashbordComponent/studentProfileExamsList', () => ({ default: () => null }));
vi.mock('./studentDashbordComponent/subjectPerformanceDetails', () => ({ default: () => null }));
vi.mock('./studentDashbordComponent/studentDashboardHomework', () => ({ default: () => null }));
vi.mock('./studentDashbordComponent/subjectsTeachersStudentDashboard', () => ({
  default: () => null,
}));

const student = { studentId: 'selected-student', firstName: 'Asha' } as any;

it('does not load library mocks as the selected student’s loans', () => {
  render(<Library student={student} />);
  expect(mocks.query).not.toHaveBeenCalled();
  expect(screen.getByText('Student library records are unavailable here.')).toBeInTheDocument();
});

it('does not offer a transport request without a connected action', () => {
  render(<Transport student={student} />);
  expect(screen.queryByRole('button', { name: 'Request Transport' })).not.toBeInTheDocument();
  expect(screen.getByText('Student transport records are unavailable here.')).toBeInTheDocument();
});

it('does not render fixture assignments or medium-wide homework as student submissions', () => {
  render(<MyProfileSubmission />);
  expect(screen.queryByText('Fixture assignments')).not.toBeInTheDocument();
  expect(screen.queryByText('Unscoped homework')).not.toBeInTheDocument();
  expect(
    screen.getByText('Student homework and assignments are unavailable here.')
  ).toBeInTheDocument();
});

it('distinguishes an unavailable student calendar from no events', () => {
  render(<StudentCalendar student={student} />);
  expect(screen.queryByText('No calendar events found.')).not.toBeInTheDocument();
  expect(screen.getByText('Student calendar events are unavailable here.')).toBeInTheDocument();
});

it('does not mount a timetable without the student’s class context in School activity', () => {
  render(<StudentDashboard student={student} />);
  expect(screen.queryByText('Unscoped timetable')).not.toBeInTheDocument();
  expect(
    screen.getByText('Student school activity summary is unavailable here.')
  ).toBeInTheDocument();
});
