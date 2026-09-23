import { screen } from '@testing-library/react';
import { vi, it, expect, describe } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';

import { StudentDetailsDialog } from './ResultCreation';

vi.mock('react-to-print', () => ({
  useReactToPrint: () => vi.fn(),
}));

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => ({
    isLoading: false,
    data: {
      studentName: 'Advait Badgujar',
      grNo: '10013',
      rollNo: '1',
      dateOfBirth: '2019-01-01',
      className: 'LKG',
      divisionName: 'A',
      examName: 'Hindi oral exam',
      grade: 'B',
      rank: 1,
      totalStudentsInClass: 1,
      totalMarks: '100.00',
      obtainedMarks: '55.00',
      attendancePercentage: 92,
      percentage: '55%',
      status: 'PASS',
      subjects: [
        {
          subjectName: 'Hindi',
          maxMarks: '100.00',
          marksObtained: '55.00',
          grade: 'B',
          isPassed: true,
        },
      ],
    },
  }),
}));

vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data }: { data: Array<{ subjectName: string }> }) => (
    <div aria-label="Student subject results">
      {data.map((subject) => (
        <span key={subject.subjectName}>{subject.subjectName}</span>
      ))}
    </div>
  ),
}));

describe('StudentDetailsDialog', () => {
  it('ends the preview after scholastic marks without a calculation explanation', () => {
    renderWithProviders(
      <StudentDetailsDialog
        open
        onClose={vi.fn()}
        row={{ StudentId: 'student-1' }}
        examId="exam-1"
        examName="Hindi oral exam"
      />
    );

    expect(screen.getByText('Marks Obtained (Scholastic Areas)')).toBeVisible();
    expect(screen.getByLabelText('Student subject results')).toHaveTextContent('Hindi');
    expect(screen.queryByText('Calculation Explanation')).not.toBeInTheDocument();
    expect(screen.queryByText(/Percentage is calculated from/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Print Result' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save PDF' })).toBeVisible();
  });
});
