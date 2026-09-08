import { screen } from '@testing-library/react';
import { vi, it, expect, describe } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';

import CalendarDayTextFields from './CalendarDayTextFields';
import {
  CALENDAR_DAY_TITLE_MAX_LENGTH,
  CALENDAR_DAY_DESCRIPTION_MAX_LENGTH,
} from '../calendarDay.constants';

describe('CalendarDayTextFields', () => {
  it('exposes matching native limits and visible character counters', () => {
    renderWithProviders(
      <CalendarDayTextFields
        title="Sports Day"
        description="Annual athletics programme"
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Title *')).toHaveAttribute(
      'maxlength',
      String(CALENDAR_DAY_TITLE_MAX_LENGTH)
    );
    expect(screen.getByLabelText('Description')).toHaveAttribute(
      'maxlength',
      String(CALENDAR_DAY_DESCRIPTION_MAX_LENGTH)
    );
    expect(screen.getByText(`10 / ${CALENDAR_DAY_TITLE_MAX_LENGTH}`)).toBeInTheDocument();
    expect(screen.getByText(`26 / ${CALENDAR_DAY_DESCRIPTION_MAX_LENGTH}`)).toBeInTheDocument();
  });

  it('preserves spaces, punctuation, and line breaks in user descriptions', () => {
    const description = 'A festival celebrating Ganesha.\nFamilies gather together. ';

    renderWithProviders(
      <CalendarDayTextFields
        title="Ganesh Chaturthi"
        description={description}
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Description')).toHaveValue(description);
  });

  it('removes legacy examination metadata without changing normal descriptions', () => {
    renderWithProviders(
      <CalendarDayTextFields
        title="Exam Day"
        description="Final exam. Auto-created from examination schedule. ExamId: abc-123"
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Description')).toHaveValue('Final exam');
  });

  it('announces field-specific validation errors', () => {
    renderWithProviders(
      <CalendarDayTextFields
        title="Oversized title"
        description="Oversized description"
        titleError="Title cannot exceed 256 characters"
        descriptionError="Description cannot exceed 1,024 characters"
        onChange={vi.fn()}
        onBlur={vi.fn()}
      />
    );

    const alerts = screen.getAllByRole('alert');
    expect(alerts[0]).toHaveTextContent('Title cannot exceed 256 characters');
    expect(alerts[1]).toHaveTextContent('Description cannot exceed 1,024 characters');
  });
});
