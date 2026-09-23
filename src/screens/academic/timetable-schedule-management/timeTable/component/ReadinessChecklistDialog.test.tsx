import { vi, it, expect, describe } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, fireEvent } from '@testing-library/react';
import { academicPaths } from 'src/constants/academic-menu';

import { ReadinessChecklistDialog } from './ReadinessChecklistDialog';

describe('ReadinessChecklistDialog', () => {
  it('shows a direct setup link for each recognized pending item', () => {
    const onClose = vi.fn();

    renderWithProviders(
      <ReadinessChecklistDialog
        open
        className="Nursery"
        division={{
          divisionName: 'A',
          readinessScore: 50,
          missingItems: [
            'Lecture Slots not configured',
            'Weekly Lectures not configured',
            'Subjects not assigned to standard',
          ],
        }}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Class Nursery · Division A')).toBeVisible();
    expect(screen.getByRole('link', { name: /Configure slots:/i })).toHaveAttribute(
      'href',
      academicPaths.timetable.settings.lectureSlots
    );
    expect(screen.getByRole('link', { name: /Configure lectures:/i })).toHaveAttribute(
      'href',
      academicPaths.timetable.settings.weeklyLectures
    );

    const subjectAllocationLink = screen.getByRole('link', {
      name: /Open subject allocation:/i,
    });
    expect(subjectAllocationLink).toHaveAttribute(
      'href',
      academicPaths.curriculum.subjectsAssignment
    );

    fireEvent.click(subjectAllocationLink);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
