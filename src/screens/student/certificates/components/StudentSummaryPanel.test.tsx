import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import StudentSummaryPanel from './StudentSummaryPanel';

import type { SelectedStudent } from './StudentSearchPanel';

vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data }: { data: { certNo: string }[] }) => (
    <table aria-label="Certificate history">
      <tbody>
        {data.map((row) => (
          <tr key={row.certNo}>
            <td>{row.certNo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

const student: SelectedStudent = {
  id: 'student-1',
  name: 'Summary test student',
  firstName: 'Summary',
  middleName: '',
  lastName: 'Student',
  grNo: 'GR-1',
  organizationId: 'organization-1',
  standardId: 'class-6',
  divisionId: 'division-a',
  className: 'Class 6',
  divisionName: 'A',
};

const show = (selectedStudent: SelectedStudent | null, isLoading = false) =>
  render(
    <ThemeProvider theme={createTheme()}>
      <StudentSummaryPanel selectedStudent={selectedStudent} isLoading={isLoading} />
    </ThemeProvider>
  );

it('retains student identity without presenting fabricated certificate history or counts', () => {
  show(student);
  expect(screen.getByText(student.name)).toBeVisible();
  expect(screen.getByText('GR-1')).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(
    'Certificate history is unavailable in this view.'
  );
  expect(screen.queryByText('Certificates Generated')).not.toBeInTheDocument();
  expect(screen.queryByText(/BON-2026|CHA-2026|FT-2026/)).not.toBeInTheDocument();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('preserves the no-selection state', () => {
  show(null);
  expect(screen.getByText('No Student Selected')).toBeVisible();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('does not display stale identity or history while the profile is loading', () => {
  show(student, true);
  expect(screen.queryByText(student.name)).not.toBeInTheDocument();
  expect(screen.queryByText('No Student Selected')).not.toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
