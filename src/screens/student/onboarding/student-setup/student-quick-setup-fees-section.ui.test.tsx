import { vi, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, fireEvent } from '@testing-library/react';

import StudentQuickSetupFeesSection from './student-quick-setup-fees-section';

import type { StudentOnboardingFeesState } from './student-onboarding-fees';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));

const base = {
  dirty: false,
  busy: false,
  loading: false,
  canSave: true,
  confirmed: true,
  structureName: 'Class 1 Fees',
};
const view = (state: StudentOnboardingFeesState = base, disabled = false) => (
  <ThemeProvider theme={createTheme()}>
    <StudentQuickSetupFeesSection caseId="case" state={state} disabled={disabled}>
      <input aria-label="Fee draft" defaultValue="Saved draft" />
    </StudentQuickSetupFeesSection>
  </ThemeProvider>
);

it('keeps confirmed fees compact and preserves drafts while expanding and collapsing', () => {
  render(view());
  const draft = screen.getByLabelText('Fee draft');
  expect(screen.getByText('Class 1 Fees')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Expand fees' })).toHaveAttribute(
    'aria-expanded',
    'false'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Expand fees' }));
  fireEvent.change(draft, { target: { value: 'Unsaved draft' } });
  fireEvent.click(screen.getByRole('button', { name: 'Collapse fees' }));
  fireEvent.click(screen.getByRole('button', { name: 'Expand fees' }));
  expect(screen.getByRole('textbox', { name: 'Fee draft' })).toBe(draft);
  expect(draft).toHaveValue('Unsaved draft');
});

it('opens incomplete fees and reopens an error after the staff collapse it', () => {
  const state = { ...base, confirmed: false };
  const result = render(view(state));
  expect(screen.getByRole('button', { name: 'Collapse fees' })).toHaveAttribute(
    'aria-expanded',
    'true'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Collapse fees' }));
  result.rerender(view({ ...state, hasError: true }));
  expect(screen.getByRole('button', { name: 'Collapse fees' })).toHaveAttribute(
    'aria-expanded',
    'true'
  );
});

it('locks the accordion while the parent is saving', () => {
  render(view(base, true));
  expect(screen.getByRole('button', { name: 'Expand fees' })).toBeDisabled();
});

it('opens failed initial fee reads without leaving a loading skeleton', () => {
  render(view({ ...base, loading: true, hasError: true, confirmed: false }));
  expect(screen.getByRole('button', { name: 'Collapse fees' })).toHaveAttribute(
    'aria-expanded',
    'true'
  );
  expect(document.querySelector('.MuiSkeleton-root')).toBeNull();
});
