import { vi, expect, describe, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from 'src/test/test-utils';

import { TimetablePreviewDialog } from './TimetablePreviewDialog';

vi.mock('src/components/timetable/TimetableBoard', () => ({
  default: () => <div>Preview board</div>,
}));

const slots = {
  MONDAY: [],
  TUESDAY: [],
  WEDNESDAY: [],
  THURSDAY: [],
  FRIDAY: [],
  SATURDAY: [],
};

describe('TimetablePreviewDialog', () => {
  it('renders the preview on an opaque paper with a dark viewport scrim', () => {
    renderWithProviders(
      <TimetablePreviewDialog
        open
        onClose={vi.fn()}
        slots={slots}
        subjects={[]}
        selectedClass="12"
        selectedDivision="A"
        standardId="standard-id"
        divisionId="division-id"
        timetableStatus={1}
      />
    );

    const paper = screen.getByRole('dialog');
    const surface = screen.getByTestId('timetable-preview-surface');
    const backdrop = document.querySelector('.MuiBackdrop-root');

    expect(getComputedStyle(paper).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(paper).backgroundImage).toBe('none');
    expect(getComputedStyle(surface).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(backdrop).not.toBeNull();
    expect(getComputedStyle(backdrop as Element).backgroundColor).toBe('rgba(0, 0, 0, 0.6)');
    expect(screen.getByText('Preview board')).toBeVisible();
  });
});
