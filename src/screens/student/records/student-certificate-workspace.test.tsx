import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import StudentCertificateWorkspace from './student-certificate-workspace';

const state = vi.hoisted(() => ({
  params: '',
  year: 'year-1',
  canIssue: true,
  deferNavigation: false,
  pendingParams: '',
  student: {
    id: 'ravi',
    studentId: 'ravi',
    firstName: 'Ravi',
    lastName: 'Shah',
    academicYearId: 'year-1',
    standardName: 'Class 5',
    divisionName: 'A',
    maskedFields: [],
  },
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/student/certificates',
  useSearchParams: () => new URLSearchParams(state.params),
  useRouter: () => ({
    replace: (url: string) => {
      const next = url.split('?')[1] ?? '';
      if (state.deferNavigation) state.pendingParams = next;
      else state.params = next;
    },
    push: vi.fn(),
  }),
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      globalState: { currentYear: { id: state.year } },
      auth: {
        permissions: [
          { name: 'Students.Records.Certificates.View', isGranted: true },
          { name: 'Students.Records.Certificates.Add', isGranted: state.canIssue },
        ],
      },
    }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/custom-tabs', () => ({
  CustomTabs: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('@mui/x-date-pickers/DatePicker', () => ({ DatePicker: () => <div>Generated month</div> }));
vi.mock('src/components/customizabaleTable', () => ({ default: () => <div>Batch table</div> }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading, action }: any) => (
    <header>
      <h1>{heading}</h1>
      {action}
    </header>
  ),
}));
vi.mock('./records-student-picker', () => ({
  default: ({ onSelect, onSearchInput }: any) => (
    <div>
      <button type="button" onClick={() => onSelect(state.student)}>
        Select Ravi
      </button>
      <button
        type="button"
        onClick={() => {
          onSearchInput?.();
          onSelect(null);
        }}
      >
        Clear student
      </button>
    </div>
  ),
}));
vi.mock('./components/certificate-history-table', () => ({
  default: ({ studentId }: any) => <div>History for {studentId}</div>,
}));
vi.mock('./components/certificate-generation-drawer', () => ({
  default: ({ students }: any) => (
    <div role="dialog" aria-label="Generate Certificate">
      Generating for {students[0].firstName}
    </div>
  ),
}));
vi.mock('src/redux/student/records/student-records-api', () => ({
  useGetStudentRecordsDirectoryQuery: (input: any, options: any) => ({
    currentData: {
      items: options?.skip
        ? []
        : input.studentId === 'ravi'
          ? [state.student]
          : input.studentId === 'asha'
            ? [
                {
                  ...state.student,
                  id: 'asha',
                  studentId: 'asha',
                  firstName: 'Asha',
                  lastName: 'Patel',
                },
              ]
            : [],
    },
    isFetching: false,
    isError: false,
  }),
}));
vi.mock('src/redux/student/records/student-record-documents-api', () => ({
  useGetRecordCertificateBatchesQuery: () => ({ currentData: { items: [], totalCount: 0 } }),
}));

beforeEach(() => {
  state.params = '';
  state.year = 'year-1';
  state.canIssue = true;
  state.deferNavigation = false;
  state.pendingParams = '';
});

it('starts with student search and no history or generation action', () => {
  render(<StudentCertificateWorkspace />);
  expect(screen.getByRole('button', { name: 'Select Ravi' })).toBeInTheDocument();
  expect(screen.queryByText(/History for/)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Generate certificate/i })).not.toBeInTheDocument();
});

it('generates only for the explicitly selected student and clears that capability with selection', () => {
  const view = render(<StudentCertificateWorkspace />);
  fireEvent.click(screen.getByRole('button', { name: 'Select Ravi' }));
  view.rerender(<StudentCertificateWorkspace />);
  expect(screen.getByText('History for ravi')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Generate certificate for Ravi Shah' }));
  expect(screen.getByText('Generating for Ravi')).toBeInTheDocument();
});

it('removes history and issuance while the selected student is cleared', () => {
  state.params = 'student=ravi&year=year-1';
  const view = render(<StudentCertificateWorkspace />);
  expect(screen.getByText('History for ravi')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear student' }));
  view.rerender(<StudentCertificateWorkspace />);
  expect(screen.queryByText(/History for/)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Generate certificate/i })).not.toBeInTheDocument();
});

it('retains view-only history and clears the selected context after an academic-year change', () => {
  state.params = 'student=ravi&year=year-1';
  state.canIssue = false;
  const view = render(<StudentCertificateWorkspace />);
  expect(screen.getByText('History for ravi')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Generate certificate/i })).not.toBeInTheDocument();
  state.year = 'year-2';
  view.rerender(<StudentCertificateWorkspace />);
  expect(screen.queryByText(/History for/)).not.toBeInTheDocument();
});

it('uses the newly selected student immediately while URL navigation is still pending', () => {
  state.params = 'student=asha&year=year-1';
  state.deferNavigation = true;
  render(<StudentCertificateWorkspace />);
  expect(
    screen.getByRole('button', { name: 'Generate certificate for Asha Patel' })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Select Ravi' }));
  expect(
    screen.queryByRole('button', { name: 'Generate certificate for Asha Patel' })
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Generate certificate for Ravi Shah' }));
  expect(screen.getByText('Generating for Ravi')).toBeInTheDocument();
});

it('clears history immediately before the cleared URL has committed', () => {
  state.params = 'student=ravi&year=year-1';
  state.deferNavigation = true;
  render(<StudentCertificateWorkspace />);
  fireEvent.click(screen.getByRole('button', { name: 'Clear student' }));
  expect(screen.queryByText(/History for/)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Generate certificate/i })).not.toBeInTheDocument();
});
