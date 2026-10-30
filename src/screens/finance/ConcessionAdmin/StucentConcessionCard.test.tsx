import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import StudentInformationAccordion from './StucentConcessionCard';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('concession student information', () => {
  it('shows the six identity items with the returned board and medium names', () => {
    render(
      <StudentInformationAccordion
        student={{
          name: 'Aanya Example',
          grNumber: 'GR-000002AD',
          rollNo: '2',
          standardName: 'Class 1',
          divisionName: 'A',
          boardName: 'CBSE',
          educationMediumName: 'English',
        }}
      />
    );
    expect(screen.getByText('CBSE / English')).toBeVisible();
    expect(screen.getByText('GR-000002AD')).toBeVisible();
    [
      'Student name',
      'GR number',
      'Roll number',
      'Class',
      'Division',
      'Board / medium',
    ].forEach((label) => {
      expect(screen.getByText(label)).toBeVisible();
    });
    expect(screen.getByRole('button', { name: 'Student Information information' })).toBeVisible();
  });
  it('keeps the legacy combined value and does not fabricate missing student information', () => {
    const { rerender } = render(
      <StudentInformationAccordion
        student={{ boardMedium: 'State Board / Marathi', grNumber: 0 }}
      />
    );
    expect(screen.getByText('State Board / Marathi')).toBeVisible();
    expect(screen.getByText('0')).toBeVisible();
    rerender(<StudentInformationAccordion student={null} />);
    expect(screen.getAllByText('—')).toHaveLength(6);
  });
  it('preserves which half of the board and medium pair is unavailable', () => {
    render(<StudentInformationAccordion student={{ educationMediumName: 'English' }} />);
    expect(screen.getByText('— / English')).toBeVisible();
  });
});
