import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { defaultSettings } from 'src/components/settings';
import { act, screen, waitFor, fireEvent } from '@testing-library/react';
import { assessmentResponse } from 'src/redux/student/admissions/assessment-test-fixture';

import { AssessmentActionDialog } from './assessment-action-dialog';

const mocks = vi.hoisted(() => ({ run: vi.fn() }));
vi.mock('./use-assessment-actions', () => ({ useAssessmentActions: () => mocks.run }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

it('keeps a waiver visibly pending, locks dismissal and preserves its reason after failure', async () => {
  let rejectWaiver!: (failure: Error) => void;
  mocks.run
    .mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        rejectWaiver = reject;
      })
    )
    .mockResolvedValueOnce(assessmentResponse);
  const onClose = vi.fn();
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AssessmentActionDialog
        action="waive"
        assessment={{ ...assessmentResponse, policy: assessmentResponse.policy!, canWaive: true }}
        admissionOfferingId="offering-1"
        workflowStageDefinitionId="definition-1"
        onClose={onClose}
      />
    </ThemeProvider>
  );
  const notes = screen.getByRole('textbox', { name: 'Notes / reason' });
  fireEvent.change(notes, { target: { value: 'Prior school assessment accepted' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mocks.run).toHaveBeenCalledOnce());
  expect(screen.getByRole('status', { name: 'Saving assessment…' })).toBeVisible();
  expect(notes).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  fireEvent.click(screen.getByRole('button', { name: 'Saving…' }));
  expect(onClose).not.toHaveBeenCalled();
  expect(mocks.run).toHaveBeenCalledOnce();

  await act(async () => rejectWaiver(new Error('Waiver could not be saved')));
  expect(screen.queryByRole('status', { name: 'Saving assessment…' })).not.toBeInTheDocument();
  expect(notes).toHaveValue('Prior school assessment accepted');
  expect(notes).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
});
