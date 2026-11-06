import { vi, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShikshaMitraAiReportDrawer from 'src/screens/academic/curriculum-management/reports/ShikshaMitraAiReportDrawer';

vi.mock('react-redux', () => ({
  useSelector: (select: (value: unknown) => unknown) =>
    select({
      globalState: {
        currentYear: { id: 'y' },
        currentBoard: { id: 'b' },
        currentMedium: { id: 'm' },
      },
    }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/screens/academic/curriculum-management/reports/hooks/useAiCurriculumReport', () => ({
  useAiCurriculumReport: () => ({
    stage: 'idle',
    questions: [],
    reset: vi.fn(),
    planReport: vi.fn(),
  }),
}));

it('keeps an Attendance AI prompt until discard is explicitly confirmed', () => {
  const close = vi.fn();
  render(
    <ShikshaMitraAiReportDrawer
      open
      onClose={close}
      module="Student Attendance"
      protectUnsavedChanges
    />
  );
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Class 8 attendance this month' },
  });
  fireEvent.click(screen.getByRole('button', { name: /close/i }));
  expect(close).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('textbox')).toHaveValue('Class 8 attendance this month');
  fireEvent.click(screen.getByRole('button', { name: /close/i }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(close).toHaveBeenCalledOnce();
});
