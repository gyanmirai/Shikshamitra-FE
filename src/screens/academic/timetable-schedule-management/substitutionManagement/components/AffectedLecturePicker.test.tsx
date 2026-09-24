import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { AffectedLecturePicker } from './AffectedLecturePicker';

import type { AffectedLectureRow } from '../substitutionData';

const lecture: AffectedLectureRow = {
  id: 'lecture-1',
  period: 'Period 1',
  time: '07:00-07:30',
  startTime: '07:00',
  endTime: '07:30',
  className: '8',
  divisionName: 'A',
  subjectName: 'English',
  roomName: 'B104',
  teacherName: 'Akshay Patel',
};

const defaultProps = {
  lectures: [lecture],
  selectedLectureId: '',
  hasTeacher: true,
  hasAcademicMedium: true,
  hasValidRange: true,
  loading: false,
  loadError: false,
  onSelect: vi.fn(),
};

describe('AffectedLecturePicker', () => {
  it('explains when the academic medium is missing', () => {
    render(<AffectedLecturePicker {...defaultProps} hasAcademicMedium={false} />);

    expect(
      screen.getByText('Select an academic medium to load affected lectures.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Akshay Patel')).not.toBeInTheDocument();
  });

  it('shows the block reason instead of calling every lecture covered', () => {
    render(
      <AffectedLecturePicker
        {...defaultProps}
        lectures={[
          {
            ...lecture,
            canCreateSubstitution: false,
            createSubstitutionBlockReason: 'Lecture ended',
          },
        ]}
      />
    );

    expect(screen.getByRole('button', { name: 'Lecture ended' })).toBeDisabled();
    expect(
      screen.getByText(/published timetable for the selected academic medium/i)
    ).toBeInTheDocument();
  });

  it('shows an empty state when this teacher has no published lectures', () => {
    render(<AffectedLecturePicker {...defaultProps} lectures={[]} />);

    expect(
      screen.getByText('No published timetable lectures are affected in this time window.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Select lecture' })).not.toBeInTheDocument();
  });

  it('distinguishes an existing substitution from an eligible lecture', () => {
    const onSelect = vi.fn();
    render(
      <AffectedLecturePicker
        {...defaultProps}
        onSelect={onSelect}
        lectures={[
          {
            ...lecture,
            id: 'assigned-lecture',
            existingSubstitutionId: 'substitution-1',
            canCreateSubstitution: false,
            createSubstitutionBlockReason: 'Already assigned',
          },
          { ...lecture, id: 'eligible-lecture' },
        ]}
      />
    );

    expect(screen.getByRole('button', { name: 'Already assigned' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Select lecture' }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'eligible-lecture' }));
  });
});
