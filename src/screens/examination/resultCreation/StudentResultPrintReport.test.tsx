import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import StudentResultPrintReport from './StudentResultPrintReport';

describe('StudentResultPrintReport', () => {
  it('renders a static result report without interactive table or modal controls', () => {
    render(
      <StudentResultPrintReport
        schoolName="Shiksha Mitra Public School"
        examName="Final Exam"
        studentName="Mira Chauhan"
        grNo="10116"
        rollNo="2"
        className="Class 10"
        divisionName="A"
        obtainedMarks="75"
        totalMarks="100"
        percentage="75%"
        grade="S+"
        status="PASS"
        subjects={[
          {
            subjectName: 'Mathematics',
            maxMarks: 100,
            marksObtained: 75,
            grade: 'S+',
            isPassed: true,
          },
        ]}
      />
    );

    expect(screen.getByText('Mira Chauhan')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Subject-wise student result' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('Rows per page:')).not.toBeInTheDocument();
  });
});
