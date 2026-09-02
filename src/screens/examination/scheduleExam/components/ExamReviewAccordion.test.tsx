import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { ExamReviewAccordion } from './ExamReviewAccordion';

vi.mock('src/components/iconify', () => ({
  Iconify: () => <span aria-hidden="true" />,
}));

describe('ExamReviewAccordion', () => {
  it('keeps the edit action separate from the accordion toggle', () => {
    const onEdit = vi.fn();
    const { container } = render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ExamReviewAccordion
          title="Basic Details"
          description="Exam configuration and schedule info"
          icon="healthicons:i-exam-multiple-choice"
          onEdit={onEdit}
        >
          Review content
        </ExamReviewAccordion>
      </ThemeProvider>
    );

    const editButton = screen.getByRole('button', { name: 'Edit Basic Details' });
    const accordionToggle = container.querySelector('.MuiAccordionSummary-root');

    expect(container.querySelector('button button')).toBeNull();
    expect(accordionToggle).not.toContainElement(editButton);

    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledOnce();
  });
});
